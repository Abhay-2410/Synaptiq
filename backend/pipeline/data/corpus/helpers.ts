import type { BoardId } from '../../curriculum/boards.js';
import type { ClassLevel, SubjectKey } from '../../curriculum/catalog.js';
import { SUBJECT_META } from '../../curriculum/catalog.js';
import { corpusSourceForBoard } from '../../curriculum/catalog.js';
import { tokenizeForMatch } from '../../embeddings/query-normalize.js';
import type { KnowledgeEntry } from '../knowledge-types.js';

export interface ChapterSeed {
  classLevel: ClassLevel;
  subjectKey: SubjectKey;
  chapter: string;
  topic: string;
  keywords: string[];
  /** One or more factual paragraphs for this topic */
  content: string[];
  board?: BoardId;
}

export function seedsToEntries(seeds: ChapterSeed[], defaultBoard: BoardId = 'cbse'): KnowledgeEntry[] {
  return seeds.map((seed) => {
    const board = seed.board ?? defaultBoard;
    const subjectLabel = SUBJECT_META[seed.subjectKey].storageLabel;
    const prefix = `Class ${seed.classLevel} ${subjectLabel}`;
    return {
      keywords: seed.keywords,
      chunks: seed.content.map((paragraph, i) => ({
        id: `${board}-c${seed.classLevel}-${seed.subjectKey}-${slug(seed.topic)}-${i + 1}`,
        content: `${prefix} — ${seed.chapter}: ${paragraph}`,
        metadata: {
          subject: subjectLabel,
          subjectKey: seed.subjectKey,
          topic: seed.topic,
          chapter: seed.chapter,
          classLevel: seed.classLevel,
          board,
          source: corpusSourceForBoard(board),
        },
      })),
    };
  });
}

export function cloneSeedsForBoard(seeds: ChapterSeed[], board: BoardId): ChapterSeed[] {
  return seeds.map((seed) => ({ ...seed, board }));
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }
  return row[n];
}

function fuzzyTokenMatch(queryToken: string, keyword: string): boolean {
  if (queryToken.length < 4 || keyword.length < 4) return false;
  if (queryToken === keyword) return true;
  if (queryToken.includes(keyword) || keyword.includes(queryToken)) return true;

  const maxLen = Math.max(queryToken.length, keyword.length);
  const dist = levenshtein(queryToken, keyword);
  if (dist > 2) return false;
  return 1 - dist / maxLen >= 0.72;
}

function queryTokens(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

export function scoreEntry(query: string, keywords: string[]): number {
  const lower = query.toLowerCase();
  const tokens = queryTokens(query);
  let score = 0;

  for (const kw of keywords) {
    const k = kw.toLowerCase();
    if (k.includes(' ')) {
      if (lower.includes(k)) score += 3;
      continue;
    }

    const re = new RegExp(`(?:^|[\\s,.;:!?()\\[\\]"'-])${escapeRegex(k)}(?:$|[\\s,.;:!?()\\[\\]"'-])`, 'i');
    if (re.test(` ${lower} `)) {
      score += 1;
      continue;
    }

    if (tokens.some((t) => fuzzyTokenMatch(t, k))) {
      score += 1;
    }
  }
  return score;
}

export function scoreKnowledgeEntry(query: string, entry: KnowledgeEntry): number {
  let score = scoreEntry(query, entry.keywords);
  const meta = entry.chunks[0]?.metadata;
  if (meta?.topic) score += scoreEntry(query, [meta.topic]) * 2;
  if (meta?.chapter) score += scoreEntry(query, [meta.chapter]);
  return score;
}

/** True when at least one meaningful query token appears in the chunk text/metadata. */
export function chunkMatchesQuery(query: string, haystack: string): boolean {
  const tokens = tokenizeForMatch(query);
  if (tokens.length === 0) return false;

  const lower = haystack.toLowerCase();
  for (const token of tokens) {
    if (lower.includes(token)) return true;
    const words = lower.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/);
    if (words.some((w) => w.length >= 4 && fuzzyTokenMatch(token, w))) return true;
  }
  return false;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
