/**
 * Strict stack integration smoke test — Mastra workflow + Qdrant + Enkrypt path.
 * Run: npm run test:stack
 */
import '../load-env.js';
import { checkStackHealth } from '../integrations/health.js';
import { requireLiveQdrant } from '../integrations/strict-config.js';
import { MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS } from '../agents/index.js';
import { runDoubtPipeline } from '../pipeline/index.js';

async function main() {
  const health = await checkStackHealth(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);
  console.log('Stack health:', JSON.stringify(health, null, 2));

  if (requireLiveQdrant() && (health.qdrant.status === 'offline' || health.qdrant.vectorCount === 0)) {
    console.error('FAIL: Qdrant not ready — start Qdrant (docker compose up -d) and run npm run seed:qdrant');
    process.exit(1);
  }

  const events: string[] = [];
  const result = await runDoubtPipeline(
    {
      text: 'How do I solve x^2 - 5x + 6 = 0?',
      classLevel: 10,
      subjectId: 'math',
    },
    {
      requestId: 'stack-test',
      emit: (e) => events.push(e.type),
      streamTokens: false,
    },
  );

  const requiredEvents = ['integration_status', 'retrieval', 'reasoning_steps', 'verification', 'agent_trail', 'done'];
  const missing = requiredEvents.filter((t) => !events.includes(t));

  if (missing.length > 0) {
    console.error('FAIL: missing SSE events:', missing.join(', '));
    process.exit(1);
  }

  console.log('PASS: Mastra workflow pipeline');
  console.log(`  Qdrant: ${health.qdrant.status} (${health.qdrant.vectorCount} vectors)`);
  console.log(`  Chunks retrieved: ${result.retrievedChunks.length}`);
  console.log(`  Verification: ${result.verification.status} (stub=${result.verification.usedStub})`);
  console.log(`  Events: ${events.join(' → ')}`);

  if (health.ready) {
    console.log('PASS: Full strict stack is LIVE');
  } else {
    console.log('WARN: Stack not fully live — see warnings above');
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exit(1);
});
