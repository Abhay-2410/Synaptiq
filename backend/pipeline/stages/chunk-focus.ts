import { tokenizeForMatch } from '../embeddings/query-normalize.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';
import type { SubjectKey } from '../curriculum/catalog.js';

/** Remove internal storage prefix from chunk text shown to students. */
export function stripChunkDisplayText(content: string): string {
  return content
    .replace(/^Class\s+\d+\s+[^—]+—\s*[^:]+:\s*/i, '')
    .trim();
}

function queryBias(query: string, chunk: RetrievedChunk): number {
  const q = query.toLowerCase();
  const chapter = (chunk.metadata.chapter ?? '').toLowerCase();
  const topic = (chunk.metadata.topic ?? '').toLowerCase();
  const content = stripChunkDisplayText(chunk.content).toLowerCase();
  let bias = 0;

  if (/\bindia\b/.test(q) || /\bfreedom\b/.test(q) || /\bstruggle\b/.test(q)) {
    if (chapter.includes('india') || content.includes('india') || topic.includes('freedom')) bias += 4;
    if (chapter.includes('europe') && !chapter.includes('india')) bias -= 6;
  }

  if (/\beurope\b/.test(q) && chapter.includes('europe')) bias += 3;
  if (/\bnationalism\b/.test(q)) {
    if (chapter.includes('nationalism') || topic.includes('nationalism') || topic.includes('freedom')) {
      bias += 3;
    }
  }

  if (/\bquadratic|polynomial|factoris|equation|algebra\b/.test(q)) {
    if (topic.includes('quadratic') || topic.includes('polynomial') || topic.includes('equation') || topic.includes('factor')) {
      bias += 5;
    }
    if (topic.includes('distance') || topic.includes('median') || topic.includes('sector')) {
      bias -= 4;
    }
  }

  if (/\bfreedom\b/.test(q) && /\bstruggle\b/.test(q)) {
    if (topic.includes('freedom') || chapter.includes('nationalism in india')) bias += 8;
    if (
      topic.includes('nationalism') ||
      topic.includes('freedom') ||
      chapter.includes('nationalism') ||
      content.includes('freedom struggle')
    ) {
      bias += 5;
    }
  }

  if (/\bgandhi|nationalism|independence|revolt\b/.test(q)) {
    if (
      topic.includes('nationalism') ||
      topic.includes('freedom') ||
      chapter.includes('nationalism') ||
      content.includes('freedom struggle')
    ) {
      bias += 5;
    }
  }

  if (/\b(federal|federalism)\b/.test(q) && chapter.includes('federal')) bias += 3;
  if (/\b(global|globalisation|globalization)\b/.test(q) && chapter.includes('global')) bias += 3;

  const tokens = tokenizeForMatch(query);
  for (const token of tokens) {
    if (topic.includes(token) || chapter.includes(token) || content.includes(token)) {
      bias += 1;
    }
  }

  return bias;
}

function scoreChunkForQuery(query: string, chunk: RetrievedChunk): number {
  return chunk.score + queryBias(query, chunk);
}

/**
 * Keep chunks that belong to the same lesson/chapter as the best match.
 * Prevents mixed topics (e.g. Federalism + Nationalism) in one answer.
 */
export function focusRetrievedChunks(
  query: string,
  chunks: RetrievedChunk[],
  max = 3,
): RetrievedChunk[] {
  if (chunks.length <= max) return dedupeByTopic(chunks);

  const ranked = [...chunks]
    .map((chunk) => ({ chunk, score: scoreChunkForQuery(query, chunk) }))
    .sort((a, b) => b.score - a.score);

  const anchor = ranked[0]?.chunk;
  if (!anchor) return chunks.slice(0, max);

  const anchorChapter = anchor.metadata.chapter ?? '';
  const anchorTopic = anchor.metadata.topic ?? '';

  const focused = ranked
    .filter(({ chunk, score }) => {
      if (score < ranked[0]!.score * 0.55) return false;
      const sameTopic = chunk.metadata.topic === anchorTopic;
      const sameChapter = chunk.metadata.chapter === anchorChapter;
      return sameTopic || sameChapter;
    })
    .map(({ chunk }) => chunk);

  const result = focused.length > 0 ? focused : ranked.map((r) => r.chunk);
  return dedupeByTopic(result).slice(0, max);
}

function dedupeByTopic(chunks: RetrievedChunk[]): RetrievedChunk[] {
  const seen = new Set<string>();
  const out: RetrievedChunk[] = [];
  for (const chunk of chunks) {
    const key = `${chunk.metadata.chapter ?? ''}|${stripChunkDisplayText(chunk.content).slice(0, 80)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chunk);
  }
  return out;
}

export type AnswerMode =
  | 'life-science'
  | 'physical-science'
  | 'social-studies'
  | 'commerce'
  | 'math'
  | 'english'
  | 'general';

export function resolveAnswerMode(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
): AnswerMode {
  const key: SubjectKey | undefined = doubt.subjectId ?? context[0]?.metadata.subjectKey;

  if (key === 'biology' || key === 'science') return 'life-science';
  if (key === 'physics' || key === 'chemistry') return 'physical-science';
  if (key === 'math') return 'math';
  if (key === 'business' || key === 'accountancy') return 'commerce';
  if (key === 'economics') {
    return doubt.stream === 'commerce' ? 'commerce' : 'social-studies';
  }
  if (key === 'social' || key === 'history' || key === 'political_science' || key === 'history_civics' || key === 'geography') {
    return 'social-studies';
  }
  if (key === 'english') return 'english';
  return 'general';
}

export function extractDiscipline(chapter?: string): string | undefined {
  if (!chapter) return undefined;
  const match = chapter.match(/^(History|Geography|Civics|Economics)/i);
  return match?.[1] ? match[1][0]!.toUpperCase() + match[1].slice(1).toLowerCase() : undefined;
}

export function cleanChapterLabel(chapter?: string): string {
  if (!chapter) return '';
  return chapter.replace(/^(History|Geography|Civics|Economics)\s*[–-]\s*/i, '').trim();
}
