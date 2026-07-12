import type { CSSProperties, ReactNode } from 'react';
import {
  getClipSide,
  getFoldCorner,
  getNoteInkColor,
  getNoteTilt,
  getPaperclipColors,
  getPaperRadius,
  getRuleSkew,
  PAPERCLIP_PATH,
} from './stickyNoteTheme';

export interface StickyNoteButtonProps {
  noteId: string;
  index: number;
  color: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  title?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function StickyNoteButton({
  noteId,
  index,
  color,
  active = false,
  disabled = false,
  onClick,
  className = '',
  title,
  style,
  children,
}: StickyNoteButtonProps) {
  const tilt = getNoteTilt(noteId, index);
  const displayTilt = active ? tilt * 0.2 : tilt;
  const clipSide = getClipSide(index);
  const foldCorner = getFoldCorner(index);
  const clipColors = getPaperclipColors(color);
  const ink = getNoteInkColor(color);
  const paperRadius = getPaperRadius(noteId, index);
  const ruleSkew = getRuleSkew(noteId, index);

  return (
    <button
      type="button"
      className={`sticky-note-btn${active ? ' is-active' : ''}${className ? ` ${className}` : ''}`}
      disabled={disabled}
      title={title}
      onClick={onClick}
      style={
        {
          '--note-color': color,
          '--note-tilt': `${displayTilt}deg`,
          '--note-ink': ink.main,
          '--note-ink-sub': ink.sub,
          '--paper-radius': paperRadius,
          '--rule-skew': `${ruleSkew}deg`,
          '--clip-dark': clipColors.dark,
          '--clip-light': clipColors.light,
          ...style,
        } as CSSProperties
      }
    >
      <span className={`sticky-note-clip sticky-note-clip--${clipSide}`} aria-hidden>
        <svg viewBox="0 0 14 30" width="13" height="24" overflow="visible">
          <path
            d={PAPERCLIP_PATH}
            fill="none"
            stroke="var(--clip-dark)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={PAPERCLIP_PATH}
            fill="none"
            stroke="var(--clip-light)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <span className="sticky-note-paper">
        <span className="sticky-note-content">{children}</span>
        <span className="sticky-note-rules" aria-hidden>
          <span className="sticky-note-rule" />
          <span className="sticky-note-rule" />
        </span>
        <span className={`sticky-note-fold sticky-note-fold--${foldCorner}`} aria-hidden />
      </span>
    </button>
  );
}
