/** Shared contracts for the doubt-solving pipeline. */

import type { ClassLevel, StreamId, SubjectKey } from './curriculum/catalog.js';
import type { BoardId } from './curriculum/boards.js';
import { parseBoardId } from './curriculum/boards.js';

export type { ClassLevel, StreamId, SubjectKey, BoardId };

/** @deprecated alias — use SubjectKey */
export type SubjectId = SubjectKey;

export interface DoubtRequest {
  text: string;
  imageUrl?: string;
  sessionId?: string;
  /** Selected subject (canonical key) */
  subjectId?: SubjectKey;
  classLevel?: ClassLevel;
  stream?: StreamId;
  /** Exam board — defaults to CBSE */
  boardId?: BoardId;
}

export interface RetrievedChunk {
  id: string;
  score: number;
  content: string;
  metadata: {
    subject?: string;
    subjectKey?: SubjectKey;
    topic?: string;
    chapter?: string;
    source?: string;
    board?: BoardId;
    classLevel?: ClassLevel;
    stream?: StreamId;
  };
}

export interface ReasoningStep {
  step: number;
  label: string;
  detail: string;
}

export interface TutorDraft {
  answer: string;
  reasoningSteps: ReasoningStep[];
  rawMathExplanation?: string;
  model: string;
}

export interface AgentTrailStep {
  id: string;
  label: string;
  status: 'completed' | 'flagged' | 'blocked';
  summary: string;
  details?: string;
}

export interface QuickCheck {
  id: string;
  index: number;
  topic: string;
  subjectId: SubjectKey;
  classLevel?: ClassLevel;
  question: string;
  /** What a substantively correct student answer should convey — used by LLM evaluator. */
  expectedAnswer: string;
  evaluationRubric?: string;
  difficulty?: 'recall' | 'apply' | 'reason';
  /** @deprecated Legacy field — not used for grading. */
  expectedKeywords?: string[];
}

export interface QuickCheckResponse {
  questionId: string;
  questionIndex: number;
  question: string;
  userAnswer: string;
  verdict: 'correct' | 'partial' | 'incorrect';
  score: number;
  feedback: string;
}

export interface QuickCheckSession {
  id: string;
  topic: string;
  subjectId: SubjectKey;
  classLevel?: ClassLevel;
  totalQuestions: number;
  questions: QuickCheck[];
  doubt: string;
  tutorAnswerSummary: string;
  status: 'active' | 'completed' | 'abandoned';
  currentIndex: number;
  responses: QuickCheckResponse[];
}

export interface QuickCheckSessionProgress {
  challengeSessionId: string;
  questionIndex: number;
  totalQuestions: number;
  correctCount: number;
  answeredCount: number;
}

export interface QuickCheckEvaluationResult {
  correct: boolean;
  partial?: boolean;
  verdict?: 'correct' | 'partial' | 'incorrect';
  score: number;
  feedback: string;
  mastery: MasteryState;
  sessionProgress: QuickCheckSessionProgress;
  sessionComplete?: boolean;
  finalAnalysis?: string;
}

export interface VerificationInput {
  doubt: string;
  draft: TutorDraft;
  retrievedContext: RetrievedChunk[];
}

export type VerificationStatus = 'verified' | 'flagged' | 'blocked';

export interface VerificationResult {
  status: VerificationStatus;
  answer: string;
  reasoningSteps: ReasoningStep[];
  originalAnswer?: string;
  corrected: boolean;
  correctionNote?: string;
  checks: {
    hallucination: { passed: boolean; score?: number };
    adherence: { passed: boolean; score?: number };
    safety: { passed: boolean; score?: number };
    relevancy: { passed: boolean; score?: number };
  };
  flags: string[];
  usedStub: boolean;
  message?: string;
  /** True when Enkrypt timed out or failed — tutor answer passed through. */
  verificationUnavailable?: boolean;
}

export interface StackHealthSnapshot {
  strictMode: boolean;
  ready: boolean;
  mastra: { agents: string[]; workflows: string[]; vectorStore: string };
  qdrant: { status: string; indexName: string; vectorCount: number; provider: string };
  enkrypt: { status: string; policyName: string };
  warnings: string[];
}

export interface PipelineResult {
  sessionId: string;
  doubt: string;
  retrievedChunks: RetrievedChunk[];
  draft: TutorDraft;
  verification: VerificationResult;
  agentTrail: AgentTrailStep[];
  quickCheckSession?: QuickCheckSession;
  mastery: MasteryState;
  /** Internal: tutor answered without Qdrant grounding */
  answeredWithoutRetrieval?: boolean;
  stackHealth?: StackHealthSnapshot;
}

export interface MasteryState {
  topic: string;
  subjectId: SubjectKey;
  attempts: number;
  correct: number;
  score: number;
}

/** SSE payloads streamed from POST /ask */
export type AskStreamEvent =
  | { type: 'status'; stage: 'retrieval' | 'tutor' | 'verification'; message: string }
  | { type: 'integration_status'; stack: StackHealthSnapshot }
  | { type: 'retrieval'; chunks: RetrievedChunk[] }
  | { type: 'tutor_chunk'; delta: string }
  | { type: 'reasoning_steps'; steps: ReasoningStep[] }
  | { type: 'verification'; result: VerificationResult }
  | { type: 'agent_trail'; trail: AgentTrailStep[] }
  | { type: 'quick_check_session'; session: QuickCheckSession; mastery: MasteryState }
  | { type: 'done'; result: PipelineResult }
  | { type: 'error'; message: string };
