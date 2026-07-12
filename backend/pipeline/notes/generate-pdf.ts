import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { withTimeout } from '../lib/with-timeout.js';
import type { ClassLevel } from '../curriculum/catalog.js';
import { buildNotesPdfFileName } from './detect-subject.js';

const PDF_TIMEOUT_MS = Number(process.env.NOTES_PDF_TIMEOUT_MS) || 15_000;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const BODY_SIZE = 11;
const HEADING_SIZE = 13;

export interface NotesPdfMeta {
  subjectLabel: string;
  classLevel: ClassLevel;
  boardLabel?: string;
}

interface PdfLine {
  text: string;
  bold: boolean;
}

function markdownToLines(markdown: string): PdfLine[] {
  const lines: PdfLine[] = [];
  for (const raw of markdown.split('\n')) {
    const line = raw.trim();
    if (!line) {
      lines.push({ text: '', bold: false });
      continue;
    }
    if (line.startsWith('### ')) {
      lines.push({ text: line.replace(/^###\s+/, ''), bold: true });
      continue;
    }
    if (line.startsWith('## ')) {
      lines.push({ text: line.replace(/^##\s+/, ''), bold: true });
      continue;
    }
    if (line.startsWith('# ')) {
      lines.push({ text: line.replace(/^#\s+/, ''), bold: true });
      continue;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bullet = line.replace(/^[-*]\s+/, '');
      const cleaned = bullet
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\$([^$]+)\$/g, '$1');
      lines.push({ text: `• ${cleaned}`, bold: false });
      continue;
    }
    const cleaned = line
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\$([^$]+)\$/g, '$1');
    lines.push({ text: cleaned, bold: false });
  }
  return lines;
}

function wrapLine(text: string, font: { widthOfTextAtSize: (t: string, s: number) => number }, size: number, maxWidth: number): string[] {
  if (!text) return [''];
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      current = trial;
    } else {
      if (current) out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [''];
}

async function buildPdf(markdown: string, meta: NotesPdfMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  const title = `${meta.subjectLabel} — Class ${meta.classLevel} Study Notes`;

  const drawTitle = (t: string) => {
    const size = 16;
    page.drawText(t, { x: MARGIN, y, size, font: boldFont, color: rgb(0.1, 0.15, 0.12) });
    y -= size + 10;
  };

  drawTitle(title);
  page.drawText('Synaptiq — simplified & enriched study notes', {
    x: MARGIN,
    y,
    size: 9,
    font: bodyFont,
    color: rgb(0.35, 0.4, 0.38),
  });
  y -= 20;

  for (const entry of markdownToLines(markdown)) {
    const font = entry.bold ? boldFont : bodyFont;
    const size = entry.bold ? HEADING_SIZE : BODY_SIZE;
    const gap = entry.bold ? LINE_HEIGHT + 4 : LINE_HEIGHT;

    if (!entry.text) {
      y -= gap / 2;
      continue;
    }

    for (const wrapped of wrapLine(entry.text, font, size, maxWidth)) {
      if (y < MARGIN + size) {
        page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = PAGE_HEIGHT - MARGIN;
      }
      page.drawText(wrapped, { x: MARGIN, y, size, font, color: rgb(0.12, 0.14, 0.13) });
      y -= gap;
    }
    if (entry.bold) y -= 4;
  }

  return doc.save();
}

export async function generateNotesPdf(markdown: string, meta: NotesPdfMeta): Promise<Uint8Array> {
  return withTimeout(buildPdf(markdown, meta), PDF_TIMEOUT_MS, 'PDF generation');
}

export function pdfToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64');
}

export { buildNotesPdfFileName };
