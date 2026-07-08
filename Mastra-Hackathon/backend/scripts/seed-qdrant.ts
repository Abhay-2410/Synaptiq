/**
 * Upsert the full NCERT corpus into Qdrant with class + subject metadata.
 *
 * Usage: npm run seed:qdrant
 * Requires: QDRANT_URL, OPENAI_API_KEY (for embeddings)
 */
import 'dotenv/config';
import { ALL_CORPUS_ENTRIES } from '../pipeline/data/corpus/index.js';
import type { KnowledgeEntry } from '../pipeline/data/knowledge-types.js';
import { embedTexts } from '../pipeline/embeddings/embed.js';

const COLLECTION = process.env.QDRANT_COLLECTION ?? 'synaptiq_course_material';
const VECTOR_SIZE = 1536;

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
          source: chunk.metadata.source ?? 'ncert-cbse',
        },
      });
    }
  }
  return out;
}

async function ensureCollection(baseUrl: string, headers: Record<string, string>) {
  const getRes = await fetch(`${baseUrl}/collections/${COLLECTION}`, { headers });
  if (getRes.ok) return;

  const createRes = await fetch(`${baseUrl}/collections/${COLLECTION}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Failed to create collection: ${await createRes.text()}`);
  }
  console.log(`Created collection "${COLLECTION}"`);
}

async function upsertBatch(
  baseUrl: string,
  headers: Record<string, string>,
  points: { id: string; vector: number[]; payload: Record<string, unknown> }[],
) {
  const res = await fetch(`${baseUrl}/collections/${COLLECTION}/points?wait=true`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ points }),
  });
  if (!res.ok) {
    throw new Error(`Upsert failed: ${await res.text()}`);
  }
}

function uuidFromString(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, '0');
  return `00000000-0000-4000-8000-${hex.padStart(12, '0').slice(0, 12)}`;
}

async function main() {
  const baseUrl = process.env.QDRANT_URL?.replace(/\/$/, '');
  if (!baseUrl) {
    console.error('Set QDRANT_URL in .env');
    process.exit(1);
  }

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.QDRANT_API_KEY?.trim();
  if (apiKey) headers['api-key'] = apiKey;

  const flat = flattenCorpus();
  console.log(`Seeding ${flat.length} chunks into Qdrant collection "${COLLECTION}"…`);

  try {
    await ensureCollection(baseUrl, headers);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConnRefused = /ECONNREFUSED|fetch failed|ECONNRESET|Unable to connect/i.test(msg);
    if (isConnRefused) {
      console.warn(
        `Qdrant is not reachable at ${baseUrl}. Seeding skipped (app will fall back to in-memory retrieval).`,
      );
      return;
    }
    throw err;
  }

  const BATCH = 32;
  for (let i = 0; i < flat.length; i += BATCH) {
    const batch = flat.slice(i, i + BATCH);
    const vectors = await embedTexts(batch.map((b) => b.content), VECTOR_SIZE);
    const points = batch.map((item, j) => ({
      id: uuidFromString(item.id),
      vector: vectors[j]!,
      payload: item.payload,
    }));
    try {
      await upsertBatch(baseUrl, headers, points);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isConnRefused = /ECONNREFUSED|fetch failed|ECONNRESET|Unable to connect/i.test(msg);
      if (isConnRefused) {
        console.warn('Qdrant connection lost mid-seed. Seeding stopped.');
        return;
      }
      throw err;
    }
    console.log(`  Upserted ${Math.min(i + BATCH, flat.length)} / ${flat.length}`);
  }

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
