import type { PipelineStage } from '../types';

interface PipelineStatusProps {
  stage?: PipelineStage;
  message?: string;
}

const FRIENDLY: Record<string, string> = {
  retrieval: 'Finding textbook material…',
  tutor: 'Writing your answer…',
  verification: 'Checking answer quality…',
};

export function PipelineStatus({ stage, message }: PipelineStatusProps) {
  if (!stage || stage === 'done') return null;

  const label = message ?? FRIENDLY[stage] ?? 'Thinking…';

  return (
    <div className="pipeline-status">
      <div className="pipeline-spinner" />
      <span className="pipeline-label">{label}</span>
      <span className="pipeline-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}
