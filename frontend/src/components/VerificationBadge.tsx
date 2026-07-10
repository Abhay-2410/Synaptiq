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

function advisoryNote(verification: VerificationResult): string | null {
  if (verification.flags?.includes('enkrypt_rate_limited')) {
    return 'Advisory: safety check was rate-limited — answer delivered with a caution flag.';
  }
  if (verification.flags?.includes('enkrypt_timeout')) {
    return 'Advisory: safety check timed out — answer delivered with a caution flag.';
  }
  if (verification.status === 'flagged' && !verification.flags?.length) {
    return 'Advisory: minor issue flagged during safety review.';
  }
  return null;
}

export function VerificationBadge({ verification }: VerificationBadgeProps) {
  const advisory = advisoryNote(verification);

  return (
    <div className={`verification-badge-wrap status-${verification.status}`}>
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
        {verification.verificationUnavailable && (
          <span className="check-pill check-pill-stub">Safety check unavailable</span>
        )}
        {verification.flags?.includes('enkrypt_rate_limited') && (
          <span className="check-pill check-pill-stub">Rate limited (advisory)</span>
        )}
        {verification.flags?.includes('enkrypt_timeout') && (
          <span className="check-pill check-pill-stub">Check timed out (advisory)</span>
        )}
        {verification.usedStub && !verification.verificationUnavailable && (
          <span className="check-pill check-pill-stub">Dev mode</span>
        )}
        {verification.corrected && verification.correctionNote && (
          <span className="check-pill check-pill-correction">
            Corrected: {verification.correctionNote}
          </span>
        )}
      </div>
      {advisory && <p className="verification-advisory">{advisory}</p>}
    </div>
  );
}
