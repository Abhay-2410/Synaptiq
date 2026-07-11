import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { askDoubtStream, ASK_ERROR_MESSAGE, submitQuickCheckAnswer } from './api/client';
import type { BoardId, ClassLevel, StreamId } from './api/client';
import { BoardSelector } from './components/BoardSelector';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { MessageList } from './components/MessageList';
import { SubjectTabs } from './components/SubjectTabs';
import { ClassStreamSelector } from './components/ClassStreamSelector';
import { StudyContextBar, subjectStorageKey } from './components/StudyContextBar';
import { MobileStudyPanel } from './components/MobileStudyPanel';
import {
  allSubjectsForClass,
  parseBoardId,
  subjectsForClass,
  type SubjectKey,
} from './curriculum';
import type { ChatMessage, NotesSimplifyResult, PipelineStage } from './types';

const VALID_CLASSES: ClassLevel[] = [6, 7, 8, 9, 10, 11, 12];
const VALID_STREAMS: StreamId[] = ['pcm', 'pcb', 'commerce', 'humanities'];

function uid() {
  return crypto.randomUUID();
}

function parseClassLevel(raw: string | null): ClassLevel {
  const n = raw ? Number(raw) : 10;
  return (VALID_CLASSES.includes(n as ClassLevel) ? n : 10) as ClassLevel;
}

function parseStreamId(raw: string | null): StreamId | undefined {
  if (!raw || !VALID_STREAMS.includes(raw as StreamId)) return undefined;
  return raw as StreamId;
}

function readStoredSubject(
  boardId: BoardId,
  classLevel: ClassLevel,
  streamId?: StreamId,
): SubjectKey | null {
  const raw = sessionStorage.getItem(subjectStorageKey(boardId, classLevel, streamId));
  return raw ? (raw as SubjectKey) : null;
}

function resolveSubject(
  boardId: BoardId,
  classLevel: ClassLevel,
  streamId: StreamId | undefined,
  subjects: SubjectKey[],
): SubjectKey {
  const saved = readStoredSubject(boardId, classLevel, streamId);
  if (saved && subjects.includes(saved)) return saved;
  return subjects[0] ?? 'math';
}

function readStoredStream(): StreamId | undefined {
  return parseStreamId(sessionStorage.getItem('synaptiq_streamId'));
}

function initialBoardId(): BoardId {
  return parseBoardId(sessionStorage.getItem('synaptiq_boardId'));
}

function initialClassLevel(): ClassLevel {
  return parseClassLevel(sessionStorage.getItem('synaptiq_classLevel'));
}

function initialStreamId(classLevel: ClassLevel): StreamId | undefined {
  if (classLevel < 11) return undefined;
  return readStoredStream() ?? 'pcm';
}

export default function App() {
  const bootBoard = initialBoardId();
  const bootClass = initialClassLevel();
  const bootStream = initialStreamId(bootClass);
  const bootSubjects = allSubjectsForClass(bootClass, bootBoard);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [boardId, setBoardId] = useState<BoardId>(bootBoard);
  const [classLevel, setClassLevel] = useState<ClassLevel>(bootClass);
  const [streamId, setStreamId] = useState<StreamId | undefined>(bootStream);
  const [subject, setSubject] = useState<SubjectKey>(() =>
    resolveSubject(bootBoard, bootClass, bootStream, bootSubjects),
  );
  const [masteryBySubject, setMasteryBySubject] = useState<
    Partial<Record<SubjectKey, ChatMessage['mastery']>>
  >({});

  const sessionIdRef = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const notesUploadRef = useRef<(() => void) | null>(null);
  const studyContextRef = useRef<string>('');
  const isLoadingRef = useRef(false);

  const allSubjects = useMemo(
    () => allSubjectsForClass(classLevel, boardId),
    [classLevel, boardId],
  );

  const streamSubjects = useMemo(() => {
    if (classLevel < 11 || !streamId) return [];
    return subjectsForClass(classLevel, boardId, streamId);
  }, [classLevel, boardId, streamId]);

  const studyContextKey = `${boardId}-${classLevel}-${streamId ?? 'none'}-${subject}`;

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    studyContextRef.current = studyContextKey;
  }, [studyContextKey]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('synaptiq_boardId', boardId);
  }, [boardId]);

  useEffect(() => {
    sessionStorage.setItem('synaptiq_classLevel', String(classLevel));
  }, [classLevel]);

  useEffect(() => {
    if (streamId) sessionStorage.setItem('synaptiq_streamId', streamId);
  }, [streamId]);

  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    sessionIdRef.current = undefined;
    setIsLoading(false);
    setMasteryBySubject({});
  }, []);

  const handleBoardChange = useCallback(
    (nextBoard: BoardId) => {
      if (nextBoard === boardId) return;
      resetChat();
      const subjects = allSubjectsForClass(classLevel, nextBoard);
      const nextSubject = resolveSubject(nextBoard, classLevel, streamId, subjects);

      sessionStorage.setItem('synaptiq_boardId', nextBoard);
      sessionStorage.setItem(subjectStorageKey(nextBoard, classLevel, streamId), nextSubject);
      setBoardId(nextBoard);
      setSubject(nextSubject);
    },
    [boardId, classLevel, streamId, resetChat],
  );

  const handleClassChange = useCallback(
    (nextClass: ClassLevel) => {
      resetChat();
      const nextStream = nextClass >= 11 ? readStoredStream() ?? 'pcm' : undefined;
      const subjects = allSubjectsForClass(nextClass, boardId);
      const nextSubject = resolveSubject(boardId, nextClass, nextStream, subjects);

      setClassLevel(nextClass);
      setStreamId(nextStream);
      setSubject(nextSubject);
      sessionStorage.setItem(subjectStorageKey(boardId, nextClass, nextStream), nextSubject);
      if (nextStream) sessionStorage.setItem('synaptiq_streamId', nextStream);
    },
    [boardId, resetChat],
  );

  const handleStreamChange = useCallback(
    (nextStream: StreamId) => {
      resetChat();
      const subjects = subjectsForClass(classLevel, boardId, nextStream);
      const nextSubject = resolveSubject(boardId, classLevel, nextStream, subjects);

      sessionStorage.setItem('synaptiq_streamId', nextStream);
      sessionStorage.setItem(subjectStorageKey(boardId, classLevel, nextStream), nextSubject);
      setStreamId(nextStream);
      setSubject(nextSubject);
    },
    [boardId, classLevel, resetChat],
  );

  const handleSubjectSelect = useCallback(
    (nextSubject: SubjectKey) => {
      if (nextSubject === subject) return;
      resetChat();
      sessionStorage.setItem(subjectStorageKey(boardId, classLevel, streamId), nextSubject);
      setSubject(nextSubject);
    },
    [boardId, classLevel, streamId, subject, resetChat],
  );

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

      const requestContextKey = studyContextRef.current;

      const priorMessages = messages
        .filter((m) => {
          if (!m.content.trim()) return false;
          if (m.role === 'user') return true;
          return m.pipelineStage === 'done';
        })
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

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
        pipelineMessage: 'Finding textbook material…',
      };

      setMessages((prev) => [
        ...prev.map((m) =>
          m.role === 'assistant' &&
          m.quickCheckSession &&
          m.quickCheckState?.status === 'active'
            ? {
                ...m,
                quickCheckState: { ...m.quickCheckState!, status: 'abandoned' as const },
              }
            : m,
        ),
        userMsg,
        assistantMsg,
      ]);
      setIsLoading(true);

      const isStale = () => requestContextKey !== studyContextRef.current;

      try {
        await askDoubtStream({
          doubt,
          sessionId: sessionIdRef.current,
          boardId,
          subjectId: subject,
          classLevel,
          streamId: classLevel >= 11 ? streamId : undefined,
          priorMessages: priorMessages.length > 0 ? priorMessages : undefined,
          signal: controller.signal,
          onEvent: (event) => {
            if (isStale()) return;

            switch (event.type) {
              case 'integration_status':
                updateAssistant(assistantId, {
                  stackHealth: event.stack,
                });
                break;

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

              case 'quick_check_session':
                updateAssistant(assistantId, {
                  quickCheckSession: event.session,
                  quickCheckState: {
                    currentIndex: 0,
                    responses: [],
                    correctCount: 0,
                    status: 'active',
                  },
                  mastery: event.mastery,
                });
                setMasteryBySubject((prev) => ({
                  ...prev,
                  [event.mastery.subjectId]: event.mastery,
                }));
                break;

              case 'done':
                if (isStale()) return;
                sessionIdRef.current = event.result.sessionId;
                updateAssistant(assistantId, {
                  content: event.result.verification.answer,
                  retrievedChunks: event.result.retrievedChunks,
                  reasoningSteps: event.result.verification.reasoningSteps,
                  rawMathExplanation: event.result.draft.rawMathExplanation,
                  agentTrail: event.result.agentTrail,
                  quickCheckSession: event.result.quickCheckSession,
                  quickCheckState: event.result.quickCheckSession
                    ? {
                        currentIndex: 0,
                        responses: [],
                        correctCount: 0,
                        status: 'active',
                      }
                    : undefined,
                  mastery: event.result.mastery,
                  verification: event.result.verification,
                  stackHealth: event.result.stackHealth,
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
        if (isStale()) return;
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
          content: `**Error:** ${err instanceof Error ? err.message : ASK_ERROR_MESSAGE}`,
          pipelineStage: 'error',
          isStreaming: false,
          pipelineMessage: undefined,
        });
      } finally {
        if (isStale()) return;
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
              content: m.content || `**Error:** ${ASK_ERROR_MESSAGE}`,
            };
          }),
        );
      }
    },
    [boardId, subject, classLevel, streamId, messages, updateAssistant],
  );

  const handleRetry = useCallback(
    (assistantMessageId: string) => {
      if (isLoadingRef.current) return;
      const idx = messages.findIndex((m) => m.id === assistantMessageId);
      if (idx <= 0) return;
      for (let i = idx - 1; i >= 0; i--) {
        if (messages[i]?.role === 'user' && messages[i].content.trim()) {
          void handleSend(messages[i].content);
          return;
        }
      }
    },
    [messages, handleSend],
  );

  const handleQuickCheckSubmit = useCallback(
    async (messageId: string, answer: string) => {
      const message = messages.find((m) => m.id === messageId);
      const session = message?.quickCheckSession;
      const state = message?.quickCheckState;
      if (!session || !state) {
        throw new Error('Quick challenge is no longer available for this message.');
      }
      if (state.status === 'completed') {
        throw new Error('This Quick Challenge is already complete.');
      }
      if (!sessionIdRef.current) {
        throw new Error(
          'Session was reset — ask a new question first, then try the quick challenge.',
        );
      }

      const result = await submitQuickCheckAnswer(sessionIdRef.current, session.id, answer);

      const newResponse = {
        questionId: session.questions[state.currentIndex]?.id ?? '',
        questionIndex: state.currentIndex,
        question: session.questions[state.currentIndex]?.question ?? '',
        userAnswer: answer,
        verdict: result.verdict ?? (result.correct ? 'correct' : 'incorrect'),
        score: result.score,
        feedback: result.feedback,
      } as const;

      const updatedState = {
        currentIndex: result.sessionComplete
          ? session.totalQuestions
          : result.sessionProgress.questionIndex,
        responses: [...state.responses, newResponse],
        correctCount: result.sessionProgress.correctCount,
        lastFeedback: result.feedback,
        lastVerdict: result.verdict,
        lastScore: result.score,
        finalAnalysis: result.finalAnalysis,
        status: result.sessionComplete ? ('completed' as const) : ('active' as const),
      };

      updateAssistant(messageId, {
        quickCheckState: updatedState,
        mastery: result.mastery,
      });
      setMasteryBySubject((prev) => ({
        ...prev,
        [result.mastery.subjectId]: result.mastery,
      }));
    },
    [messages, updateAssistant],
  );

  const handleNotesComplete = useCallback(
    (result: NotesSimplifyResult, fileName: string) => {
      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: `📎 Uploaded my notes: ${fileName}`,
        timestamp: new Date(),
      };

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: result.simplifiedMarkdown,
        timestamp: new Date(),
        pipelineStage: 'done',
        notesResult: result,
        notesFileName: fileName,
        agentTrail: result.agentTrail,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
    },
    [],
  );

  const handleRequestNotesUpload = useCallback(() => {
    notesUploadRef.current?.();
  }, []);

  return (
    <div className="app-shell">
      <MobileStudyPanel
        boardId={boardId}
        classLevel={classLevel}
        streamId={streamId}
        subject={subject}
      >
        <BoardSelector boardId={boardId} onBoardChange={handleBoardChange} disabled={isLoading} />
        <ClassStreamSelector
          classLevel={classLevel}
          streamId={streamId}
          disabled={isLoading}
          onClassChange={handleClassChange}
          onStreamChange={handleStreamChange}
        />
        <SubjectTabs
          boardId={boardId}
          classLevel={classLevel}
          selected={subject}
          onSelect={handleSubjectSelect}
          masteryBySubject={masteryBySubject}
          subjects={allSubjects}
          streamSubjects={streamSubjects}
          disabled={isLoading}
        />
      </MobileStudyPanel>
      <div className="app-main">
        <Header />
        <StudyContextBar
          boardId={boardId}
          classLevel={classLevel}
          streamId={streamId}
          subject={subject}
        />
        <main className="chat-main">
          <MessageList
            key={studyContextKey}
            messages={messages}
            boardId={boardId}
            subject={subject}
            classLevel={classLevel}
            streamId={streamId}
            onExampleSelect={handleSend}
            onNotesUpload={handleRequestNotesUpload}
            onSubmitQuickCheck={handleQuickCheckSubmit}
            onRetry={handleRetry}
            isLoading={isLoading}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isLoading}
            notesContext={{ boardId, classLevel, streamId, subject }}
            onNotesComplete={handleNotesComplete}
            onRegisterNotesUpload={(open) => {
              notesUploadRef.current = open;
            }}
          />
        </main>
      </div>
    </div>
  );
}
