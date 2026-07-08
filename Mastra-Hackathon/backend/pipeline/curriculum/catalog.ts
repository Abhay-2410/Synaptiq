/** CBSE class / stream / subject catalog for Synaptiq */

export type ClassLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StreamId = 'pcm' | 'pcb' | 'commerce' | 'humanities';

/**
 * Canonical subject keys used in API + Qdrant metadata.
 * Keep stable — seed scripts and UI both map to these.
 */
export type SubjectKey =
  | 'math'
  | 'science'
  | 'english'
  | 'social'
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

export function subjectsForClass(classLevel: ClassLevel, stream?: StreamId | null): SubjectKey[] {
  if (classLevel <= 10) {
    return ['math', 'science', 'english', 'social'];
  }
  if (!stream) return [];
  return STREAM_META[stream].subjects;
}

/** Every NCERT subject seeded for Class 11–12 (all streams combined). */
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

export function allSubjectsForClass(classLevel: ClassLevel): SubjectKey[] {
  if (classLevel <= 10) return subjectsForClass(classLevel);
  return ALL_CLASS_11_12_SUBJECTS;
}

export function needsStream(classLevel: ClassLevel): boolean {
  return classLevel >= 11;
}

/** Minimum keyword/similarity score (0–1 normalized) before injecting context. */
export const RETRIEVAL_SCORE_THRESHOLD = 0.35;
