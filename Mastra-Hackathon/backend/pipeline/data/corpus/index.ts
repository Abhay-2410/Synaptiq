import { seedsToEntries } from './helpers.js';
import { SEEDS_CLASS_6_8 } from './seeds-class6-8.js';
import { SEEDS_CLASS_9_10 } from './seeds-class9-10.js';
import { SEEDS_CLASS_11_12 } from './seeds-class11-12.js';
import type { KnowledgeEntry } from '../knowledge-types.js';

/** Full NCERT-aligned CBSE corpus (Classes 6–12, all streams/subjects). */
export const ALL_CORPUS_ENTRIES: KnowledgeEntry[] = [
  ...seedsToEntries(SEEDS_CLASS_6_8),
  ...seedsToEntries(SEEDS_CLASS_9_10),
  ...seedsToEntries(SEEDS_CLASS_11_12),
];

export { scoreEntry, scoreKnowledgeEntry, chunkMatchesQuery } from './helpers.js';
export type { ChapterSeed } from './helpers.js';
