import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { getProgressReporter } from '../integrations/progress.js';
import { allowCorpusFallback } from '../integrations/strict-config.js';
import { retrieveContext } from '../pipeline/stages/retrieve.js';
import { generateTutorDraft } from '../pipeline/stages/tutor.js';
import { runVerification } from '../pipeline/stages/verify.js';
import type { DoubtRequest, RetrievedChunk, TutorDraft, VerificationResult } from '../pipeline/types.js';

export const DOUBT_WORKFLOW_ID = 'synaptiq-doubt-pipeline';

const doubtSchema = z.object({
  text: z.string(),
  imageUrl: z.string().optional(),
  sessionId: z.string().optional(),
  priorMessages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      }),
    )
    .optional(),
  subjectId: z.string().optional(),
  classLevel: z.number().optional(),
  stream: z.string().optional(),
  boardId: z.enum(['cbse', 'icse']).optional(),
});

const workflowInputSchema = z.object({
  doubt: doubtSchema,
  requestId: z.string(),
  streamTokens: z.boolean().optional(),
});

const afterRetrieveSchema = workflowInputSchema.extend({
  retrievedChunks: z.array(z.any()),
  retrievalSource: z.enum(['mastra-qdrant', 'corpus-fallback', 'no-match']),
});

const afterTutorSchema = afterRetrieveSchema.extend({
  draft: z.any(),
});

const workflowOutputSchema = afterTutorSchema.extend({
  verification: z.any(),
});

const retrieveStep = createStep({
  id: 'retrieve',
  inputSchema: workflowInputSchema,
  outputSchema: afterRetrieveSchema,
  execute: async ({ inputData }) => {
    const doubt = inputData.doubt as DoubtRequest;
    const reporter = getProgressReporter(inputData.requestId);

    reporter?.emit({
      type: 'status',
      stage: 'retrieval',
      message: 'Mastra → Qdrant: searching syllabus corpus…',
    });

    const retrievedChunks = (await retrieveContext(doubt)) as RetrievedChunk[];
    const retrievalSource =
      retrievedChunks.length === 0
        ? ('no-match' as const)
        : allowCorpusFallback() &&
            retrievedChunks.some((c) => c.metadata.source === 'corpus-fallback')
          ? ('corpus-fallback' as const)
          : ('mastra-qdrant' as const);

    reporter?.emit({ type: 'retrieval', chunks: retrievedChunks });

    return {
      ...inputData,
      retrievedChunks,
      retrievalSource,
    };
  },
});

const tutorStep = createStep({
  id: 'tutor',
  inputSchema: afterRetrieveSchema,
  outputSchema: afterTutorSchema,
  execute: async ({ inputData }) => {
    const doubt = inputData.doubt as DoubtRequest;
    const reporter = getProgressReporter(inputData.requestId);
    const streamTokens = inputData.streamTokens !== false;

    reporter?.emit({
      type: 'status',
      stage: 'tutor',
      message: 'Mastra Tutor agent: generating grounded explanation…',
    });

    const draft = (await generateTutorDraft(
      doubt,
      inputData.retrievedChunks as RetrievedChunk[],
      streamTokens
        ? { onChunk: (delta) => reporter?.emit({ type: 'tutor_chunk', delta }) }
        : {},
    )) as TutorDraft;

    reporter?.emit({ type: 'reasoning_steps', steps: draft.reasoningSteps });

    return {
      ...inputData,
      draft,
    };
  },
});

const verifyStep = createStep({
  id: 'verify',
  inputSchema: afterTutorSchema,
  outputSchema: workflowOutputSchema,
  execute: async ({ inputData }) => {
    const doubt = inputData.doubt as DoubtRequest;
    const draft = inputData.draft as TutorDraft;
    const reporter = getProgressReporter(inputData.requestId);

    reporter?.emit({
      type: 'status',
      stage: 'verification',
      message: 'Enkrypt AI: verifying answer before delivery…',
    });

    const verification = (await runVerification({
      doubt: doubt.text,
      draft,
      retrievedContext: inputData.retrievedChunks as RetrievedChunk[],
    })) as VerificationResult;

    reporter?.emit({ type: 'verification', result: verification });

    return {
      ...inputData,
      verification,
    };
  },
});

export const doubtWorkflow = createWorkflow({
  id: DOUBT_WORKFLOW_ID,
  description: 'Synaptiq doubt pipeline — Qdrant retrieval → Mastra Tutor → Enkrypt verification',
  inputSchema: workflowInputSchema,
  outputSchema: workflowOutputSchema,
})
  .then(retrieveStep)
  .then(tutorStep)
  .then(verifyStep)
  .commit();
