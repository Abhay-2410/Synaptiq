import type { VerificationResult } from '../types';

interface VerificationBadgeProps {
  verification: VerificationResult;
}

const CHECK_LABELS: Record<string, string> = {
  hallucination: 'Hallucination',
  adherence: 'Adherence',
  safety: 'Safety',
  relevancy: 'Relevancy',
};

export function VerificationBadge({ verification }: VerificationBadgeProps) {
  return (
    <div className="verification-badge">
      <span className={`verification-stamp ${verification.status}`}>
        {verification.status === 'verified' && '✓ '}
        {verification.status === 'flagged' && '⚠ '}
        {verification.status === 'blocked' && '✕ '}
        {verification.status}
      </span>
      <div className="check-pills">
        {Object.entries(verification.checks).map(([key, check]) => (
          <span key={key} className={`check-pill ${check.passed ? 'pass' : 'fail'}`}>
            {CHECK_LABELS[key] ?? key}
            {check.score !== undefined && ` ${Math.round(check.score * 100)}%`}
          </span>
        ))}
      </div>
      {verification.usedStub && (
        <span className="check-pill check-pill-stub">Enkrypt stub</span>
      )}
      {verification.corrected && verification.correctionNote && (
        <span className="check-pill check-pill-correction">
          Enkrypt caught and corrected: {verification.correctionNote}
        </span>
      )}
    </div>
  );
}
