/**
 * Upsert the full NCERT corpus into Qdrant via @mastra/qdrant QdrantVector.
 *
 * Usage: npm run seed:qdrant
 * Requires: QDRANT_URL
 */
import 'dotenv/config';
import { ensureQdrantCollection, getQdrantIndexName, getQdrantVector, VECTOR_SIZE } from '../integrations/qdrant-store.js';
import { ALL_CORPUS_ENTRIES } from '../pipeline/data/corpus/index.js';
import type { KnowledgeEntry } from '../pipeline/data/knowledge-types.js';
import { embedTexts } from '../pipeline/embeddings/embed.js';

interface FlatChunk {
  id: string;
  content: string;
  payload: Record<string, unknown>;
}

function flattenCorpus(): FlatChunk[] {
  const out: FlatChunk[] = [];
  for (const entry of ALL_CORPUS_ENTRIES) {
    for (const chunk of entry.chunks) {
      out.push({
        id: chunk.id,
        content: chunk.content,
        payload: {
          chunkId: chunk.id,
          content: chunk.content,
          subject: chunk.metadata.subject,
          subjectKey: chunk.metadata.subjectKey,
          topic: chunk.metadata.topic,
          chapter: chunk.metadata.chapter,
          classLevel: chunk.metadata.classLevel,
          board: chunk.metadata.board ?? 'cbse',
          source: chunk.metadata.source ?? 'ncert-cbse',
        },
      });
    }
  }
  return out;
}

function uuidFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padStart(12, '0').slice(0, 12)}`;
}

async function main() {
  if (!process.env.QDRANT_URL?.trim()) {
    console.error('Set QDRANT_URL in .env');
    process.exit(1);
  }

  const flat = flattenCorpus();
  const store = getQdrantVector();
  const indexName = getQdrantIndexName();

  await ensureQdrantCollection();

  console.log(`Seeding ${flat.length} chunks into Mastra Qdrant index "${indexName}"…`);

  const BATCH = 32;
  for (let i = 0; i < flat.length; i += BATCH) {
    const batch = flat.slice(i, i + BATCH);
    const vectors = await embedTexts(
      batch.map((b) => b.content),
      VECTOR_SIZE,
    );

    await store.upsert({
      indexName,
      ids: batch.map((b) => uuidFromString(b.id)),
      vectors,
      metadata: batch.map((b) => b.payload),
    });

    console.log(`  Upserted ${Math.min(i + BATCH, flat.length)} / ${flat.length}`);
  }

  const stats = await store.describeIndex({ indexName });
  console.log(`Done. ${stats.count} vectors in "${indexName}" (${VECTOR_SIZE}-dim ${stats.metric}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
