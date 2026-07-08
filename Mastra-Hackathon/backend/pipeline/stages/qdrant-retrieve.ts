import type { ClassLevel, StreamId, SubjectKey } from '../curriculum/catalog.js';
import { allSubjectsForClass, subjectsForClass } from '../curriculum/catalog.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';
import { embedText } from '../embeddings/embed.js';
import { fetchWithTimeout } from '../lib/fetch-timeout.js';

const COLLECTION = process.env.QDRANT_COLLECTION ?? 'synaptiq_course_material';

let qdrantDisabledUntilEpoch = 0;

interface QdrantPoint {
  id: string | number;
  score: number;
  payload?: Record<string, unknown>;
}

const VECTOR_SIZE = 1536;

function buildFilter(doubt: DoubtRequest): Record<string, unknown> {
  const must: Record<string, unknown>[] = [];

  if (doubt.classLevel != null) {
    must.push({ key: 'classLevel', match: { value: doubt.classLevel } });
  }

  if (doubt.subjectId != null) {
    must.push({ key: 'subjectKey', match: { value: doubt.subjectId } });
  } else if (doubt.classLevel != null) {
    const allowed =
      doubt.classLevel >= 11
        ? allSubjectsForClass(doubt.classLevel)
        : subjectsForClass(doubt.classLevel, doubt.stream);
    if (allowed.length > 0) {
      must.push({
        key: 'subjectKey',
        match: { any: allowed },
      });
    }
  }

  if (must.length === 0) return {};
  return { must };
}

function mapHit(hit: QdrantPoint): RetrievedChunk | null {
  const p = hit.payload ?? {};
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
      source: p.source as string | undefined,
      classLevel: p.classLevel as ClassLevel | undefined,
      stream: p.stream as StreamId | undefined,
    },
  };
}

export async function retrieveFromQdrant(doubt: DoubtRequest): Promise<RetrievedChunk[]> {
  const baseUrl = process.env.QDRANT_URL?.replace(/\/$/, '');
  if (!baseUrl) return [];

  if (Date.now() < qdrantDisabledUntilEpoch) return [];

  const vector = await embedText(doubt.text, VECTOR_SIZE);

  const filter = buildFilter(doubt);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = process.env.QDRANT_API_KEY?.trim();
  if (apiKey) headers['api-key'] = apiKey;

  const body: Record<string, unknown> = {
    vector,
    limit: 8,
    with_payload: true,
    // Hash-embeddings yield lower cosine scores; keyword stub backs up weak hits.
    score_threshold: 0.12,
  };
  if (Object.keys(filter).length > 0) body.filter = filter;

  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${baseUrl}/collections/${COLLECTION}/points/search`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      },
      8_000,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isConnRefused =
      /ECONNREFUSED|fetch failed|ECONNRESET|Unable to connect|timed out/i.test(msg);
    if (isConnRefused) {
      qdrantDisabledUntilEpoch = Date.now() + 60_000;
      return [];
    }
    throw err;
  }

  if (!res.ok) {
    const errText = await res.text();
    // Non-connection errors should still bubble up (so we don't hide real issues).
    throw new Error(`Qdrant search failed (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as { result: QdrantPoint[] };
  const minScore = 0.12;
  return (data.result ?? [])
    .filter((p) => typeof p.score === 'number' && p.score >= minScore)
    .map(mapHit)
    .filter((c): c is RetrievedChunk => c != null);
}
