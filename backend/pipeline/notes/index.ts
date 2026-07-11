import { randomUUID } from 'node:crypto';
import { mastra } from '../../agents/index.js';
import {
  clearNotesProgressReporter,
  setNotesProgressReporter,
} from '../../integrations/notes-progress.js';
import { NOTES_WORKFLOW_ID } from '../../workflows/notes.workflow.js';
import { buildNotesAgentTrail } from '../lib/agent-trail.js';
import { withTimeout } from '../lib/with-timeout.js';
import type { NotesSimplifyResult, NotesStreamEvent, NotesStudyContext } from './types.js';

const PIPELINE_TIMEOUT_MS = Number(process.env.NOTES_PIPELINE_TIMEOUT_MS) || 90_000;

export type NotesProgressCallback = (event: NotesStreamEvent) => void;

export async function runNotesSimplifier(
  file: { buffer: Buffer; mimeType: string; originalname: string },
  context: NotesStudyContext,
  emit: NotesProgressCallback,
  requestId?: string,
): Promise<NotesSimplifyResult> {
  return withTimeout(
    runNotesSimplifierInner(file, context, emit, requestId),
    PIPELINE_TIMEOUT_MS,
    'Notes simplifier pipeline',
  ).catch((err) => {
    const msg =
      err instanceof Error && /timed out/i.test(err.message)
        ? 'Notes simplification took too long. Try a smaller file or a clearer photo.'
        : err instanceof Error
          ? err.message
          : 'Notes simplification failed.';
    emit({ type: 'error', message: msg });
    throw new Error(msg);
  });
}

async function runNotesSimplifierInner(
  file: { buffer: Buffer; mimeType: string; originalname: string },
  context: NotesStudyContext,
  emit: NotesProgressCallback,
  requestId?: string,
): Promise<NotesSimplifyResult> {
  const rid = requestId ?? randomUUID().slice(0, 8);
  setNotesProgressReporter(rid, emit);

  try {
    const workflow = mastra.getWorkflow(NOTES_WORKFLOW_ID);
    const run = await workflow.createRun();

    const workflowResult = await run.start({
      inputData: {
        fileBase64: file.buffer.toString('base64'),
        mimeType: file.mimeType,
        originalname: file.originalname,
        context,
        requestId: rid,
      },
    });

    if (workflowResult.status !== 'success' || !workflowResult.result) {
      const failed = workflowResult as { error?: unknown; status: string };
      const root =
        failed.error instanceof Error
          ? failed.error.message
          : typeof failed.error === 'string'
            ? failed.error
            : failed.error != null
              ? JSON.stringify(failed.error)
              : undefined;
      const errMsg =
        workflowResult.status === 'failed'
          ? root ?? 'Mastra notes workflow failed'
          : `Mastra notes workflow ended with status: ${workflowResult.status}`;
      throw new Error(errMsg);
    }

    const out = workflowResult.result;
    const resolved = out.resolvedContext as {
      subjectId: NotesStudyContext['subjectId'];
      subjectLabel: string;
      pdfFileName: string;
      subjectDetection: { adjustedFromUser: boolean };
      boardId: NotesStudyContext['boardId'];
      classLevel: NotesStudyContext['classLevel'];
      streamId?: NotesStudyContext['streamId'];
    };

    const trailContext: NotesStudyContext = {
      boardId: resolved.boardId,
      subjectId: resolved.subjectId,
      classLevel: resolved.classLevel,
      streamId: resolved.streamId,
    };

    const agentTrail = buildNotesAgentTrail({
      context: trailContext,
      subjectLabel: resolved.subjectLabel,
      subjectAdjusted: resolved.subjectDetection.adjustedFromUser,
      extractionMethod: out.extractionMethod,
      extractionQuality: out.extractionQuality,
      model: out.model,
      warnings: out.warnings,
    });

    const result: NotesSimplifyResult = {
      extractedPreview: out.extractedPreview,
      extractionQuality: out.extractionQuality,
      extractionMethod: out.extractionMethod,
      simplifiedMarkdown: out.simplifiedMarkdown,
      pdfBase64: out.pdfBase64,
      warnings: out.warnings,
      model: out.model,
      agentTrail,
      resolvedSubjectId: resolved.subjectId,
      resolvedSubjectLabel: resolved.subjectLabel,
      pdfFileName: resolved.pdfFileName,
      subjectAdjusted: resolved.subjectDetection.adjustedFromUser,
    };

    emit({ type: 'agent_trail', trail: agentTrail });
    emit({ type: 'status', stage: 'done', message: 'Ready to download.' });
    emit({ type: 'done', result });
    return result;
  } finally {
    clearNotesProgressReporter(rid);
  }
}
