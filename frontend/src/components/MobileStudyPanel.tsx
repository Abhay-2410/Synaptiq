import { useState, type ReactNode } from 'react';
import type { BoardId, ClassLevel, StreamId } from '../api/client';
import { getBoardMeta, getSubjectMeta, STREAM_META, type SubjectKey } from '../curriculum';

interface MobileStudyPanelProps {
  boardId: BoardId;
  classLevel: ClassLevel;
  streamId?: StreamId;
  subject: SubjectKey;
  children: ReactNode;
}

export function MobileStudyPanel({
  boardId,
  classLevel,
  streamId,
  subject,
  children,
}: MobileStudyPanelProps) {
  const [open, setOpen] = useState(false);
  const subjectLabel = getSubjectMeta(subject).label;
  const boardLabel = getBoardMeta(boardId).shortLabel;
  const streamLabel = classLevel >= 11 && streamId ? STREAM_META[streamId].label : null;

  return (
    <aside className={`left-col ${open ? 'left-col--open' : 'left-col--collapsed'}`}>
      <button
        type="button"
        className="mobile-study-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="study-panel-content"
      >
        <span className="mobile-study-toggle-label">
          <span className="mobile-study-toggle-title">Study setup</span>
          <span className="mobile-study-toggle-summary">
            {boardLabel} · Class {classLevel}
            {streamLabel ? ` · ${streamLabel}` : ''} · {subjectLabel}
          </span>
        </span>
        <span className="mobile-study-toggle-chevron" aria-hidden>
          {open ? '▾' : '▸'}
        </span>
      </button>
      <div id="study-panel-content" className="mobile-study-content">
        {children}
      </div>
    </aside>
  );
}
