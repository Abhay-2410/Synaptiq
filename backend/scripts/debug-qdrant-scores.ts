import 'dotenv/config';
import { getQdrantIndexName, getQdrantVector } from '../integrations/qdrant-store.js';
import { embedText } from '../pipeline/embeddings/embed.js';
import { normalizeQuery } from '../pipeline/embeddings/query-normalize.js';

const doubt = 'How do I solve x^2 - 5x + 6 = 0?';
const query = normalizeQuery(doubt);
const store = getQdrantVector();
const indexName = getQdrantIndexName();
const vector = await embedText(query);

const filter = { $and: [{ classLevel: { $eq: 10 } }, { subjectKey: { $eq: 'math' } }] };

const results = await store.query({ indexName, queryVector: vector, topK: 8, filter });
console.log('Query:', query);
console.log('Results:', results.length);
for (const r of results) {
  console.log(`  score=${r.score} topic=${(r.metadata as any)?.topic}`);
}
