import type { AgentTrailStep } from '../types';

interface AgentTrailPanelProps {
  trail: AgentTrailStep[];
  embedded?: boolean;
}

const STATUS_HINT: Record<string, string> = {
  completed: 'Done',
  flagged: 'Advisory',
  blocked: 'Stopped',
};

export function AgentTrailPanel({ trail, embedded }: AgentTrailPanelProps) {
  if (!trail.length) return null;

  return (
    <div className={`trail-panel ${embedded ? 'embedded' : ''}`}>
      {!embedded && <div className="trail-panel-title">Behind the scenes</div>}
      {embedded && (
        <p className="trail-intro">
          Here is how this answer was built, step by step:
        </p>
      )}
      <div className="trail-list">
        {trail.map((step, index) => (
          <div key={step.id} className="trail-step">
            <div className={`trail-dot ${step.status}`} title={STATUS_HINT[step.status] ?? step.status} />
            <div className="trail-body">
              <div className="trail-label">
                <span className="trail-step-num">{index + 1}</span>
                {step.label}
                <span className={`trail-status-pill status-${step.status}`}>
                  {STATUS_HINT[step.status] ?? step.status}
                </span>
              </div>
              <div className="trail-summary">{step.summary}</div>
              {step.details && <div className="trail-details">{step.details}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
