/** Board-aware curriculum catalog — CBSE (NCERT) + ICSE (CISCE) */

export type BoardId = 'cbse' | 'icse';

export type ClassLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StreamId = 'pcm' | 'pcb' | 'commerce' | 'humanities';

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

export type SubjectId = SubjectKey;

export interface BoardMeta {
  id: BoardId;
  label: string;
  shortLabel: string;
  syllabus: string;
  examLabel: string;
}

export const BOARD_META: Record<BoardId, BoardMeta> = {
  cbse: {
    id: 'cbse',
    label: 'CBSE',
    shortLabel: 'CBSE',
    syllabus: 'NCERT',
    examLabel: 'CBSE board',
  },
  icse: {
    id: 'icse',
    label: 'ICSE',
    shortLabel: 'ICSE',
    syllabus: 'CISCE',
    examLabel: 'ICSE/CISCE board',
  },
};

export interface SubjectMeta {
  key: SubjectKey;
  label: string;
  color: string;
  tilt: number;
}

export const SUBJECT_META: Record<SubjectKey, SubjectMeta> = {
  math: { key: 'math', label: 'Math', color: '#E8D66B', tilt: -2 },
  science: { key: 'science', label: 'Science', color: '#6FBF9E', tilt: -1 },
  english: { key: 'english', label: 'English', color: '#C4A484', tilt: 1.5 },
  social: { key: 'social', label: 'Social', color: '#E8A87C', tilt: -1.5 },
  history_civics: { key: 'history_civics', label: 'Hist & Civics', color: '#C4866A', tilt: -2 },
  geography: { key: 'geography', label: 'Geography', color: '#7FA8C9', tilt: 1.2 },
  physics: { key: 'physics', label: 'Physics', color: '#F2795B', tilt: 2 },
  chemistry: { key: 'chemistry', label: 'Chemistry', color: '#9B8EC4', tilt: 1 },
  biology: { key: 'biology', label: 'Biology', color: '#6FBF9E', tilt: -1.5 },
  accountancy: { key: 'accountancy', label: 'Accounts', color: '#7FA8C9', tilt: 2 },
  business: { key: 'business', label: 'Business', color: '#D4A574', tilt: -2 },
  economics: { key: 'economics', label: 'Economics', color: '#E8D66B', tilt: 1.8 },
  history: { key: 'history', label: 'History', color: '#C4866A', tilt: -2.5 },
  political_science: {
    key: 'political_science',
    label: 'Political Science',
    color: '#7FA8C9',
    tilt: 2.2,
  },
};

export const STREAM_META: Record<StreamId, { label: string; subjects: SubjectKey[] }> = {
  pcm: { label: 'Science (PCM)', subjects: ['math', 'physics', 'chemistry', 'english'] },
  pcb: { label: 'Science (PCB)', subjects: ['biology', 'physics', 'chemistry', 'english'] },
  commerce: {
    label: 'Commerce',
    subjects: ['accountancy', 'business', 'economics', 'english'],
  },
  humanities: {
    label: 'Humanities',
    subjects: ['history', 'political_science', 'economics', 'english'],
  },
};

const CBSE_JUNIOR: SubjectKey[] = ['math', 'science', 'english', 'social'];
const ICSE_JUNIOR: SubjectKey[] = ['math', 'science', 'english', 'history_civics', 'geography'];

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

export function parseBoardId(raw: string | null | undefined): BoardId {
  return raw === 'icse' ? 'icse' : 'cbse';
}

export function getBoardMeta(board: BoardId = 'cbse'): BoardMeta {
  return BOARD_META[board];
}

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

export function subjectGroups(
  board: BoardId,
  classLevel: ClassLevel,
): { label: string; keys: SubjectKey[] }[] {
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

export function needsStream(classLevel: ClassLevel): boolean {
  return classLevel >= 11;
}

export function getSubjectMeta(key: SubjectKey): SubjectMeta {
  return SUBJECT_META[key];
}

export function contextHintForBoard(board: BoardId, classLevel: ClassLevel): string {
  if (classLevel <= 10) {
    return board === 'icse'
      ? 'Math, Science, English, History & Civics & Geography'
      : 'Math, Science, English & Social Science';
  }
  const syllabus = getBoardMeta(board).syllabus;
  return `All ${syllabus} subjects for this class are available`;
}

export { promptsFor } from './example-prompts';

export const CHIP_TILTS = [-2.5, 1.8, -1.2, 2.8, -2, 1.5];
