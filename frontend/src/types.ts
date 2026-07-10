import type { SubjectKey } from './curriculum';

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
    classLevel?: number;
  };
}

export interface ReasoningStep {
  step: number;
  label: string;
  detail: string;
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
  classLevel?: number;
  question: string;
  expectedAnswer: string;
  evaluationRubric?: string;
  difficulty?: 'recall' | 'apply' | 'reason';
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
  classLevel?: number;
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

export interface QuickCheckSessionState {
  currentIndex: number;
  responses: QuickCheckResponse[];
  correctCount: number;
  lastFeedback?: string;
  lastVerdict?: 'correct' | 'partial' | 'incorrect';
  lastScore?: number;
  finalAnalysis?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface MasteryState {
  topic: string;
  subjectId: SubjectKey;
  attempts: number;
  correct: number;
  score: number;
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

export type AskStreamEvent =
  | { type: 'status'; stage: 'retrieval' | 'tutor' | 'verification'; message: string }
  | { type: 'integration_status'; stack: StackHealthSnapshot }
  | { type: 'retrieval'; chunks: RetrievedChunk[] }
  | { type: 'tutor_chunk'; delta: string }
  | { type: 'reasoning_steps'; steps: ReasoningStep[] }
  | { type: 'verification'; result: VerificationResult }
  | { type: 'agent_trail'; trail: AgentTrailStep[] }
  | { type: 'quick_check_session'; session: QuickCheckSession; mastery: MasteryState }
  | {
      type: 'done';
      result: {
        sessionId: string;
        verification: VerificationResult;
        retrievedChunks: RetrievedChunk[];
        draft: { rawMathExplanation?: string };
        agentTrail: AgentTrailStep[];
        quickCheckSession?: QuickCheckSession;
        mastery: MasteryState;
        stackHealth?: StackHealthSnapshot;
      };
    }
  | { type: 'error'; message: string };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  pipelineStage?: PipelineStage;
  pipelineMessage?: string;
  retrievedChunks?: RetrievedChunk[];
  reasoningSteps?: ReasoningStep[];
  rawMathExplanation?: string;
  verification?: VerificationResult;
  agentTrail?: AgentTrailStep[];
  quickCheckSession?: QuickCheckSession;
  quickCheckState?: QuickCheckSessionState;
  mastery?: MasteryState;
  stackHealth?: StackHealthSnapshot;
}

export type PipelineStage = 'retrieval' | 'tutor' | 'verification' | 'done' | 'error';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  stack?: StackHealthSnapshot;
}
