import type { CSSProperties } from 'react';
import { getSubjectMeta, promptsFor, type SubjectKey } from '../curriculum';
import type { ClassLevel } from '../api/client';

interface ExamplePromptsProps {
  subject: SubjectKey;
  classLevel: ClassLevel;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ExamplePrompts({
  subject,
  classLevel,
  onSelect,
  disabled,
}: ExamplePromptsProps) {
  const config = getSubjectMeta(subject);
  const prompts = promptsFor(classLevel, subject);

  return (
    <div className="welcome">
      <p className="welcome-eyebrow">Hey there! 👋</p>
      <h2>What would you like to learn today?</h2>
      <p className="welcome-lead">
        Pick a question below or type your own doubt. I&apos;ll explain it step by step
        using your class NCERT material.
      </p>
      <p className="welcome-subject-hint">
        <span
          className="subject-pill"
          style={{ '--subject-color': config.color } as CSSProperties}
        >
          Class {classLevel} · {config.label}
        </span>
        {' '}— tap a card to get started
      </p>
      <div className="example-prompts" key={`${classLevel}-${subject}`}>
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
