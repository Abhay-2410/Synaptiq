import type { ClassLevel, StreamId } from '../api/client';
import { getSubjectMeta, STREAM_META, type SubjectKey } from '../curriculum';

interface StudyContextBarProps {
  classLevel: ClassLevel;
  streamId?: StreamId;
  subject: SubjectKey;
}

export function StudyContextBar({ classLevel, streamId, subject }: StudyContextBarProps) {
  const subjectLabel = getSubjectMeta(subject).label;
  const streamLabel =
    classLevel >= 11 && streamId ? STREAM_META[streamId].label : null;

  return (
    <div className="study-context-bar" aria-label="Current study context">
      <span className="context-chip">Class {classLevel}</span>
      {streamLabel && <span className="context-chip">{streamLabel}</span>}
      <span className="context-chip active">{subjectLabel}</span>
      <span className="context-hint">All NCERT subjects for this class are available</span>
    </div>
  );
}

export function subjectStorageKey(classLevel: ClassLevel, streamId?: StreamId): string {
  if (classLevel >= 11) return `synaptiq_subject_${classLevel}_${streamId ?? 'none'}`;
  return `synaptiq_subject_${classLevel}`;
}
