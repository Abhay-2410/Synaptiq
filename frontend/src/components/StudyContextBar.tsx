import type { BoardId, ClassLevel, StreamId } from '../api/client';
import { contextHintForBoard, getBoardMeta, getSubjectMeta, STREAM_META, type SubjectKey } from '../curriculum';

interface StudyContextBarProps {
  boardId: BoardId;
  classLevel: ClassLevel;
  streamId?: StreamId;
  subject: SubjectKey;
}

export function StudyContextBar({ boardId, classLevel, streamId, subject }: StudyContextBarProps) {
  const subjectLabel = getSubjectMeta(subject).label;
  const streamLabel =
    classLevel >= 11 && streamId ? STREAM_META[streamId].label : null;
  const boardLabel = getBoardMeta(boardId).label;

  return (
    <div className="study-context-bar" aria-label="Current study context">
      <span className="context-chip">{boardLabel}</span>
      <span className="context-chip">Class {classLevel}</span>
      {streamLabel && <span className="context-chip">{streamLabel}</span>}
      <span className="context-chip active">{subjectLabel}</span>
      <span className="context-hint">{contextHintForBoard(boardId, classLevel)}</span>
    </div>
  );
}

export function subjectStorageKey(
  boardId: BoardId,
  classLevel: ClassLevel,
  streamId?: StreamId,
): string {
  if (classLevel >= 11) return `synaptiq_subject_${boardId}_${classLevel}_${streamId ?? 'none'}`;
  return `synaptiq_subject_${boardId}_${classLevel}`;
}
