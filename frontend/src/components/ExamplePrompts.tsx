import type { CSSProperties } from 'react';
import {
  getSubjectMeta,
  promptsFor,
  type BoardId,
  type SubjectKey,
} from '../curriculum';
import type { ClassLevel, StreamId } from '../api/client';

interface ExamplePromptsProps {
  boardId: BoardId;
  subject: SubjectKey;
  classLevel: ClassLevel;
  streamId?: StreamId;
  onSelect: (prompt: string) => void;
  onNotesUpload?: () => void;
  disabled?: boolean;
}

export function ExamplePrompts({
  boardId,
  subject,
  classLevel,
  streamId,
  onSelect,
  onNotesUpload,
  disabled,
}: ExamplePromptsProps) {
  const config = getSubjectMeta(subject);
  const prompts = promptsFor(boardId, classLevel, subject, streamId);

  return (
    <div className="welcome">
      <p className="welcome-eyebrow">Hey there! 👋</p>
      <h2>What would you like to learn today?</h2>
      <p className="welcome-lead">
        Stuck on homework? Ask a doubt below — or upload a photo of messy notes and we'll rewrite
        them clearly for your class.
      </p>
      <p className="welcome-subject-hint">Tap a question card to get started, or use Fix my notes below.</p>

      {onNotesUpload && (
        <button
          type="button"
          className="notes-welcome-cta"
          disabled={disabled}
          onClick={onNotesUpload}
        >
          <span className="notes-welcome-cta-icon" aria-hidden>
            📸
          </span>
          <span className="notes-welcome-cta-text">
            <strong>Messy notebook photo?</strong>
            <small>Tap here — we'll turn it into clean, easy-to-read notes</small>
          </span>
        </button>
      )}

      <div className="example-prompts" key={`${boardId}-${classLevel}-${subject}-${streamId ?? 'none'}`}>
        {prompts.map((prompt, index) => (
          <button
            key={prompt}
            className="example-prompt note-chip"
            style={{
              '--subject-color': config.color,
              '--chip-tilt': '0deg',
              animationDelay: `${index * 60}ms`,
            } as CSSProperties}
            disabled={disabled}
            onClick={() => onSelect(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
