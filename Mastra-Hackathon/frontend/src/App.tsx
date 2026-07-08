import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askDoubtStream, submitQuickCheckAnswer } from './api/client';
import type { ClassLevel, StreamId } from './api/client';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { SubjectTabs } from './components/SubjectTabs';
import { ClassStreamSelector } from './components/ClassStreamSelector';
import { StudyContextBar, subjectStorageKey } from './components/StudyContextBar';
import { allSubjectsForClass, subjectsForClass, type SubjectKey } from './curriculum';
import type { ChatMessage, PipelineStage } from './types';

function uid() {
  return crypto.randomUUID();
}

function readStoredSubject(classLevel: ClassLevel, streamId?: StreamId): SubjectKey | null {
  const raw = sessionStorage.getItem(subjectStorageKey(classLevel, streamId));
  return raw ? (raw as SubjectKey) : null;
}

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [classLevel, setClassLevel] = useState<ClassLevel>(() => {
    const raw = sessionStorage.getItem('synaptiq_classLevel');
    const n = raw ? Number(raw) : 10;
    return (Number.isFinite(n) ? (n as ClassLevel) : 10) as ClassLevel;
  });
  const [streamId, setStreamId] = useState<StreamId | undefined>(() => {
    const raw = sessionStorage.getItem('synaptiq_streamId');
    return (raw as StreamId | null) ?? undefined;
  });
  const [subject, setSubject] = useState<SubjectKey>(() => {
    const cls = (() => {
      const raw = sessionStorage.getItem('synaptiq_classLevel');
      const n = raw ? Number(raw) : 10;
      return (Number.isFinite(n) ? (n as ClassLevel) : 10) as ClassLevel;
    })();
    const stream = sessionStorage.getItem('synaptiq_streamId') as StreamId | null;
    const saved = readStoredSubject(cls, stream ?? undefined);
    return saved ?? 'math';
  });
  const [masteryBySubject, setMasteryBySubject] = useState<
    Partial<Record<SubjectKey, ChatMessage['mastery']>>
  >({});
  const sessionIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const studyContextRef = useRef<string>('');
  const isLoadingRef = useRef(false);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    sessionStorage.setItem('synaptiq_classLevel', String(classLevel));
  }, [classLevel]);

  useEffect(() => {
    if (streamId) sessionStorage.setItem('synaptiq_streamId', streamId);
    else sessionStorage.removeItem('synaptiq_streamId');
  }, [streamId]);

  useEffect(() => {
    if (classLevel >= 11 && !streamId) {
      setStreamId('pcm');
    }
  }, [classLevel, streamId]);

  const allSubjects = useMemo(
    () => allSubjectsForClass(classLevel),
    [classLevel],
  );

  const streamSubjects = useMemo(
    () => (classLevel >= 11 && streamId ? subjectsForClass(classLevel, streamId) : []),
    [classLevel, streamId],
  );

  const studyContextKey = `${classLevel}-${streamId ?? 'none'}-${subject}`;

  // Restore subject for this class/stream combo; reset chat when context changes.
  useEffect(() => {
    if (classLevel >= 11 && !streamId) return;

    const saved = readStoredSubject(classLevel, streamId);
    const nextSubject =
      saved && allSubjects.includes(saved) ? saved : allSubjects[0] ?? 'math';

    if (nextSubject !== subject) {
      setSubject(nextSubject);
      return;
    }

    if (studyContextRef.current && studyContextRef.current !== studyContextKey) {
      abortRef.current?.abort();
      abortRef.current = null;
      setMessages([]);
      sessionIdRef.current = undefined;
      setIsLoading(false);
    }

    studyContextRef.current = studyContextKey;
  }, [classLevel, streamId, allSubjects, studyContextKey, subject]);

  useEffect(() => {
    sessionStorage.setItem(subjectStorageKey(classLevel, streamId), subject);
  }, [subject, classLevel, streamId]);

  const updateAssistant = useCallback(
    (assistantId: string, patch: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      );
    },
    [],
  );

  const handleSend = useCallback(
    async (doubt: string) => {
      if (isLoadingRef.current) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: doubt,
        timestamp: new Date(),
      };

      const assistantId = uid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        pipelineStage: 'retrieval',
        pipelineMessage: 'Flipping through your textbook…',
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsLoading(true);

      try {
        await askDoubtStream({
          doubt,
          sessionId: sessionIdRef.current,
          subjectId: subject,
          classLevel,
          streamId: classLevel >= 11 ? streamId : undefined,
          signal: controller.signal,
          onEvent: (event) => {
            switch (event.type) {
              case 'status':
                updateAssistant(assistantId, {
                  pipelineStage: event.stage as PipelineStage,
                  pipelineMessage: event.message,
                });
                break;

              case 'retrieval':
                updateAssistant(assistantId, {
                  retrievedChunks: event.chunks,
                });
                break;

              case 'tutor_chunk':
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: m.content + event.delta }
                      : m,
                  ),
                );
                break;

              case 'reasoning_steps':
                updateAssistant(assistantId, {
                  reasoningSteps: event.steps,
                });
                break;

              case 'verification':
                updateAssistant(assistantId, {
                  verification: event.result,
                  content: event.result.answer,
                });
                break;

              case 'agent_trail':
                updateAssistant(assistantId, {
                  agentTrail: event.trail,
                });
                break;

              case 'quick_check':
                updateAssistant(assistantId, {
                  quickCheck: event.quickCheck,
                  mastery: event.mastery,
                });
                setMasteryBySubject((prev) => ({
                  ...prev,
                  [event.mastery.subjectId]: event.mastery,
                }));
                break;

              case 'done':
                sessionIdRef.current = event.result.sessionId;
                updateAssistant(assistantId, {
                  content: event.result.verification.answer,
                  retrievedChunks: event.result.retrievedChunks,
                  reasoningSteps: event.result.verification.reasoningSteps,
                  rawMathExplanation: event.result.draft.rawMathExplanation,
                  agentTrail: event.result.agentTrail,
                  quickCheck: event.result.quickCheck,
                  mastery: event.result.mastery,
                  verification: event.result.verification,
                  pipelineStage: 'done',
                  pipelineMessage: undefined,
                  isStreaming: false,
                });
                setMasteryBySubject((prev) => ({
                  ...prev,
                  [event.result.mastery.subjectId]: event.result.mastery,
                }));
                break;

              case 'error':
                updateAssistant(assistantId, {
                  content: `**Error:** ${event.message}`,
                  pipelineStage: 'error',
                  isStreaming: false,
                });
                break;
            }
          },
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          updateAssistant(assistantId, {
            isStreaming: false,
            pipelineStage: 'error',
            pipelineMessage: undefined,
            content: 'Request cancelled.',
          });
          return;
        }
        updateAssistant(assistantId, {
          content: `**Error:** ${err instanceof Error ? err.message : 'Something went wrong'}`,
          pipelineStage: 'error',
          isStreaming: false,
          pipelineMessage: undefined,
        });
      } finally {
        if (abortRef.current === controller) {
          setIsLoading(false);
        }
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== assistantId) return m;
            if (m.pipelineStage === 'done' || m.pipelineStage === 'error') {
              return { ...m, isStreaming: false };
            }
            return {
              ...m,
              isStreaming: false,
              pipelineStage: 'error',
              pipelineMessage: undefined,
              content:
                m.content ||
                '**Error:** The answer did not finish. Please try asking again.',
            };
          }),
        );
      }
    },
    [subject, classLevel, streamId, updateAssistant],
  );

  const handleQuickCheckSubmit = useCallback(
    async (messageId: string, answer: string) => {
      const message = messages.find((m) => m.id === messageId);
      const quickCheck = message?.quickCheck;
      if (!quickCheck) {
        throw new Error('Quick check is no longer available for this message.');
      }
      if (!sessionIdRef.current) {
        throw new Error(
          'Session was reset — ask a new question first, then try the quick challenge.',
        );
      }

      const result = await submitQuickCheckAnswer(sessionIdRef.current, quickCheck, answer);
      updateAssistant(messageId, {
        quickCheckFeedback: result.feedback,
        mastery: result.mastery,
      });
      setMasteryBySubject((prev) => ({
        ...prev,
        [result.mastery.subjectId]: result.mastery,
      }));
    },
    [messages, updateAssistant],
  );

  const showSubjects = true;

  return (
    <div className="app-shell">
      <aside className="left-col">
        <ClassStreamSelector
          classLevel={classLevel}
          streamId={streamId}
          onClassChange={(c) => {
            setClassLevel(c);
            if (c < 11) setStreamId(undefined);
            else if (!streamId) setStreamId('pcm');
          }}
          onStreamChange={setStreamId}
        />
        {showSubjects && (
          <SubjectTabs
            selected={subject}
            onSelect={setSubject}
            masteryBySubject={masteryBySubject}
            subjects={allSubjects}
            streamSubjects={streamSubjects}
          />
        )}
      </aside>
      <div className="app-main">
        <Header />
        <StudyContextBar classLevel={classLevel} streamId={streamId} subject={subject} />
        <main className="chat-main">
          <MessageList
            key={studyContextKey}
            messages={messages}
            subject={subject}
            classLevel={classLevel}
            onExampleSelect={handleSend}
            onSubmitQuickCheck={handleQuickCheckSubmit}
            isLoading={isLoading}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
