import type { ClassLevel, StreamId, SubjectKey } from '../curriculum/catalog.js';
import type { BoardId } from '../curriculum/boards.js';
import type { RetrievedChunk } from '../types.js';

export interface KnowledgeEntry {
  keywords: string[];
  chunks: Omit<RetrievedChunk, 'score'>[];
}

export interface CorpusChunkMetadata {
  subject?: string;
  subjectKey?: SubjectKey;
  topic?: string;
  chapter?: string;
  source?: string;
  board?: BoardId;
  classLevel?: ClassLevel;
  stream?: StreamId;
}
