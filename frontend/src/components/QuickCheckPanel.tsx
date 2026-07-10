import { useState } from 'react';
import { MathMarkdown } from './MathMarkdown';
import type { QuickCheckSession, QuickCheckSessionState } from '../types';

interface QuickCheckPanelProps {
  session: QuickCheckSession;
  state: QuickCheckSessionState;
  onSubmit: (answer: string) => Promise<void>;
}

function verdictClass(verdict?: string): string {
  if (verdict === 'correct') return 'success';
  if (verdict === 'partial') return 'partial';
  if (verdict === 'incorrect') return 'error';
  return '';
}

export function QuickCheckPanel({ session, state, onSubmit }: QuickCheckPanelProps) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isComplete = state.status === 'completed';
  const currentQuestion = session.questions[state.currentIndex];
  const questionNumber = Math.min(state.currentIndex + 1, session.totalQuestions);
  const progressPct = Math.round((state.responses.length / session.totalQuestions) * 100);

  const topicLabel =
    session.topic && session.topic !== 'General' ? session.topic : 'this topic';

  const showFeedback = Boolean(submitError || (celebrate && state.lastFeedback));

  async function handleSubmit() {
    if (!value.trim() || submitting || isComplete) return;
    setSubmitting(true);
    setSubmitError(null);
    setCelebrate(false);
    try {
      await onSubmit(value.trim());
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 1800);
      setValue('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your answer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === 'abandoned') {
    return (
      <div className="quick-check-card quick-check-abandoned">
        <span className="quick-check-badge">Quick challenge</span>
        <p className="quick-check-abandoned-msg">
          This challenge ended when you asked a new question. Use the latest answer above to try a fresh one.
        </p>
      </div>
    );
  }

  if (isComplete && state.finalAnalysis) {
    return (
      <div className="quick-check-card quick-check-summary">
        <div className="quick-check-header">
          <span className="quick-check-badge">Quick challenge complete</span>
          <div className="quick-check-progress-pill">
            {state.correctCount} of {session.totalQuestions} right
          </div>
        </div>
        <div className="quick-check-analysis">
          <MathMarkdown>{state.finalAnalysis}</MathMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className={`quick-check-card ${celebrate ? 'celebrate' : ''}`}>
      <div className="quick-check-header">
        <span className="quick-check-badge">Quick challenge</span>
        <div className="quick-check-progress-group">
          <span className="quick-check-progress-pill">
            Question {questionNumber} of {session.totalQuestions}
          </span>
          <div className="mastery-ring" title={`${state.correctCount} of ${state.responses.length} correct so far`}>
            <svg viewBox="0 0 36 36" className="mastery-ring-svg">
              <path
                className="mastery-ring-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="mastery-ring-fill"
                strokeDasharray={`${progressPct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="mastery-ring-label">{progressPct}%</span>
          </div>
        </div>
      </div>

      {state.responses.length > 0 && (
        <p className="quick-check-score">
          {state.correctCount} of {state.responses.length} right so far on {topicLabel}
        </p>
      )}

      {currentQuestion && (
        <p className="quick-check-q">
          {currentQuestion.question.replace(/^Quick check:\s*/i, '')}
        </p>
      )}

      <div className="quick-check-row">
        <input
          className="quick-check-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer…"
          disabled={isComplete || !currentQuestion}
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
          disabled={!value.trim() || submitting || isComplete || !currentQuestion}
          onClick={() => void handleSubmit()}
        >
          {submitting ? '…' : 'Go!'}
        </button>
      </div>

      {showFeedback && (
        <div className="quick-check-feedback-wrap">
          {celebrate && state.lastVerdict === 'correct' && (
            <span className="quick-check-mastery-bump">+1 mastery</span>
          )}
          <p
            className={`quick-check-feedback ${submitError ? 'error' : verdictClass(state.lastVerdict)}`}
          >
            {submitError ?? (
              <>
                {state.lastScore !== undefined && (
                  <span className="quick-check-score-badge">{state.lastScore}%</span>
                )}{' '}
                {state.lastFeedback}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
