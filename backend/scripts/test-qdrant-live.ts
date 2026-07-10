import '../load-env.js';
import { ensureQdrantCollection } from '../integrations/qdrant-store.js';
import { retrieveFromMastraQdrant } from '../integrations/qdrant-retrieval.js';
import { retrieveContext } from '../pipeline/stages/retrieve.js';

await ensureQdrantCollection();

const mathHits = await retrieveFromMastraQdrant({
  text: 'How do I solve x^2 - 5x + 6 = 0?',
  classLevel: 10,
  subjectId: 'math',
});

console.log(`Math: retrieved ${mathHits.length} chunk(s)`);
for (const h of mathHits.slice(0, 3)) {
  console.log(`  - ${h.metadata.topic} (score ${h.score.toFixed(3)})`);
}

const historyChunks = await retrieveContext({
  text: 'Explain the causes of the Indian freedom struggle',
  classLevel: 10,
  subjectId: 'social',
});

console.log(`\nHistory: focused ${historyChunks.length} chunk(s)`);
for (const h of historyChunks) {
  console.log(`  - ${h.metadata.topic} (score ${h.score.toFixed(3)})`);
}

if (historyChunks.length === 0) {
  console.error('FAIL: history retrieval returned 0 chunks');
  process.exit(1);
}
