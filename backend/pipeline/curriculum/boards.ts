/** Exam board identifiers — thread through API, retrieval, and tutor prompts. */

export type BoardId = 'cbse' | 'icse';

export const BOARD_IDS: BoardId[] = ['cbse', 'icse'];

export interface BoardMeta {
  id: BoardId;
  label: string;
  shortLabel: string;
  syllabus: string;
  examLabel: string;
  publisher: string;
}

export const BOARD_META: Record<BoardId, BoardMeta> = {
  cbse: {
    id: 'cbse',
    label: 'CBSE',
    shortLabel: 'CBSE',
    syllabus: 'NCERT',
    examLabel: 'CBSE board',
    publisher: 'NCERT',
  },
  icse: {
    id: 'icse',
    label: 'ICSE',
    shortLabel: 'ICSE',
    syllabus: 'CISCE',
    examLabel: 'ICSE/CISCE board',
    publisher: 'CISCE',
  },
};

export function parseBoardId(raw: string | null | undefined): BoardId {
  return raw === 'icse' ? 'icse' : 'cbse';
}

export function getBoardMeta(board: BoardId = 'cbse'): BoardMeta {
  return BOARD_META[board];
}

export function boardSyllabusPhrase(board: BoardId = 'cbse'): string {
  const m = getBoardMeta(board);
  return `${m.label} (${m.syllabus})`;
}

export function studentBoardPhrase(board: BoardId = 'cbse', classLevel?: number): string {
  const m = getBoardMeta(board);
  const cls = classLevel != null ? `Class ${classLevel}` : 'Classes 6–12';
  return `${m.label} ${cls}`;
}
