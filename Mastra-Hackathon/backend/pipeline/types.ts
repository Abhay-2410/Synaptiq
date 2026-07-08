/** Shared contracts for the doubt-solving pipeline. */

import type { ClassLevel, StreamId, SubjectKey } from './curriculum/catalog.js';

export type { ClassLevel, StreamId, SubjectKey };

/** @deprecated alias — use SubjectKey */
export type SubjectId = SubjectKey;

export interface DoubtRequest {
  text: string;
  imageUrl?: string;
  sessionId?: string;
  /** Selected CBSE subject (canonical key) */
  subjectId?: SubjectKey;
  classLevel?: ClassLevel;
  stream?: StreamId;
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
}

export interface PipelineResult {
  sessionId: string;
  doubt: string;
  retrievedChunks: RetrievedChunk[];
  draft: TutorDraft;
  verification: VerificationResult;
  agentTrail: AgentTrailStep[];
  quickCheck: QuickCheck;
  mastery: MasteryState;
}

export interface QuickCheckEvaluationResult {
  correct: boolean;
  feedback: string;
  mastery: MasteryState;
}

/** SSE payloads streamed from POST /ask */
export type AskStreamEvent =
  | { type: 'status'; stage: 'retrieval' | 'tutor' | 'verification'; message: string }
  | { type: 'retrieval'; chunks: RetrievedChunk[] }
  | { type: 'tutor_chunk'; delta: string }
  | { type: 'reasoning_steps'; steps: ReasoningStep[] }
  | { type: 'verification'; result: VerificationResult }
  | { type: 'agent_trail'; trail: AgentTrailStep[] }
  | { type: 'quick_check'; quickCheck: QuickCheck; mastery: MasteryState }
  | { type: 'done'; result: PipelineResult }
  | { type: 'error'; message: string };
