import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../types';
import { PipelineStatus } from './PipelineStatus';
import { RawMathPanel } from './RawMathPanel';
import { AgentTrailPanel } from './AgentTrailPanel';
import { QuickCheckPanel } from './QuickCheckPanel';
import { answerLooksEmpty, formatStudentAnswer } from '../utils/studentAnswer';

interface MessageBubbleProps {
  message: ChatMessage;
  onSubmitQuickCheck: (messageId: string, answer: string) => Promise<void>;
}

export function MessageBubble({ message, onSubmitQuickCheck }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [showBehindTheScenes, setShowBehindTheScenes] = useState(false);

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
      })
    : message.content;

  const showAnswerBody =
    !isUser &&
    (displayAnswer || message.isStreaming) &&
    !(isDone && hasSteps && answerLooksEmpty(message.content));

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'tutor-avatar'}`}>
        {isUser ? '🙂' : '🎓'}
      </div>
      <div className="message-body">
        {!isUser && message.pipelineStage && message.pipelineStage !== 'done' && message.isStreaming && (
          <PipelineStatus stage={message.pipelineStage} message={message.pipelineMessage} />
        )}

        {(showAnswerBody || (isFinished && message.pipelineStage === 'error')) && (
          <div className="message-bubble">
            <div className={message.isStreaming ? 'streaming-cursor' : ''}>
              <ReactMarkdown>{displayAnswer || ' '}</ReactMarkdown>
            </div>
          </div>
        )}

        {!isUser && isDone && (
          <div className="message-extras">
            {hasSteps && (
              <RawMathPanel rawMathExplanation={message.rawMathExplanation!} />
            )}

            {message.quickCheck && (
              <QuickCheckPanel
                quickCheck={message.quickCheck}
                mastery={message.mastery}
                feedback={message.quickCheckFeedback}
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
                  {showBehindTheScenes ? '▲ Hide' : '💡 Curious how this was made?'}
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
