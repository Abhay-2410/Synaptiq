/**
 * Sponsor stack confirmation — Mastra + Qdrant + Enkrypt all live.
 * Run: npm run test:sponsor
 */
import '../load-env.js';
import { checkStackHealth } from '../integrations/health.js';
import { MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS } from '../agents/index.js';
import { runDoubtPipeline } from '../pipeline/index.js';
import { retrieveFromMastraQdrant } from '../integrations/qdrant-retrieval.js';

const failures: string[] = [];

function assert(cond: boolean, msg: string) {
  if (!cond) failures.push(msg);
}

async function main() {
  console.log('═══ Synaptiq Sponsor Stack Verification ═══\n');

  const health = await checkStackHealth(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);
  console.log('Health:', JSON.stringify(health, null, 2));

  assert(health.mastra.agents.length >= 3, 'Mastra: need 3+ agents');
  assert(health.mastra.workflows.includes('synaptiq-doubt-pipeline'), 'Mastra: doubt workflow registered');
  assert(health.mastra.vectorStore === 'qdrant', 'Mastra: Qdrant vector store registered');
  assert(health.qdrant.status === 'live', `Qdrant: expected live, got ${health.qdrant.status}`);
  assert(health.qdrant.vectorCount > 0, 'Qdrant: collection empty');
  assert(health.enkrypt.status === 'live', `Enkrypt: expected live, got ${health.enkrypt.status}`);
  assert(health.ready === true, 'Stack ready flag false');

  const qdrantHits = await retrieveFromMastraQdrant({
    text: 'How do I solve x^2 - 5x + 6 = 0?',
    classLevel: 10,
    subjectId: 'math',
  });
  assert(qdrantHits.length > 0, 'Qdrant: no hits for quadratic doubt');
  const hasQuadraticTopic = qdrantHits.some((h) =>
    /quadratic|equation|factor|roots/i.test(`${h.metadata.topic} ${h.content}`),
  );
  assert(hasQuadraticTopic, 'Qdrant: top hits should include quadratic-related syllabus');

  // Light pipeline check (math only — avoids Enkrypt rate limits from back-to-back probes)
  await new Promise((r) => setTimeout(r, 2000));

  const events: string[] = [];
  const result = await runDoubtPipeline(
    {
      text: 'How do I solve x^2 - 5x + 6 = 0?',
      classLevel: 10,
      subjectId: 'math',
    },
    {
      requestId: 'sponsor-confirm',
      emit: (e) => events.push(e.type),
      streamTokens: false,
    },
  );

  assert(events.includes('integration_status'), 'Pipeline: missing integration_status SSE');
  assert(events.includes('verification'), 'Pipeline: missing verification SSE');
  assert(result.verification.usedStub === false, 'Enkrypt: still using stub in pipeline');
  assert(result.retrievedChunks.length > 0, 'Pipeline: math doubt returned no Qdrant chunks');
  assert(result.agentTrail.some((s) => s.id === 'mastra-orchestration'), 'Pipeline: missing Mastra trail step');

  if (failures.length > 0) {
    console.error('\nFAILURES:');
    for (const f of failures) console.error(`  ✗ ${f}`);
    process.exit(1);
  }

  console.log('\n✓ PASS: Mastra + Qdrant + Enkrypt integrated and live');
  console.log(`  Qdrant vectors: ${health.qdrant.vectorCount}`);
  console.log(`  Math retrieval: ${qdrantHits.length} chunks (${qdrantHits[0]?.metadata.topic})`);
  console.log(`  Math pipeline: ${result.retrievedChunks.length} chunks, Enkrypt ${result.verification.status}`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
