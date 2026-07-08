import { normalizeQuery } from '../embeddings/query-normalize.js';
import { subjectsForClass, allSubjectsForClass, type ClassLevel, type SubjectKey } from '../curriculum/catalog.js';
import { ALL_CORPUS_ENTRIES, chunkMatchesQuery, scoreKnowledgeEntry } from '../data/corpus/index.js';
import type { KnowledgeEntry } from '../data/knowledge-types.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';
import { retrieveFromQdrant } from './qdrant-retrieve.js';
import { focusRetrievedChunks } from './chunk-focus.js';

function entrySubjectKey(entry: KnowledgeEntry): SubjectKey | undefined {
  return entry.chunks[0]?.metadata.subjectKey;
}

function chunkMatchesClass(
  chunk: KnowledgeEntry['chunks'][number],
  classLevel?: ClassLevel,
): boolean {
  if (classLevel == null) return true;
  const stored = chunk.metadata.classLevel;
  if (stored == null) return false;
  return stored === classLevel;
}

function filterCorpus(doubt: DoubtRequest): KnowledgeEntry[] {
  const { subjectId, classLevel, stream } = doubt;

  const allowedSubjects =
    classLevel == null
      ? null
      : classLevel <= 10
        ? subjectsForClass(classLevel)
        : subjectId != null
          ? allSubjectsForClass(classLevel)
          : stream != null
            ? subjectsForClass(classLevel, stream)
            : allSubjectsForClass(classLevel);

  return ALL_CORPUS_ENTRIES.filter((entry) => {
    const key = entrySubjectKey(entry);
    if (!key) return false;

    if (subjectId != null && key !== subjectId) return false;

    if (allowedSubjects != null && allowedSubjects.length > 0 && !allowedSubjects.includes(key)) {
      return false;
    }

    if (classLevel == null) return true;
    return entry.chunks.some((c) => chunkMatchesClass(c, classLevel));
  });
}

function entryToChunks(
  entry: KnowledgeEntry,
  classLevel: ClassLevel | undefined,
  baseScore: number,
): RetrievedChunk[] {
  const matchingChunks =
    classLevel != null
      ? entry.chunks.filter((c) => chunkMatchesClass(c, classLevel))
      : entry.chunks;

  if (matchingChunks.length === 0) return [];

  return matchingChunks.map((chunk, i) => ({
    ...chunk,
    score: Math.max(0.35, baseScore - i * 0.03),
  }));
}

function rankCorpusEntries(
  doubt: DoubtRequest,
  query: string,
  threshold: number,
): RetrievedChunk[] {
  const classLevel = doubt.classLevel;
  const candidateEntries = filterCorpus(doubt);

  const ranked = candidateEntries
    .map((entry) => {
      const base = scoreKnowledgeEntry(query, entry);
      const maxPossible =
        entry.keywords.reduce((sum, kw) => sum + (kw.includes(' ') ? 3 : 1), 0) + 6 || 1;
      const similarity = base / maxPossible;
      return { entry, base, similarity };
    })
    .filter((r) => r.base > 0)
    .sort((a, b) => b.similarity - a.similarity);

  const best = ranked[0];
  if (!best || best.similarity < threshold) return [];

  return entryToChunks(best.entry, classLevel, Math.max(0.35, best.similarity));
}

function retrieveFromStub(doubt: DoubtRequest, query: string): RetrievedChunk[] {
  return rankCorpusEntries(doubt, query, 0.02);
}

function retrieveRelaxed(doubt: DoubtRequest, query: string): RetrievedChunk[] {
  return rankCorpusEntries(doubt, query, 0.01);
}

function mergeChunks(primary: RetrievedChunk[], secondary: RetrievedChunk[]): RetrievedChunk[] {
  const byId = new Map<string, RetrievedChunk>();
  for (const chunk of [...primary, ...secondary]) {
    const existing = byId.get(chunk.id);
    if (!existing || chunk.score > existing.score) {
      byId.set(chunk.id, chunk);
    }
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

function filterRelevantQdrantHits(query: string, hits: RetrievedChunk[]): RetrievedChunk[] {
  return hits.filter((hit) => {
    const haystack = [
      hit.metadata.topic ?? '',
      hit.metadata.chapter ?? '',
      hit.content,
    ].join(' ');
    const lexical = chunkMatchesQuery(query, haystack);
    if (lexical) return true;
    // Hash vectors can spuriously match — only trust high scores without lexical overlap.
    return hit.score >= 0.35;
  });
}

/**
 * Retrieve course material: Qdrant when configured, else keyword corpus stub.
 * Always filters by class + subject metadata before ranking.
 */
export async function retrieveContext(doubt: DoubtRequest): Promise<RetrievedChunk[]> {
  const query = normalizeQuery(doubt.text);
  const searchDoubt = query === doubt.text ? doubt : { ...doubt, text: query };

  let fromQdrant: RetrievedChunk[] = [];
  if (process.env.QDRANT_URL?.trim()) {
    try {
      fromQdrant = filterRelevantQdrantHits(query, await retrieveFromQdrant(searchDoubt));
    } catch (err) {
      console.warn('Qdrant retrieval failed, falling back to corpus stub:', err);
    }
  }

  const fromStub = retrieveFromStub(searchDoubt, query);
  const merged = mergeChunks(fromQdrant, fromStub);

  let results: RetrievedChunk[] = [];

  if (fromStub.length > 0 && merged.length > 0) {
    results = merged;
  } else if (fromStub.length === 0 && fromQdrant.length > 0) {
    const lexicalOnly = fromQdrant.filter((hit) =>
      chunkMatchesQuery(
        query,
        [hit.metadata.topic ?? '', hit.metadata.chapter ?? '', hit.content].join(' '),
      ),
    );
    if (lexicalOnly.length > 0) results = lexicalOnly;
  } else if (fromStub.length > 0) {
    results = fromStub;
  } else {
    const relaxed = retrieveRelaxed(searchDoubt, query);
    if (relaxed.length > 0) results = relaxed;
  }

  if (results.length === 0) {
    await new Promise((r) => setTimeout(r, 80));
    return [];
  }

  return focusRetrievedChunks(query, results, 3);
}
