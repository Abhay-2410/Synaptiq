import { useState } from 'react';
import type { ReasoningStep } from '../types';

interface ReasoningPanelProps {
  steps: ReasoningStep[];
}

export function ReasoningPanel({ steps }: ReasoningPanelProps) {
  const [open, setOpen] = useState(false);

  if (!steps.length) return null;

  return (
    <div>
      <button
        className={`panel-toggle ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        {open ? '▼' : '▶'} Reasoning steps ({steps.length})
      </button>
      {open && (
        <div className="panel-content">
          {steps.map((step) => (
            <div key={step.step} className="reasoning-step">
              <div className="step-num">{step.step}</div>
              <div>
                <div className="step-label">{step.label}</div>
                <div className="step-detail">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
