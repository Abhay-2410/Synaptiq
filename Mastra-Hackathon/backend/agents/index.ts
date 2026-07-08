import { Mastra } from '@mastra/core';
import { tutorAgent, TUTOR_AGENT_ID } from './tutor.agent.js';

/**
 * Step 3 registers the real Tutor Agent here.
 * Mastra Express adapter mounts /api/agents/* from this instance.
 */
export const mastra = new Mastra({
  agents: {
    [TUTOR_AGENT_ID]: tutorAgent,
  },
});

export { TUTOR_AGENT_ID, tutorAgent };
