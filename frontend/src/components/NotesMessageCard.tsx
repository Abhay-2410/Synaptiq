import { useState } from 'react';
import { MathMarkdown } from './MathMarkdown';
import { AgentTrailPanel } from './AgentTrailPanel';
import type { NotesSimplifyResult } from '../types';
import { getSubjectMeta, type SubjectKey } from '../curriculum';
import type { ClassLevel } from '../api/client';

interface NotesMessageCardProps {
  result: NotesSimplifyResult;
  fileName: string;
  subject: SubjectKey;
  classLevel: ClassLevel;
}

export function downloadNotesPdf(result: NotesSimplifyResult): void {
  if (!result.pdfBase64) return;
  const bytes = Uint8Array.from(atob(result.pdfBase64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.pdfFileName || `Study-Notes.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export function NotesMessageCard({ result, fileName, subject, classLevel }: NotesMessageCardProps) {
  const displayLabel = result.resolvedSubjectLabel ?? getSubjectMeta(subject).label;
  const displayClass = classLevel;
  const [showTrail, setShowTrail] = useState(false);
  const hasTrail = (result.agentTrail?.length ?? 0) > 0;

  return (
    <div className="notes-message-card">
      <p className="notes-message-lead">
        Got it! Here are your <strong>{displayLabel}</strong> notes rewritten with key points and examples for{' '}
        <strong>Class {displayClass}</strong>.
      </p>

      {result.subjectAdjusted && (
        <p className="notes-subject-detected">
          We recognised these as <strong>{displayLabel}</strong> notes from the content you uploaded.
        </p>
      )}

      {result.warnings.length > 0 && (
        <div className="notes-warnings" role="alert">
          {result.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      {result.extractionQuality === 'poor' && (
        <p className="notes-quality-note">
          Some parts were hard to read — double-check anything that looks off.
        </p>
      )}

      <div className="notes-message-preview">
        <MathMarkdown>{result.simplifiedMarkdown}</MathMarkdown>
      </div>

      <div className="notes-message-actions">
        <button
          type="button"
          className="notes-download-btn"
          onClick={() => downloadNotesPdf(result)}
        >
          Save {displayLabel} notes (PDF)
        </button>
        {hasTrail && (
          <button
            type="button"
            className="notes-trail-toggle"
            onClick={() => setShowTrail((v) => !v)}
            aria-expanded={showTrail}
          >
            {showTrail ? 'Hide' : 'See'} how this was made
          </button>
        )}
        <span className="notes-message-file">From: {fileName}</span>
      </div>

      {hasTrail && showTrail && result.agentTrail && (
        <AgentTrailPanel trail={result.agentTrail} embedded />
      )}
    </div>
  );
}
