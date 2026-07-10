/** Class / stream / subject catalog — board-aware (CBSE + ICSE) */

import type { BoardId } from './boards.js';
import { getBoardMeta } from './boards.js';

export type ClassLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StreamId = 'pcm' | 'pcb' | 'commerce' | 'humanities';

/**
 * Canonical subject keys used in API + Qdrant metadata.
 * ICSE junior uses split History & Civics / Geography instead of bundled Social Science.
 */
export type SubjectKey =
  | 'math'
  | 'science'
  | 'english'
  | 'social'
  | 'history_civics'
  | 'geography'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'accountancy'
  | 'business'
  | 'economics'
  | 'history'
  | 'political_science';

export interface SubjectMeta {
  key: SubjectKey;
  label: string;
  color: string;
  /** Display name stored in chunk metadata.subject */
  storageLabel: string;
}

export const SUBJECT_META: Record<SubjectKey, SubjectMeta> = {
  math: { key: 'math', label: 'Math', color: '#E8D66B', storageLabel: 'Mathematics' },
  science: { key: 'science', label: 'Science', color: '#6FBF9E', storageLabel: 'Science' },
  english: { key: 'english', label: 'English', color: '#C4A484', storageLabel: 'English' },
  social: { key: 'social', label: 'Social Science', color: '#E8A87C', storageLabel: 'Social Science' },
  history_civics: {
    key: 'history_civics',
    label: 'History & Civics',
    color: '#C4866A',
    storageLabel: 'History and Civics',
  },
  geography: { key: 'geography', label: 'Geography', color: '#7FA8C9', storageLabel: 'Geography' },
  physics: { key: 'physics', label: 'Physics', color: '#F2795B', storageLabel: 'Physics' },
  chemistry: { key: 'chemistry', label: 'Chemistry', color: '#9B8EC4', storageLabel: 'Chemistry' },
  biology: { key: 'biology', label: 'Biology', color: '#6FBF9E', storageLabel: 'Biology' },
  accountancy: { key: 'accountancy', label: 'Accountancy', color: '#7FA8C9', storageLabel: 'Accountancy' },
  business: { key: 'business', label: 'Business Studies', color: '#D4A574', storageLabel: 'Business Studies' },
  economics: { key: 'economics', label: 'Economics', color: '#E8D66B', storageLabel: 'Economics' },
  history: { key: 'history', label: 'History', color: '#C4866A', storageLabel: 'History' },
  political_science: {
    key: 'political_science',
    label: 'Political Science',
    color: '#7FA8C9',
    storageLabel: 'Political Science',
  },
};

const CBSE_JUNIOR: SubjectKey[] = ['math', 'science', 'english', 'social'];
const ICSE_JUNIOR: SubjectKey[] = ['math', 'science', 'english', 'history_civics', 'geography'];

export const STREAM_META: Record<StreamId, { label: string; subjects: SubjectKey[] }> = {
  pcm: {
    label: 'Science (PCM)',
    subjects: ['math', 'physics', 'chemistry', 'english'],
  },
  pcb: {
    label: 'Science (PCB)',
    subjects: ['biology', 'physics', 'chemistry', 'english'],
  },
  commerce: {
    label: 'Commerce',
    subjects: ['accountancy', 'business', 'economics', 'english'],
  },
  humanities: {
    label: 'Humanities',
    subjects: ['history', 'political_science', 'economics', 'english'],
  },
};

export const ALL_CLASS_11_12_SUBJECTS: SubjectKey[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'accountancy',
  'business',
  'economics',
  'history',
  'political_science',
  'english',
];

export function juniorSubjects(board: BoardId = 'cbse'): SubjectKey[] {
  return board === 'icse' ? ICSE_JUNIOR : CBSE_JUNIOR;
}

export function subjectsForClass(
  classLevel: ClassLevel,
  board: BoardId = 'cbse',
  stream?: StreamId | null,
): SubjectKey[] {
  if (classLevel <= 10) return juniorSubjects(board);
  if (!stream) return [];
  return STREAM_META[stream].subjects;
}

export function allSubjectsForClass(classLevel: ClassLevel, board: BoardId = 'cbse'): SubjectKey[] {
  if (classLevel <= 10) return juniorSubjects(board);
  return ALL_CLASS_11_12_SUBJECTS;
}

export function needsStream(classLevel: ClassLevel): boolean {
  return classLevel >= 11;
}

export function subjectGroups(board: BoardId, classLevel: ClassLevel): { label: string; keys: SubjectKey[] }[] {
  if (classLevel <= 10) {
    if (board === 'icse') {
      return [
        { label: 'Core', keys: ['math', 'science', 'english'] },
        { label: 'Humanities', keys: ['history_civics', 'geography'] },
      ];
    }
    return [{ label: 'Subjects', keys: juniorSubjects(board) }];
  }
  return [
    { label: 'Sciences', keys: ['math', 'physics', 'chemistry', 'biology'] },
    { label: 'Commerce', keys: ['accountancy', 'business', 'economics'] },
    { label: 'Humanities', keys: ['history', 'political_science'] },
    { label: 'Language', keys: ['english'] },
  ];
}

/**
 * Map UI/API subject to Qdrant metadata subjectKey values.
 * CBSE Class 6–10 bundles History/Civics/Geography under `social`.
 * ICSE keeps History & Civics and Geography separate.
 */
export function retrievalSubjectKeys(
  board: BoardId,
  classLevel: ClassLevel | undefined,
  subjectId: SubjectKey | undefined,
): SubjectKey[] | undefined {
  if (!subjectId) return undefined;

  if (board === 'cbse' && classLevel != null && classLevel <= 10) {
    if (subjectId === 'history' || subjectId === 'political_science' || subjectId === 'economics') {
      return ['social'];
    }
    if (subjectId === 'history_civics' || subjectId === 'geography') {
      return ['social'];
    }
  }

  return [subjectId];
}

export function corpusSourceForBoard(board: BoardId): string {
  return board === 'icse' ? 'cisce-icse' : 'ncert-cbse';
}

export function contextHintForBoard(board: BoardId, classLevel: ClassLevel): string {
  const meta = getBoardMeta(board);
  if (classLevel <= 10) {
    return board === 'icse'
      ? 'Math, Science, English, History & Civics & Geography'
      : 'Math, Science, English & Social Science';
  }
  return `All ${meta.syllabus} subjects for this class are available`;
}

/** Minimum keyword/similarity score (0–1 normalized) before injecting context. */
export const RETRIEVAL_SCORE_THRESHOLD = 0.35;
