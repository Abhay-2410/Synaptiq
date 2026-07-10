import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import type { BoardId, ClassLevel, StreamId } from '../api/client';
import type { SubjectKey } from '../curriculum';
import { MessageBubble } from './MessageBubble';
import { ExamplePrompts } from './ExamplePrompts';

interface MessageListProps {
  messages: ChatMessage[];
  boardId: BoardId;
  subject: SubjectKey;
  classLevel: ClassLevel;
  streamId?: StreamId;
  onExampleSelect: (prompt: string) => void;
  onSubmitQuickCheck: (messageId: string, answer: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageList({
  messages,
  boardId,
  subject,
  classLevel,
  streamId,
  onExampleSelect,
  onSubmitQuickCheck,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="notebook-area">
      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome-wrap">
            <ExamplePrompts
              boardId={boardId}
              subject={subject}
              classLevel={classLevel}
              streamId={streamId}
              onSelect={onExampleSelect}
              disabled={isLoading}
            />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              subject={subject}
              isFirstAssistant={
                msg.role === 'assistant' &&
                msg.id === messages.find((m) => m.role === 'assistant')?.id
              }
              onSubmitQuickCheck={onSubmitQuickCheck}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
