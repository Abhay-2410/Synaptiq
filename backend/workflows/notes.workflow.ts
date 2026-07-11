import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { getNotesProgressReporter } from '../integrations/notes-progress.js';
import { resolveNotesContext } from '../pipeline/notes/detect-subject.js';
import { extractTextFromUpload } from '../pipeline/notes/extract-text.js';
import { generateNotesPdf, pdfToBase64 } from '../pipeline/notes/generate-pdf.js';
import { simplifyNotesText } from '../pipeline/notes/simplify-notes.js';
import type { NotesStudyContext } from '../pipeline/notes/types.js';

export const NOTES_WORKFLOW_ID = 'synaptiq-notes-pipeline';

const contextSchema = z.object({
  boardId: z.enum(['cbse', 'icse']),
  subjectId: z.string(),
  classLevel: z.number(),
  streamId: z.enum(['pcm', 'pcb', 'commerce', 'humanities']).optional(),
});

const resolvedContextSchema = contextSchema.extend({
  subjectLabel: z.string(),
  pdfFileName: z.string(),
  subjectDetection: z.object({
    subjectId: z.string(),
    subjectLabel: z.string(),
    confidence: z.number(),
    source: z.enum(['text', 'filename', 'user']),
    adjustedFromUser: z.boolean(),
  }),
});

const workflowInputSchema = z.object({
  fileBase64: z.string(),
  mimeType: z.string(),
  originalname: z.string(),
  context: contextSchema,
  requestId: z.string(),
});

const afterExtractSchema = workflowInputSchema.extend({
  extractedText: z.string(),
  extractionQuality: z.enum(['good', 'poor', 'failed']),
  extractionMethod: z.enum(['pdf-text', 'ocr-image', 'ocr-pdf']),
  resolvedContext: resolvedContextSchema,
});

const afterSimplifySchema = afterExtractSchema.extend({
  simplifiedMarkdown: z.string(),
  warnings: z.array(z.string()),
  model: z.string(),
});

const workflowOutputSchema = afterSimplifySchema.extend({
  extractedPreview: z.string(),
  pdfBase64: z.string(),
});

const extractStep = createStep({
  id: 'extract',
  inputSchema: workflowInputSchema,
  outputSchema: afterExtractSchema,
  execute: async ({ inputData }) => {
    const reporter = getNotesProgressReporter(inputData.requestId);
    reporter?.({ type: 'status', stage: 'upload', message: 'Got your notes!' });
    reporter?.({ type: 'status', stage: 'extract', message: 'Reading your notes…' });

    const buffer = Buffer.from(inputData.fileBase64, 'base64');
    const extraction = await extractTextFromUpload(buffer, inputData.mimeType, inputData.originalname);

    if (extraction.quality === 'failed' || !extraction.text.trim()) {
      const message =
        'We could not read your notes. Please retake the photo in good light with the page flat, or upload a clearer PDF.';
      reporter?.({ type: 'error', message });
      throw new Error(message);
    }

    const userContext = inputData.context as NotesStudyContext;
    const resolvedContext = resolveNotesContext(
      extraction.text,
      inputData.originalname,
      userContext,
    );

    if (resolvedContext.subjectDetection.adjustedFromUser) {
      reporter?.({
        type: 'status',
        stage: 'extract',
        message: `Detected ${resolvedContext.subjectLabel} notes — tailoring your study sheet…`,
      });
    }

    return {
      ...inputData,
      extractedText: extraction.text,
      extractionQuality: extraction.quality,
      extractionMethod: extraction.method,
      resolvedContext,
    };
  },
});

const simplifyStep = createStep({
  id: 'simplify',
  inputSchema: afterExtractSchema,
  outputSchema: afterSimplifySchema,
  execute: async ({ inputData }) => {
    const reporter = getNotesProgressReporter(inputData.requestId);
    const resolvedContext = inputData.resolvedContext as ReturnType<typeof resolveNotesContext>;

    reporter?.({
      type: 'status',
      stage: 'simplify',
      message: `Rewriting your ${resolvedContext.subjectLabel} notes with key points & examples…`,
    });

    const simplified = await simplifyNotesText(
      inputData.extractedText,
      resolvedContext,
      inputData.extractionQuality,
    );

    return {
      ...inputData,
      simplifiedMarkdown: simplified.markdown,
      warnings: simplified.warnings,
      model: simplified.model,
    };
  },
});

const pdfStep = createStep({
  id: 'pdf',
  inputSchema: afterSimplifySchema,
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => {
    const reporter = getNotesProgressReporter(inputData.requestId);
    const resolvedContext = inputData.resolvedContext as ReturnType<typeof resolveNotesContext>;

    reporter?.({
      type: 'status',
      stage: 'pdf',
      message: `Making your ${resolvedContext.subjectLabel} study sheet…`,
    });

    const pdfBytes = await generateNotesPdf(inputData.simplifiedMarkdown, {
      subjectLabel: resolvedContext.subjectLabel,
      classLevel: resolvedContext.classLevel as NotesStudyContext['classLevel'],
    });
    const pdfBase64 = pdfToBase64(pdfBytes);

    return {
      ...inputData,
      extractedPreview: inputData.extractedText.slice(0, 400),
      pdfBase64,
    };
  },
});

export const notesWorkflow = createWorkflow({
  id: NOTES_WORKFLOW_ID,
  description: 'Synaptiq notes pipeline — OCR/PDF extract → subject detect → Tutor enrich → PDF',
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(extractStep)
  .then(simplifyStep)
  .then(pdfStep)
  .commit();
