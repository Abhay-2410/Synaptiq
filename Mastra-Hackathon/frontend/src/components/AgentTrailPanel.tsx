import type { AgentTrailStep } from '../types';

interface AgentTrailPanelProps {
  trail: AgentTrailStep[];
  embedded?: boolean;
}

const FRIENDLY_LABELS: Record<string, string> = {
  retrieval: 'Found study notes',
  tutor: 'Built your explanation',
  verification: 'Checked the answer',
  final: 'Ready for you',
};

export function AgentTrailPanel({ trail, embedded }: AgentTrailPanelProps) {
  if (!trail.length) return null;

  return (
    <div className={`trail-panel ${embedded ? 'embedded' : ''}`}>
      {!embedded && <div className="trail-panel-title">Behind the scenes</div>}
      <div className="trail-list">
        {trail.map((step) => (
          <div key={step.id} className="trail-step">
            <div className={`trail-dot ${step.status}`} />
            <div className="trail-body">
              <div className="trail-label">
                {FRIENDLY_LABELS[step.id] ?? step.label}
              </div>
              <div className="trail-summary">{step.summary}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
