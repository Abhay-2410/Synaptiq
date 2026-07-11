/**
 * Pre-recording demo readiness check.
 * Run: npm run test:demo-ready
 * Optional: SKIP_LLM=1 to skip Groq-dependent notes simplify step.
 */
import '../load-env.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS } from '../agents/index.js';
import { checkStackHealth } from '../integrations/health.js';
import { NOTES_WORKFLOW_ID } from '../workflows/notes.workflow.js';
import { DOUBT_WORKFLOW_ID } from '../workflows/doubt.workflow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, 'fixtures', 'notes');

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

async function main(): Promise<void> {
  console.log('Synaptiq demo-ready check\n');

  assert(MASTRA_AGENT_IDS.length >= 3, 'Expected 3+ Mastra agents registered');
  assert(
    MASTRA_WORKFLOW_IDS.includes(DOUBT_WORKFLOW_ID) && MASTRA_WORKFLOW_IDS.includes(NOTES_WORKFLOW_ID),
    'Both doubt and notes Mastra workflows must be registered',
  );
  console.log('  ✓ Mastra agents + workflows registered');

  const health = await checkStackHealth(MASTRA_AGENT_IDS, MASTRA_WORKFLOW_IDS);
  console.log(`  Qdrant: ${health.qdrant.status} (${health.qdrant.vectorCount} vectors)`);
  console.log(`  Enkrypt: ${health.enkrypt.status}`);
  console.log(`  Groq LLM: ${health.llm.status}`);
  console.log(`  Retrieval: ${health.retrieval.mode}`);
  console.log(`  Notes workflow: ${health.notes.workflowId}`);
  console.log(`  Session persistence: ${health.sessions.persistence}`);

  assert(health.qdrant.vectorCount > 0, 'Qdrant collection is empty — run npm run seed:qdrant');
  console.log('  ✓ Qdrant has seeded vectors');

  if (process.env.SKIP_LLM !== '1') {
    assert(health.llm.status === 'live', 'Groq LLM not live — set GROQ_API_KEY for demo');
    console.log('  ✓ Groq LLM configured');
  } else {
    console.log('  ⊘ Groq check skipped (SKIP_LLM=1)');
  }

  const typedPdf = path.join(FIXTURES, 'typed-notes.pdf');
  assert(fs.existsSync(typedPdf), `Missing notes fixture: ${typedPdf}`);
  console.log('  ✓ Notes test fixtures present');

  if (health.warnings.length > 0) {
    console.warn('\nWarnings (review before recording):');
    for (const w of health.warnings) console.warn(`  ⚠ ${w}`);
  }

  if (!health.ready && process.env.SKIP_LLM !== '1') {
    throw new Error('Stack not ready for strict demo — fix warnings above');
  }

  console.log('\n✓ Demo-ready check passed — safe to record when backend + frontend are running.\n');
}

main().catch((err) => {
  console.error('\n✗ Demo-ready check FAILED:', err instanceof Error ? err.message : err);
  process.exit(1);
});
