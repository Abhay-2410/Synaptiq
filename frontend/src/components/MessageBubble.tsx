import { useState } from 'react';
import { MathMarkdown } from './MathMarkdown';
import type { ChatMessage } from '../types';
import type { SubjectKey } from '../curriculum';
import { PipelineStatus } from './PipelineStatus';
import { RawMathPanel } from './RawMathPanel';
import { AgentTrailPanel } from './AgentTrailPanel';
import { QuickCheckPanel } from './QuickCheckPanel';
import { VerificationBadge } from './VerificationBadge';
import { ContextPanel } from './ContextPanel';
import { formatStudentAnswer } from '../utils/studentAnswer';
import { parseExamQuestionAnswer } from '../utils/examQuestions';
import { ExamQuestionPanel } from './ExamQuestionPanel';
import { getSubjectMeta } from '../curriculum';

interface MessageBubbleProps {
  message: ChatMessage;
  subject: SubjectKey;
  isFirstAssistant?: boolean;
  onSubmitQuickCheck: (messageId: string, answer: string) => Promise<void>;
}

export function MessageBubble({
  message,
  subject,
  isFirstAssistant,
  onSubmitQuickCheck,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [showBehindTheScenes, setShowBehindTheScenes] = useState(Boolean(isFirstAssistant));

  const subjectColor = getSubjectMeta(subject).color;
  const hasSteps = Boolean(message.rawMathExplanation?.trim());
  const hasMaterial = (message.retrievedChunks?.length ?? 0) > 0;
  const isFinished =
    !message.isStreaming &&
    (message.pipelineStage === 'done' || message.pipelineStage === 'error');
  const isDone = message.pipelineStage === 'done';

  const displayAnswer = !isUser
    ? formatStudentAnswer(message.content, {
        hasStepByStep: hasSteps,
        hasRetrievedMaterial: hasMaterial,
        hasQuickCheck: Boolean(message.quickCheckSession),
      })
    : message.content;

  const showAnswerBody =
    !isUser && (displayAnswer || message.isStreaming);

  const showUserBubble = isUser && Boolean(message.content?.trim());
  const examQuestions = !isUser && displayAnswer ? parseExamQuestionAnswer(displayAnswer) : null;

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'tutor-avatar'}`}>
        {isUser ? '🙂' : '🎓'}
      </div>
      <div className="message-body">
        {!isUser && message.pipelineStage && message.pipelineStage !== 'done' && message.isStreaming && (
          <PipelineStatus stage={message.pipelineStage} message={message.pipelineMessage} />
        )}

        {showUserBubble && (
          <div className="message-bubble">
            <MathMarkdown>{message.content}</MathMarkdown>
          </div>
        )}

        {(showAnswerBody || (isFinished && message.pipelineStage === 'error')) && (
          <div className={`message-bubble ${examQuestions ? 'message-bubble-exam' : ''}`}>
            <div className={message.isStreaming ? 'streaming-cursor' : ''}>
              {examQuestions ? (
                <ExamQuestionPanel data={examQuestions} subjectColor={subjectColor} />
              ) : (
                <MathMarkdown>{displayAnswer || ' '}</MathMarkdown>
              )}
            </div>
          </div>
        )}

        {!isUser && isDone && (
          <div className="message-extras">
            {message.verification && (
              <VerificationBadge verification={message.verification} />
            )}

            {hasMaterial && message.retrievedChunks && (
              <ContextPanel chunks={message.retrievedChunks} />
            )}

            {hasSteps && (
              <RawMathPanel
                rawMathExplanation={message.rawMathExplanation!}
                subjectColor={subjectColor}
              />
            )}

            {message.quickCheckSession && message.quickCheckState && (
              <QuickCheckPanel
                session={message.quickCheckSession}
                state={message.quickCheckState}
                onSubmit={(answer) => onSubmitQuickCheck(message.id, answer)}
              />
            )}

            {(message.agentTrail?.length ?? 0) > 0 && (
              <div className="behind-the-scenes">
                <button
                  type="button"
                  className="behind-the-scenes-toggle"
                  onClick={() => setShowBehindTheScenes((v) => !v)}
                >
                  {showBehindTheScenes ? '▲ Hide pipeline steps' : '💡 How was this answer built?'}
                </button>
                {showBehindTheScenes && message.agentTrail && (
                  <AgentTrailPanel trail={message.agentTrail} embedded />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
