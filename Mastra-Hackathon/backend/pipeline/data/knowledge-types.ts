import type { ClassLevel, StreamId, SubjectKey } from '../curriculum/catalog.js';
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
  classLevel?: ClassLevel;
  stream?: StreamId;
}
