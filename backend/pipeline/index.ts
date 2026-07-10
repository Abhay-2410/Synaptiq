import { randomUUID } from 'node:crypto';
import { mastra, MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS } from '../agents/index.js';
import { checkStackHealth } from '../integrations/health.js';
import {
  clearProgressReporter,
  setProgressReporter,
} from '../integrations/progress.js';
import { DOUBT_WORKFLOW_ID } from '../workflows/doubt.workflow.js';
import { withTimeout } from './lib/with-timeout.js';
import { buildAgentTrail } from './lib/agent-trail.js';
import {
  clearPipelineRequestId,
  logStageEnd,
  logStageError,
  logStageStart,
  setPipelineRequestId,
} from './lib/pipeline-log.js';
import {
  createQuickCheckSession,
  getMasteryState,
  shouldOfferQuickCheck,
  abandonActiveChallengeSession,
} from './stages/learning.js';
import type {
  AskStreamEvent,
  DoubtRequest,
  PipelineResult,
  QuickCheckSession,
  RetrievedChunk,
  SubjectKey,
  TutorDraft,
  VerificationResult,
} from './types.js';

function resolvePipelineSubjectId(doubt: DoubtRequest, chunks: RetrievedChunk[]): SubjectKey {
  if (doubt.subjectId) return doubt.subjectId;
  if (chunks[0]?.metadata.subjectKey) return chunks[0].metadata.subjectKey;
  const text = doubt.text.toLowerCase();
  if (/quadratic|polynomial|algebra|geometry|trigonometry|calculus|\d+\s*x/.test(text)) return 'math';
  if (/photosynthesis|cell|mitosis|organism|biology|dna|gene/i.test(text)) return 'biology';
  if (/acid|base|mole|chemical|reaction|compound|element/i.test(text)) return 'chemistry';
  if (/force|velocity|acceleration|newton|electric|magnetic|optics|physics/i.test(text)) return 'physics';
  if (/ledger|journal|debit|credit|account|balance sheet|trial balance/i.test(text)) return 'accountancy';
  if (/demand|supply|gdp|inflation|microeconomics|macroeconomics/i.test(text)) return 'economics';
  if (/marketing|management|business|entrepreneur/i.test(text)) return 'business';
  if (/gandhi|freedom|nationalism|history|empire|revolt/i.test(text)) return 'history';
  if (/constitution|democracy|federal|parliament|political/i.test(text)) return 'political_science';
  if (/grammar|reported speech|essay|poem|literature|comprehension/i.test(text)) return 'english';
  if (/geography|climate|resources|democracy|civics|social/i.test(text)) return 'social';
  return doubt.classLevel && doubt.classLevel <= 10 ? 'science' : 'english';
}

export type {
  AskStreamEvent,
  DoubtRequest,
  PipelineResult,
  ReasoningStep,
  RetrievedChunk,
  TutorDraft,
  VerificationInput,
  VerificationResult,
  QuickCheckSession,
  MasteryState,
  AgentTrailStep,
  QuickCheckEvaluationResult,
} from './types.js';

export interface PipelineCallbacks {
  emit: (event: AskStreamEvent) => void;
  streamTokens?: boolean;
  requestId?: string;
}

const PIPELINE_TIMEOUT_MS = Number(process.env.PIPELINE_TIMEOUT_MS) || 45_000;

async function runDoubtPipelineInner(
  doubt: DoubtRequest,
  callbacks: PipelineCallbacks,
): Promise<PipelineResult> {
  const sessionId = doubt.sessionId ?? randomUUID();
  const requestId = callbacks.requestId ?? randomUUID().slice(0, 8);
  setPipelineRequestId(requestId);

  if (doubt.sessionId) {
    abandonActiveChallengeSession(sessionId);
  }

  setProgressReporter(requestId, callbacks);

  try {
    const stackHealth = await checkStackHealth(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);
    const stackSnapshot = {
      strictMode: stackHealth.strictMode,
      ready: stackHealth.ready,
      mastra: {
        agents: stackHealth.mastra.agents,
        workflows: stackHealth.mastra.workflows,
        vectorStore: stackHealth.mastra.vectorStore,
      },
      qdrant: {
        status: stackHealth.qdrant.status,
        indexName: stackHealth.qdrant.indexName,
        vectorCount: stackHealth.qdrant.vectorCount,
        provider: stackHealth.qdrant.provider,
      },
      enkrypt: {
        status: stackHealth.enkrypt.status,
        policyName: stackHealth.enkrypt.policyName,
      },
      warnings: stackHealth.warnings,
    };
    callbacks.emit({ type: 'integration_status', stack: stackSnapshot });

    const workflow = mastra.getWorkflow(DOUBT_WORKFLOW_ID);
    const run = await workflow.createRun();
    logStageStart('mastra-workflow', DOUBT_WORKFLOW_ID);

    const workflowResult = await run.start({
      inputData: {
        doubt,
        requestId,
        streamTokens: callbacks.streamTokens !== false,
      },
    });

    if (workflowResult.status !== 'success' || !workflowResult.result) {
      const errMsg =
        workflowResult.status === 'failed'
          ? 'Mastra workflow failed during doubt processing'
          : `Mastra workflow ended with status: ${workflowResult.status}`;
      throw new Error(errMsg);
    }

    logStageEnd('mastra-workflow', 'retrieve → tutor → verify complete');

    const {
      retrievedChunks,
      draft,
      verification,
      retrievalSource,
    } = workflowResult.result as {
      retrievedChunks: RetrievedChunk[];
      draft: TutorDraft;
      verification: VerificationResult;
      retrievalSource: 'mastra-qdrant' | 'corpus-fallback';
    };

    const topic = retrievedChunks[0]?.metadata.topic ?? 'General';
    const subjectId = resolvePipelineSubjectId(doubt, retrievedChunks);

    const classLabel = doubt.classLevel ? `Class ${doubt.classLevel}` : 'any class';
    const streamLabel = doubt.stream ? `, stream ${doubt.stream}` : '';

    const agentTrail = buildAgentTrail({
      retrievedChunks,
      draft,
      verification,
      retrievalSource,
      classLabel,
      streamLabel,
      subjectId,
      boardId: doubt.boardId ?? 'cbse',
    });

    callbacks.emit({ type: 'agent_trail', trail: [...agentTrail] });

    const deliveredAnswer = verification.answer;
    const answeredWithoutRetrieval = retrievedChunks.length === 0;
    let quickCheckSession: QuickCheckSession | undefined;
    let mastery = getMasteryState(sessionId, topic, subjectId);

    if (shouldOfferQuickCheck(deliveredAnswer, verification.status)) {
      const generated = createQuickCheckSession(
        doubt.text,
        deliveredAnswer,
        retrievedChunks,
        subjectId,
        doubt.classLevel,
        sessionId,
      );
      if (generated) {
        quickCheckSession = generated;
        mastery = getMasteryState(sessionId, quickCheckSession.topic, quickCheckSession.subjectId);
        callbacks.emit({ type: 'quick_check_session', session: quickCheckSession, mastery });
      }
    }

    const result: PipelineResult = {
      sessionId,
      doubt: doubt.text,
      retrievedChunks,
      draft,
      verification,
      agentTrail: [...agentTrail],
      ...(quickCheckSession ? { quickCheckSession, mastery } : { mastery }),
      answeredWithoutRetrieval,
      stackHealth: stackSnapshot,
    };

    logStageStart('response', 'emitting done event');
    callbacks.emit({ type: 'done', result });
    logStageEnd('response', 'done event sent');
    return result;
  } catch (err) {
    logStageError('pipeline', 'stage failed', err);
    throw err;
  } finally {
    clearProgressReporter(requestId);
    clearPipelineRequestId();
  }
}

/**
 * Mastra workflow: Qdrant retrieve → Tutor agent → Enkrypt verify → response
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
