import type { CSSProperties } from 'react';
import { MathMarkdown } from './MathMarkdown';
import { parseRawMathMarkdown } from '../utils/rawMath';

interface RawMathPanelProps {
  rawMathExplanation: string;
  subjectColor?: string;
}

export function RawMathPanel({ rawMathExplanation, subjectColor }: RawMathPanelProps) {
  const { steps } = parseRawMathMarkdown(rawMathExplanation);

  if (!rawMathExplanation.trim() || steps.length === 0) return null;

  return (
    <div
      className="step-cards"
      style={subjectColor ? ({ '--step-accent': subjectColor } as CSSProperties) : undefined}
    >
      <div className="step-cards-header">
        <span className="step-cards-icon">✏️</span>
        <h3 className="step-cards-title">
          Step-by-step working ({steps.length} steps)
        </h3>
      </div>
      <ol className="step-cards-list">
        {steps.map((step, index) => (
          <li key={index} className="step-card">
            <span className="step-card-num">{index + 1}</span>
            <div className="step-card-body">
              <div className="step-card-equation">
                <MathMarkdown>{step.equation}</MathMarkdown>
              </div>
              {step.explanation && (
                <div className="step-card-explain">
                  <span className="step-card-explain-label">Why:</span>
                  <MathMarkdown>{step.explanation}</MathMarkdown>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
