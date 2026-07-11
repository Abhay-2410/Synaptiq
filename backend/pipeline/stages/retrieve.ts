import { normalizeQuery } from '../embeddings/query-normalize.js';
import { subjectsForClass, allSubjectsForClass, retrievalSubjectKeys, type ClassLevel, type SubjectKey } from '../curriculum/catalog.js';
import { ALL_CORPUS_ENTRIES, chunkMatchesQuery, scoreKnowledgeEntry } from '../data/corpus/index.js';
import type { KnowledgeEntry } from '../data/knowledge-types.js';
import { executeSyllabusSearch } from '../../agents/retriever.tool.js';
import { requireLiveQdrant } from '../../integrations/strict-config.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';
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

function entryBoard(entry: KnowledgeEntry): string {
  return entry.chunks[0]?.metadata.board ?? 'cbse';
}

function filterCorpus(doubt: DoubtRequest): KnowledgeEntry[] {
  const { subjectId, classLevel, stream, boardId = 'cbse' } = doubt;

  const allowedSubjects =
    classLevel == null
      ? null
      : classLevel <= 10
        ? subjectsForClass(classLevel, boardId)
        : subjectId != null
          ? allSubjectsForClass(classLevel, boardId)
          : stream != null
            ? subjectsForClass(classLevel, boardId, stream)
            : allSubjectsForClass(classLevel, boardId);

  return ALL_CORPUS_ENTRIES.filter((entry) => {
    if (entryBoard(entry) !== boardId) return false;

    const key = entrySubjectKey(entry);
    if (!key) return false;

    if (subjectId != null) {
      const keys = retrievalSubjectKeys(boardId, classLevel, subjectId);
      if (keys && !keys.includes(key)) return false;
    }

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
    metadata: { ...chunk.metadata, source: 'corpus-fallback' },
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

function retrieveFromCorpusFallback(doubt: DoubtRequest, query: string): RetrievedChunk[] {
  const primary = rankCorpusEntries(doubt, query, 0.02);
  if (primary.length > 0) return primary;
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

/**
 * Primary retrieval path — Mastra `syllabus-search` tool (Syllabus Retriever agent).
 */
async function retrieveViaMastraTool(doubt: DoubtRequest): Promise<RetrievedChunk[]> {
  const result = await executeSyllabusSearch({
    query: doubt.text,
    boardId: doubt.boardId ?? 'cbse',
    classLevel: doubt.classLevel,
    subjectId: doubt.subjectId,
  });
  return result.chunks;
}

/**
 * Retrieve course material via Mastra syllabus-search tool → @mastra/qdrant (primary).
 * Corpus fallback only when ALLOW_CORPUS_FALLBACK=true (dev mode).
 */
export async function retrieveContext(doubt: DoubtRequest): Promise<RetrievedChunk[]> {
  const query = normalizeQuery(doubt.text);
  const searchDoubt = query === doubt.text ? doubt : { ...doubt, text: query };

  let fromQdrant: RetrievedChunk[] = [];
  try {
    fromQdrant = await retrieveViaMastraTool(searchDoubt);
  } catch (err) {
    if (requireLiveQdrant()) throw err;
    console.warn('[retrieve] Mastra syllabus-search tool failed, continuing to corpus fallback:', err);
  }

  if (fromQdrant.length > 0) {
    const maxScore = Math.max(...fromQdrant.map((c) => c.score));
    // Hash vectors can return weak-but-related hits — supplement with top lexical corpus chunk.
    if (maxScore < 0.06) {
      const supplement = retrieveFromCorpusFallback(searchDoubt, query).slice(0, 1);
      if (supplement.length > 0) {
        return focusRetrievedChunks(query, mergeChunks(fromQdrant, supplement), 3);
      }
    }
    return focusRetrievedChunks(query, fromQdrant, 3);
  }

  if (requireLiveQdrant()) {
    return [];
  }

  const fromCorpus = retrieveFromCorpusFallback(searchDoubt, query);
  const merged = mergeChunks(fromQdrant, fromCorpus);

  if (merged.length === 0) {
    await new Promise((r) => setTimeout(r, 80));
    return [];
  }

  return focusRetrievedChunks(query, merged, 3);
}
