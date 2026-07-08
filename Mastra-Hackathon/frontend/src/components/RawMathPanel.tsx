import { parseRawMathMarkdown } from '../utils/rawMath';

interface RawMathPanelProps {
  rawMathExplanation: string;
}

export function RawMathPanel({ rawMathExplanation }: RawMathPanelProps) {
  const { title, steps } = parseRawMathMarkdown(rawMathExplanation);

  if (!rawMathExplanation.trim() || steps.length === 0) return null;

  return (
    <div className="step-cards">
      <div className="step-cards-header">
        <span className="step-cards-icon">✏️</span>
        <h3 className="step-cards-title">
          {title.includes('working') || title.includes('Solution') ? title : 'Step-by-step working'}
        </h3>
      </div>
      <ol className="step-cards-list">
        {steps.map((step, index) => (
          <li key={index} className="step-card">
            <span className="step-card-num">{index + 1}</span>
            <div className="step-card-body">
              <div className="step-card-equation">{step.equation}</div>
              {step.explanation && (
                <p className="step-card-explain">{step.explanation}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
