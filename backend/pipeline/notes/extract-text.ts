import { createWorker } from 'tesseract.js';
import { PDFParse } from 'pdf-parse';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import { withTimeout } from '../lib/with-timeout.js';
import { scoreExtractionQuality } from './quality.js';
import type { ExtractionQuality } from './types.js';

const OCR_TIMEOUT_MS = Number(process.env.NOTES_OCR_TIMEOUT_MS) || 45_000;
const MIN_PDF_TEXT_CHARS = Number(process.env.NOTES_MIN_PDF_TEXT_CHARS) || 80;

let ocrWarmed = false;

export function isOcrWarmed(): boolean {
  return ocrWarmed;
}

/** Pre-download Tesseract eng model so the first student upload is not slow. */
export async function warmupNotesOcr(): Promise<void> {
  if (ocrWarmed) return;
  try {
    const worker = await createWorker('eng', 1, { logger: () => {} });
    await worker.terminate();
    ocrWarmed = true;
    console.log('[notes] OCR engine warmed (Tesseract eng)');
  } catch (err) {
    console.warn(
      '[notes] OCR warmup failed — first photo upload may take longer:',
      err instanceof Error ? err.message : err,
    );
  }
}

export interface ExtractionResult {
  text: string;
  quality: ExtractionQuality;
  method: 'pdf-text' | 'ocr-image' | 'ocr-pdf';
}

async function ocrImageBuffer(buffer: Buffer): Promise<string> {
  const worker = await createWorker('eng', 1, {
    logger: () => {},
  });
  try {
    const { data } = await worker.recognize(buffer);
    return data.text ?? '';
  } finally {
    await worker.terminate();
  }
}

async function ocrPdfPages(buffer: Buffer, maxPages = 3): Promise<string> {
  const loadingTask = getDocument({ data: new Uint8Array(buffer), useSystemFonts: true });
  const pdf = await loadingTask.promise;
  const parts: string[] = [];

  const pageCount = Math.min(pdf.numPages, maxPages);
  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    await page.render({
      canvas: canvas as never,
      canvasContext: context as never,
      viewport,
    }).promise;

    const pngBuffer = canvas.toBuffer('image/png');
    const pageText = await ocrImageBuffer(pngBuffer);
    if (pageText.trim()) parts.push(pageText.trim());
  }

  return parts.join('\n\n');
}

async function extractFromPdf(buffer: Buffer): Promise<ExtractionResult> {
  let parsedText = '';
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    parsedText = (result.text ?? '').trim();
    await parser.destroy();
  } catch {
    parsedText = '';
  }

  if (parsedText.length >= MIN_PDF_TEXT_CHARS) {
    const quality = scoreExtractionQuality(parsedText);
    if (quality !== 'failed') {
      return { text: parsedText, quality, method: 'pdf-text' };
    }
  }

  const ocrText = await ocrPdfPages(buffer);
  const quality = scoreExtractionQuality(ocrText);
  return { text: ocrText, quality, method: 'ocr-pdf' };
}

async function extractFromImage(buffer: Buffer): Promise<ExtractionResult> {
  const text = await ocrImageBuffer(buffer);
  const quality = scoreExtractionQuality(text);
  return { text, quality, method: 'ocr-image' };
}

export async function extractTextFromUpload(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractionResult> {
  const lower = filename.toLowerCase();
  const isPdf = mimeType === 'application/pdf' || lower.endsWith('.pdf');
  const isImage =
    mimeType.startsWith('image/') || /\.(jpe?g|png)$/i.test(lower);

  if (isPdf) {
    return withTimeout(extractFromPdf(buffer), OCR_TIMEOUT_MS, 'PDF text extraction');
  }

  if (isImage) {
    return withTimeout(extractFromImage(buffer), OCR_TIMEOUT_MS, 'Image OCR');
  }

  throw new Error('Unsupported file type. Please upload a JPG, PNG, or PDF.');
}
