import type { BoardId, ClassLevel, StreamId, SubjectKey } from '../types.js';
import type { AgentTrailStep } from '../types.js';

export type NotesPipelineStage = 'upload' | 'extract' | 'simplify' | 'pdf' | 'done' | 'error';

export type ExtractionQuality = 'good' | 'poor' | 'failed';

export interface NotesStudyContext {
  boardId: BoardId;
  subjectId: SubjectKey;
  classLevel: ClassLevel;
  streamId?: StreamId;
}

export interface NotesSimplifyResult {
  extractedPreview: string;
  extractionQuality: ExtractionQuality;
  extractionMethod: 'pdf-text' | 'ocr-image' | 'ocr-pdf';
  simplifiedMarkdown: string;
  pdfBase64: string;
  warnings: string[];
  model: string;
  agentTrail?: AgentTrailStep[];
  /** Subject used for PDF title and download filename */
  resolvedSubjectId: SubjectKey;
  resolvedSubjectLabel: string;
  pdfFileName: string;
  subjectAdjusted?: boolean;
}

export type NotesStreamEvent =
  | { type: 'status'; stage: NotesPipelineStage; message: string }
  | { type: 'agent_trail'; trail: AgentTrailStep[] }
  | { type: 'done'; result: NotesSimplifyResult }
  | { type: 'error'; message: string };
