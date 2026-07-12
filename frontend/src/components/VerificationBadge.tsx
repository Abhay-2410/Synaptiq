import type { VerificationResult } from '../types';

interface VerificationBadgeProps {
  verification: VerificationResult;
}

const INFRA_ADVISORY_FLAGS = new Set(['enkrypt_rate_limited', 'enkrypt_timeout']);

function isInfraOnlyAdvisory(verification: VerificationResult): boolean {
  const flags = verification.flags ?? [];
  return flags.length > 0 && flags.every((flag) => INFRA_ADVISORY_FLAGS.has(flag));
}

function shortNote(verification: VerificationResult): string | null {
  if (isInfraOnlyAdvisory(verification)) {
    return null;
  }
  if (verification.verificationUnavailable) {
    return 'Safety check unavailable.';
  }
  if (verification.status === 'blocked') {
    return 'This answer did not pass safety review.';
  }
  if (verification.status === 'flagged') {
    return 'Minor issue flagged during safety review.';
  }
  if (verification.corrected && verification.correctionNote) {
    return `Corrected: ${verification.correctionNote}`;
  }
  return null;
}

export function VerificationBadge({ verification }: VerificationBadgeProps) {
  if (isInfraOnlyAdvisory(verification)) {
    return null;
  }

  if (verification.status === 'verified' && !shortNote(verification)) {
    return null;
  }

  const note = shortNote(verification);

  return (
    <div className={`verification-badge-wrap verification-badge-wrap--minimal status-${verification.status}`}>
      <span className={`verification-stamp ${verification.status}`}>
        {verification.status === 'verified' && '✓ '}
        {verification.status === 'flagged' && '⚠ '}
        {verification.status === 'blocked' && '✕ '}
        {verification.status}
      </span>
      {note && <span className="verification-note">{note}</span>}
    </div>
  );
}
