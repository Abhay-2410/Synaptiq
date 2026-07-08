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
  topic: string;
  subjectId: SubjectKey;
  question: string;
  expectedKeywords: string[];
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
}

export type AskStreamEvent =
  | { type: 'status'; stage: 'retrieval' | 'tutor' | 'verification'; message: string }
  | { type: 'retrieval'; chunks: RetrievedChunk[] }
  | { type: 'tutor_chunk'; delta: string }
  | { type: 'reasoning_steps'; steps: ReasoningStep[] }
  | { type: 'verification'; result: VerificationResult }
  | { type: 'agent_trail'; trail: AgentTrailStep[] }
  | { type: 'quick_check'; quickCheck: QuickCheck; mastery: MasteryState }
  | { type: 'done'; result: { sessionId: string; verification: VerificationResult; retrievedChunks: RetrievedChunk[]; draft: { rawMathExplanation?: string }; agentTrail: AgentTrailStep[]; quickCheck: QuickCheck; mastery: MasteryState } }
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
  quickCheck?: QuickCheck;
  mastery?: MasteryState;
  quickCheckFeedback?: string;
}

export type PipelineStage = 'retrieval' | 'tutor' | 'verification' | 'done' | 'error';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface QuickCheckEvaluationResult {
  correct: boolean;
  feedback: string;
  mastery: MasteryState;
}
