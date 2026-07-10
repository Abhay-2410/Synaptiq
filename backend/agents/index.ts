import '../load-env.js';
import { Mastra } from '@mastra/core';
import { quickCheckAgent, QUICK_CHECK_AGENT_ID } from './quick-check.agent.js';
import { retrieverAgent, RETRIEVER_AGENT_ID } from './retriever.agent.js';
import { tutorAgent, TUTOR_AGENT_ID } from './tutor.agent.js';
import { getQdrantVector } from '../integrations/qdrant-store.js';
import { qdrantVectorId } from '../integrations/strict-config.js';
import { DOUBT_WORKFLOW_ID, doubtWorkflow } from '../workflows/doubt.workflow.js';

/**
 * Root Mastra instance — agents, Qdrant vector store, and doubt workflow.
 * Mastra Express adapter mounts /api/agents/* and workflow routes from here.
 */
export const mastra = new Mastra({
  agents: {
    [TUTOR_AGENT_ID]: tutorAgent,
    [QUICK_CHECK_AGENT_ID]: quickCheckAgent,
    [RETRIEVER_AGENT_ID]: retrieverAgent,
  },
  vectors: {
    [qdrantVectorId()]: getQdrantVector(),
  },
  workflows: {
    [DOUBT_WORKFLOW_ID]: doubtWorkflow,
  },
});

export const MASTRA_AGENT_IDS = [TUTOR_AGENT_ID, QUICK_CHECK_AGENT_ID, RETRIEVER_AGENT_ID];
export const MASTRA_WORKFLOW_IDS = [DOUBT_WORKFLOW_ID];

export {
  checkLlmProviderAtStartup,
  describeQuickCheckModel,
  describeTutorModel,
  getLlmProvider,
  isGroqReachable,
  isLlmProviderConfigured,
  resolveQuickCheckModel,
  resolveTutorModel,
} from './llm-provider.js';
export { TUTOR_AGENT_ID, tutorAgent, QUICK_CHECK_AGENT_ID, quickCheckAgent };
export { RETRIEVER_AGENT_ID, retrieverAgent };
