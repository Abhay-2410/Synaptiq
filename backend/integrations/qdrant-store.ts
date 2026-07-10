import { QdrantVector } from '@mastra/qdrant';
import { qdrantCollectionName, qdrantVectorId } from './strict-config.js';

export const VECTOR_SIZE = 1536;

let qdrantVector: QdrantVector | null = null;

function resolveQdrantUrl(): string {
  const url = process.env.QDRANT_URL?.trim();
  if (!url) {
    throw new Error('QDRANT_URL is required for Mastra + Qdrant integration');
  }
  return url.replace(/\/$/, '');
}

export function createQdrantVector(): QdrantVector {
  const url = resolveQdrantUrl();
  const apiKey = process.env.QDRANT_API_KEY?.trim();

  return new QdrantVector({
    id: qdrantVectorId(),
    url,
    ...(apiKey ? { apiKey } : {}),
  });
}

export function getQdrantVector(): QdrantVector {
  if (!qdrantVector) {
    qdrantVector = createQdrantVector();
  }
  return qdrantVector;
}

export function getQdrantIndexName(): string {
  return qdrantCollectionName();
}

export async function ensureQdrantCollection(): Promise<void> {
  const store = getQdrantVector();
  const indexName = getQdrantIndexName();
  const indexes = await store.listIndexes();

  if (!indexes.includes(indexName)) {
    await store.createIndex({
      indexName,
      dimension: VECTOR_SIZE,
      metric: 'cosine',
    });
    console.log(`[qdrant] Created Mastra index "${indexName}" (${VECTOR_SIZE}-dim cosine)`);
  } else {
    const stats = await store.describeIndex({ indexName });
    console.log(`[qdrant] Mastra index "${indexName}" ready — ${stats.count} vector(s)`);
  }

  // Qdrant Cloud requires payload indexes before metadata filters work
  for (const [fieldName, fieldSchema] of [
    ['board', 'keyword'],
    ['classLevel', 'integer'],
    ['subjectKey', 'keyword'],
    ['topic', 'keyword'],
    ['chapter', 'keyword'],
  ] as const) {
    try {
      await store.createPayloadIndex({ indexName, fieldName, fieldSchema });
    } catch {
      // idempotent — index may already exist
    }
  }
}
