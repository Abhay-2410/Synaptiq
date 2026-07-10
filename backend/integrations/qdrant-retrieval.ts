import type { BoardId } from '../pipeline/curriculum/boards.js';
import {
  allSubjectsForClass,
  retrievalSubjectKeys,
  subjectsForClass,
  type ClassLevel,
  type StreamId,
  type SubjectKey,
} from '../pipeline/curriculum/catalog.js';
import { embedText } from '../pipeline/embeddings/embed.js';
import { chunkMatchesQuery } from '../pipeline/data/corpus/index.js';
import { logStageEnd, logStageStart } from '../pipeline/lib/pipeline-log.js';
import { withTimeout } from '../pipeline/lib/with-timeout.js';
import type { DoubtRequest, RetrievedChunk } from '../pipeline/types.js';
import { requireLiveQdrant } from './strict-config.js';
import { getQdrantIndexName, getQdrantVector } from './qdrant-store.js';

type QdrantFilter = Parameters<ReturnType<typeof getQdrantVector>['query']>[0]['filter'];

const QDRANT_TIMEOUT_MS = Number(process.env.QDRANT_TIMEOUT_MS) || 8_000;
const EMBED_TIMEOUT_MS = Number(process.env.QDRANT_EMBED_TIMEOUT_MS) || 3_000;

function buildMastraFilter(doubt: DoubtRequest): QdrantFilter {
  const clauses: NonNullable<QdrantFilter>[] = [];
  const boardId = doubt.boardId ?? 'cbse';

  if (boardId === 'icse') {
    clauses.push({ board: { $eq: 'icse' } });
  }

  if (doubt.classLevel != null) {
    clauses.push({ classLevel: { $eq: doubt.classLevel } });
  }

  if (doubt.subjectId != null) {
    const keys = retrievalSubjectKeys(boardId, doubt.classLevel, doubt.subjectId);
    if (keys?.length === 1) {
      clauses.push({ subjectKey: { $eq: keys[0] } });
    } else if (keys && keys.length > 1) {
      clauses.push({ subjectKey: { $in: keys } });
    }
  } else if (doubt.classLevel != null) {
    const allowed =
      doubt.classLevel >= 11
        ? allSubjectsForClass(doubt.classLevel, boardId)
        : subjectsForClass(doubt.classLevel, boardId, doubt.stream);
    if (allowed.length > 0) {
      clauses.push({ subjectKey: { $in: allowed } });
    }
  }

  if (clauses.length === 0) return undefined;
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses } as QdrantFilter;
}

function mapQueryResult(hit: {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}): RetrievedChunk | null {
  const p = hit.metadata ?? {};
  const content = String(p.content ?? '');
  if (!content) return null;

  return {
    id: String(p.chunkId ?? hit.id),
    score: hit.score,
    content,
    metadata: {
      subject: p.subject as string | undefined,
      subjectKey: p.subjectKey as SubjectKey | undefined,
      topic: p.topic as string | undefined,
      chapter: p.chapter as string | undefined,
      source: (p.source as string | undefined) ?? 'mastra-qdrant',
      board: (p.board as BoardId | undefined) ?? 'cbse',
      classLevel: p.classLevel as ClassLevel | undefined,
      stream: p.stream as StreamId | undefined,
    },
  };
}

function filterRelevantHits(query: string, hits: RetrievedChunk[]): RetrievedChunk[] {
  if (hits.length === 0) return [];

  // Hash embeddings produce lower absolute scores than neural embedders — rank by score, then gate loosely.
  const ranked = [...hits].sort((a, b) => b.score - a.score);

  return ranked.filter((hit, index) => {
    if (index < 3) return true;
    const haystack = [hit.metadata.topic ?? '', hit.metadata.chapter ?? '', hit.content].join(' ');
    const lexical = chunkMatchesQuery(query, haystack);
    if (lexical) return true;
    return hit.score >= 0.08;
  });
}

/**
 * Retrieve syllabus chunks via @mastra/qdrant QdrantVector (registered on Mastra instance).
 */
export async function retrieveFromMastraQdrant(doubt: DoubtRequest): Promise<RetrievedChunk[]> {
  logStageStart('qdrant-mastra', doubt.text.slice(0, 60));

  const store = getQdrantVector();
  const indexName = getQdrantIndexName();

  const embedInput = [
    doubt.subjectId ? `subject: ${doubt.subjectId}` : '',
    doubt.classLevel ? `class: ${doubt.classLevel}` : '',
    doubt.text,
  ]
    .filter(Boolean)
    .join(' ');

  const vector = await withTimeout(
    embedText(embedInput),
    EMBED_TIMEOUT_MS,
    'Qdrant query embedding',
  );

  const filter = buildMastraFilter(doubt);

  const results = await withTimeout(
    store.query({
      indexName,
      queryVector: vector,
      topK: 8,
      ...(filter ? { filter } : {}),
    }),
    QDRANT_TIMEOUT_MS,
    'Mastra Qdrant query',
  );

  const minScore = 0.03;
  const hits = results
    .filter((r) => r.score >= minScore)
    .map(mapQueryResult)
    .filter((c): c is RetrievedChunk => c != null);

  const filtered = filterRelevantHits(doubt.text, hits);
  logStageEnd('qdrant-mastra', `${filtered.length} hit(s) via @mastra/qdrant`);

  if (requireLiveQdrant() && filtered.length === 0) {
    throw new Error(
      'Qdrant returned no matching syllabus chunks. Run `npm run seed:qdrant` and ensure QDRANT_URL is reachable.',
    );
  }

  return filtered;
}

/** Startup probe — confirms Mastra QdrantVector can list and describe the collection. */
export async function probeMastraQdrant(): Promise<{
  reachable: boolean;
  indexName: string;
  vectorCount: number;
  error?: string;
}> {
  const indexName = getQdrantIndexName();
  try {
    const store = getQdrantVector();
    const indexes = await store.listIndexes();
    if (!indexes.includes(indexName)) {
      return { reachable: true, indexName, vectorCount: 0, error: 'collection_missing' };
    }
    const stats = await store.describeIndex({ indexName });
    return { reachable: true, indexName, vectorCount: stats.count };
  } catch (err) {
    return {
      reachable: false,
      indexName,
      vectorCount: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
