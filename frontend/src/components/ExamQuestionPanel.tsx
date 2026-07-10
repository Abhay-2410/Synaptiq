import type { CSSProperties } from 'react';
import { MathMarkdown } from './MathMarkdown';
import type { ParsedExamQuestionAnswer } from '../utils/examQuestions';

interface ExamQuestionPanelProps {
  data: ParsedExamQuestionAnswer;
  subjectColor?: string;
}

export function ExamQuestionPanel({ data, subjectColor }: ExamQuestionPanelProps) {
  const accentStyle = subjectColor
    ? ({ '--exam-accent': subjectColor } as CSSProperties)
    : undefined;

  return (
    <div className="exam-questions-wrap" style={accentStyle}>
      {data.intro && (
        <div className="exam-questions-intro">
          <MathMarkdown>{data.intro}</MathMarkdown>
        </div>
      )}

      <ol className="exam-questions-list">
        {data.questions.map((q) => (
          <li key={q.number} className="exam-question-card">
            <div className="exam-question-header">
              <span className="exam-question-num">Q{q.number}</span>
              <span className="exam-question-marks">{q.marks}</span>
            </div>
            <div className="exam-question-prompt">
              <MathMarkdown>{q.prompt}</MathMarkdown>
            </div>
            {q.hint && <p className="exam-question-hint">{q.hint}</p>}
          </li>
        ))}
      </ol>

      {data.footer && (
        <p className="exam-questions-footer">{data.footer.replace(/^\*|\*$/g, '')}</p>
      )}
    </div>
  );
}
