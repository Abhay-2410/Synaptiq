import type { CSSProperties } from 'react';
import {
  getBoardMeta,
  getSubjectMeta,
  promptsFor,
  type BoardId,
  type SubjectKey,
} from '../curriculum';
import type { ClassLevel, StreamId } from '../api/client';

const PROMPT_TILTS = [-1, 1, -1.5] as const;

interface ExamplePromptsProps {
  boardId: BoardId;
  subject: SubjectKey;
  classLevel: ClassLevel;
  streamId?: StreamId;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ExamplePrompts({
  boardId,
  subject,
  classLevel,
  streamId,
  onSelect,
  disabled,
}: ExamplePromptsProps) {
  const config = getSubjectMeta(subject);
  const board = getBoardMeta(boardId);
  const prompts = promptsFor(boardId, classLevel, subject, streamId);

  return (
    <div className="welcome">
      <p className="welcome-eyebrow">Hey there! 👋</p>
      <h2>What would you like to learn today?</h2>
      <p className="welcome-lead">
        Stuck on homework? Pick a question like your classmates would ask — or type your own doubt.
      </p>
      <p className="welcome-subject-hint">
        <span
          className="subject-pill"
          style={{ '--subject-color': config.color } as CSSProperties}
        >
          {board.shortLabel} · Class {classLevel} · {config.label}
        </span>
        {' '}— tap a card to get started
      </p>
      <div className="example-prompts" key={`${boardId}-${classLevel}-${subject}-${streamId ?? 'none'}`}>
        {prompts.map((prompt, index) => (
          <button
            key={prompt}
            className="example-prompt note-chip"
            style={
              {
                '--subject-color': config.color,
                '--chip-tilt': `${PROMPT_TILTS[index % PROMPT_TILTS.length]}deg`,
                animationDelay: `${index * 60}ms`,
              } as CSSProperties
            }
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
