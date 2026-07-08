import { useState } from 'react';
import type { MasteryState, QuickCheck } from '../types';

interface QuickCheckPanelProps {
  quickCheck: QuickCheck;
  mastery?: MasteryState;
  feedback?: string;
  onSubmit: (answer: string) => Promise<void>;
}

export function QuickCheckPanel({
  quickCheck,
  mastery,
  feedback,
  onSubmit,
}: QuickCheckPanelProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const masteryPct = mastery?.score ?? 0;
  const topicLabel =
    mastery?.topic && mastery.topic !== 'General' ? mastery.topic : 'this topic';

  async function handleSubmit() {
    if (!value.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(value.trim());
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1200);
      setValue('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your answer.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`quick-check-card ${celebrate ? 'celebrate' : ''}`}>
      <div className="quick-check-header">
        <span className="quick-check-badge">Quick challenge</span>
        {mastery && (
          <div className="mastery-ring" title={`${mastery.correct}/${mastery.attempts} correct`}>
            <svg viewBox="0 0 36 36" className="mastery-ring-svg">
              <path
                className="mastery-ring-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="mastery-ring-fill"
                strokeDasharray={`${masteryPct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="mastery-ring-label">{masteryPct}%</span>
          </div>
        )}
      </div>

      <p className="quick-check-q">{quickCheck.question.replace(/^Quick check:\s*/i, '')}</p>

      <div className="quick-check-row">
        <input
          className="quick-check-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void handleSubmit();
            }
          }}
        />
        <button
          type="button"
          className="quick-check-submit"
          disabled={!value.trim() || submitting}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '…' : 'Go!'}
        </button>
      </div>

      {(feedback || submitError) && (
        <p
          className={`quick-check-feedback ${
            submitError
              ? 'error'
              : feedback &&
                  (feedback.toLowerCase().includes('correct') ||
                    feedback.toLowerCase().includes('nice'))
                ? 'success'
                : ''
          }`}
        >
          {submitError ?? feedback}
        </p>
      )}

      {mastery && mastery.attempts > 0 && (
        <p className="quick-check-mastery">
          {mastery.correct} of {mastery.attempts} right on {topicLabel}
        </p>
      )}
    </div>
  );
}
