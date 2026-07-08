import { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import type { ClassLevel } from '../api/client';
import type { SubjectKey } from '../curriculum';
import { MessageBubble } from './MessageBubble';
import { ExamplePrompts } from './ExamplePrompts';

interface MessageListProps {
  messages: ChatMessage[];
  subject: SubjectKey;
  classLevel: ClassLevel;
  onExampleSelect: (prompt: string) => void;
  onSubmitQuickCheck: (messageId: string, answer: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageList({
  messages,
  subject,
  classLevel,
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
              subject={subject}
              classLevel={classLevel}
              onSelect={onExampleSelect}
              disabled={isLoading}
            />
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onSubmitQuickCheck={onSubmitQuickCheck} />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
