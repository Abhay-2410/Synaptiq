import { cloneSeedsForBoard, seedsToEntries } from './helpers.js';
import { SEEDS_CLASS_6_8 } from './seeds-class6-8.js';
import { SEEDS_CLASS_9_10 } from './seeds-class9-10.js';
import { SEEDS_CLASS_11_12 } from './seeds-class11-12.js';
import { SEEDS_ICSE_JUNIOR } from './seeds-icse-junior.js';
import type { KnowledgeEntry } from '../knowledge-types.js';

/** Full NCERT-aligned CBSE corpus (Classes 6–12, all streams/subjects). */
export const CBSE_CORPUS_ENTRIES: KnowledgeEntry[] = [
  ...seedsToEntries(SEEDS_CLASS_6_8, 'cbse'),
  ...seedsToEntries(SEEDS_CLASS_9_10, 'cbse'),
  ...seedsToEntries(SEEDS_CLASS_11_12, 'cbse'),
];

/** CISCE-aligned ICSE corpus — junior split subjects + senior stream subjects. */
export const ICSE_CORPUS_ENTRIES: KnowledgeEntry[] = [
  ...seedsToEntries(SEEDS_ICSE_JUNIOR, 'icse'),
  ...seedsToEntries(cloneSeedsForBoard(SEEDS_CLASS_11_12, 'icse'), 'icse'),
];

/** Combined corpus for seeding and local fallback. */
export const ALL_CORPUS_ENTRIES: KnowledgeEntry[] = [
  ...CBSE_CORPUS_ENTRIES,
  ...ICSE_CORPUS_ENTRIES,
];

export { scoreEntry, scoreKnowledgeEntry, chunkMatchesQuery } from './helpers.js';
export type { ChapterSeed } from './helpers.js';
