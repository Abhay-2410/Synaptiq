import { randomUUID } from 'node:crypto';
import { withTimeout } from './lib/with-timeout.js';
import { retrieveContext } from './stages/retrieve.js';
import { generateTutorDraft } from './stages/tutor.js';
import { runVerification } from './stages/verify.js';
import { createQuickCheck, getMasteryState } from './stages/learning.js';
import type { AskStreamEvent, DoubtRequest, PipelineResult } from './types.js';

export type {
  AskStreamEvent,
  DoubtRequest,
  PipelineResult,
  ReasoningStep,
  RetrievedChunk,
  TutorDraft,
  VerificationInput,
  VerificationResult,
  QuickCheck,
  MasteryState,
  AgentTrailStep,
  QuickCheckEvaluationResult,
} from './types.js';

export interface PipelineCallbacks {
  emit: (event: AskStreamEvent) => void;
  /** When false, tutor stage skips simulated token delays (JSON /ask). */
  streamTokens?: boolean;
}

const PIPELINE_TIMEOUT_MS = Number(process.env.PIPELINE_TIMEOUT_MS) || 120_000;

async function runDoubtPipelineInner(
  doubt: DoubtRequest,
  callbacks: PipelineCallbacks,
): Promise<PipelineResult> {
  const sessionId = doubt.sessionId ?? randomUUID();

  callbacks.emit({
    type: 'status',
    stage: 'retrieval',
    message: 'Searching course material and past solved problems…',
  });

  const retrievedChunks = await retrieveContext(doubt);
  callbacks.emit({ type: 'retrieval', chunks: retrievedChunks });

  callbacks.emit({
    type: 'status',
    stage: 'tutor',
    message: 'Generating a step-by-step explanation…',
  });

  const draft = await generateTutorDraft(
    doubt,
    retrievedChunks,
    callbacks.streamTokens === false
      ? {}
      : { onChunk: (delta) => callbacks.emit({ type: 'tutor_chunk', delta }) },
  );

  callbacks.emit({ type: 'reasoning_steps', steps: draft.reasoningSteps });

  callbacks.emit({
    type: 'status',
    stage: 'verification',
    message: 'Running Enkrypt verification before delivery…',
  });

  const verification = await runVerification({
    doubt: doubt.text,
    draft,
    retrievedContext: retrievedChunks,
  });

  callbacks.emit({ type: 'verification', result: verification });

  const topic = retrievedChunks[0]?.metadata.topic ?? 'General';
  const subjectId =
    doubt.subjectId ??
    retrievedChunks[0]?.metadata.subjectKey ??
    'math';

  const classLabel = doubt.classLevel ? `Class ${doubt.classLevel}` : 'any class';
  const streamLabel = doubt.stream ? `, stream ${doubt.stream}` : '';

  const agentTrail = [
    {
      id: 'retrieval',
      label: 'Qdrant retrieval',
      status: retrievedChunks.length > 0 ? 'completed' : 'flagged',
      summary:
        retrievedChunks.length > 0
          ? `Retrieved ${retrievedChunks.length} source${retrievedChunks.length === 1 ? '' : 's'}`
          : 'No matching course material for this class and subject',
      details:
        retrievedChunks.length > 0
          ? retrievedChunks
              .map((c) => `${c.metadata.topic ?? 'Unknown'} (${c.score.toFixed(2)})`)
              .join(', ')
          : `Filters: ${classLabel}${streamLabel}, subject: ${subjectId}`,
    },
    {
      id: 'tutor',
      label: 'Tutor agent',
      status: 'completed',
      summary: `Drafted explanation with ${draft.model}`,
      details: `Produced ${draft.reasoningSteps.length} reasoning step(s).`,
    },
    {
      id: 'verification',
      label: 'Enkrypt verification',
      status: verification.status === 'verified' ? 'completed' : verification.status,
      summary:
        verification.corrected && verification.correctionNote
          ? `Corrected: ${verification.correctionNote}`
          : verification.message ?? `Status: ${verification.status}`,
      details: `Hallucination ${verification.checks.hallucination.passed ? 'pass' : 'fail'}, adherence ${verification.checks.adherence.passed ? 'pass' : 'fail'}.`,
    },
    {
      id: 'final',
      label: 'Final answer',
      status: verification.status === 'blocked' ? 'blocked' : 'completed',
      summary:
        verification.status === 'blocked'
          ? 'Delivery blocked for safety'
          : 'Delivered verified answer to student',
    },
  ] as const;

  callbacks.emit({ type: 'agent_trail', trail: [...agentTrail] });

  const quickCheck = createQuickCheck(doubt.text, retrievedChunks, subjectId);
  const mastery = getMasteryState(sessionId, topic, subjectId);
  callbacks.emit({ type: 'quick_check', quickCheck, mastery });

  const result: PipelineResult = {
    sessionId,
    doubt: doubt.text,
    retrievedChunks,
    draft,
    verification,
    agentTrail: [...agentTrail],
    quickCheck,
    mastery,
  };

  callbacks.emit({ type: 'done', result });
  return result;
}

/**
 * retrieve (Qdrant) → tutor (Mastra) → verify (Enkrypt) → response
 */
export async function runDoubtPipeline(
  doubt: DoubtRequest,
  callbacks: PipelineCallbacks,
): Promise<PipelineResult> {
  return withTimeout(
    runDoubtPipelineInner(doubt, callbacks),
    PIPELINE_TIMEOUT_MS,
    'Doubt pipeline',
  );
}
