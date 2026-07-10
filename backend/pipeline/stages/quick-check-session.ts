import { randomUUID } from 'node:crypto';
import { tutorAgent } from '../../agents/tutor.agent.js';
import { isLlmProviderConfigured } from '../../agents/llm-provider.js';
import { withTimeout } from '../lib/with-timeout.js';
import type {
  ClassLevel,
  MasteryState,
  QuickCheck,
  QuickCheckEvaluationResult,
  QuickCheckResponse,
  QuickCheckSession,
  QuickCheckSessionProgress,
  RetrievedChunk,
  SubjectKey,
} from '../types.js';
import { buildQuickCheckQuestions } from './quick-check-questions.js';
import { evaluateWithLlm, verdictToCorrect, isSessionCorrect, type QuickCheckVerdict } from './quick-check-eval.js';
import { isDeadEndAnswer } from './tutor-knowledge.js';

const ANALYSIS_TIMEOUT_MS = Number(process.env.QUICK_CHECK_ANALYSIS_TIMEOUT_MS) || 20_000;

interface MasteryRecord {
  attempts: number;
  correct: number;
}

const masteryStore = new Map<string, Map<string, MasteryRecord>>();
const challengeSessionStore = new Map<string, QuickCheckSession>();
const activeChallengeByStudentSession = new Map<string, string>();

function masteryKey(topic: string, subjectId: SubjectKey): string {
  return `${subjectId}::${topic}`;
}

export function shouldOfferQuickCheck(
  tutorAnswer: string,
  verificationStatus: 'verified' | 'flagged' | 'blocked',
): boolean {
  if (verificationStatus === 'blocked') return false;
  if (isDeadEndAnswer(tutorAnswer)) return false;
  return tutorAnswer.trim().length >= 80;
}

export function getMasteryState(
  sessionId: string,
  topic: string,
  subjectId: SubjectKey,
): MasteryState {
  const session = masteryStore.get(sessionId);
  const record = session?.get(masteryKey(topic, subjectId));
  const attempts = record?.attempts ?? 0;
  const correct = record?.correct ?? 0;
  const score = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  return { topic, subjectId, attempts, correct, score };
}

function setMasteryState(sessionId: string, topic: string, subjectId: SubjectKey, correctAttempt: boolean): void {
  const session = masteryStore.get(sessionId) ?? new Map<string, MasteryRecord>();
  const key = masteryKey(topic, subjectId);
  const current = session.get(key) ?? { attempts: 0, correct: 0 };
  session.set(key, {
    attempts: current.attempts + 1,
    correct: current.correct + (correctAttempt ? 1 : 0),
  });
  masteryStore.set(sessionId, session);
}

function summarizeTutorAnswer(answer: string): string {
  const trimmed = answer.trim();
  if (trimmed.length <= 600) return trimmed;
  return `${trimmed.slice(0, 600)}…`;
}

export function abandonActiveChallengeSession(studentSessionId: string): void {
  const activeId = activeChallengeByStudentSession.get(studentSessionId);
  if (!activeId) return;
  const session = challengeSessionStore.get(activeId);
  if (session && session.status === 'active') {
    session.status = 'abandoned';
    challengeSessionStore.set(activeId, session);
  }
  activeChallengeByStudentSession.delete(studentSessionId);
}

export function createQuickCheckSession(
  doubt: string,
  tutorAnswer: string,
  chunks: RetrievedChunk[],
  subjectId: SubjectKey,
  classLevel?: ClassLevel,
  studentSessionId?: string,
): QuickCheckSession | null {
  const questions = buildQuickCheckQuestions(doubt, tutorAnswer, chunks, subjectId, classLevel);
  if (questions.length < 3) return null;

  if (studentSessionId) {
    abandonActiveChallengeSession(studentSessionId);
  }

  const topic = questions[0]?.topic ?? 'General';
  const session: QuickCheckSession = {
    id: randomUUID(),
    topic,
    subjectId,
    classLevel,
    totalQuestions: questions.length,
    questions,
    doubt,
    tutorAnswerSummary: summarizeTutorAnswer(tutorAnswer),
    status: 'active',
    currentIndex: 0,
    responses: [],
  };

  challengeSessionStore.set(session.id, session);
  if (studentSessionId) {
    activeChallengeByStudentSession.set(studentSessionId, session.id);
  }

  return session;
}

export function getChallengeSession(challengeSessionId: string): QuickCheckSession | undefined {
  return challengeSessionStore.get(challengeSessionId);
}

function currentQuestion(session: QuickCheckSession): QuickCheck | undefined {
  return session.questions[session.currentIndex];
}

function buildSessionProgress(session: QuickCheckSession): QuickCheckSessionProgress {
  const correctCount = session.responses.filter((r) => r.score >= 85).length;
  return {
    challengeSessionId: session.id,
    questionIndex: session.currentIndex,
    totalQuestions: session.totalQuestions,
    correctCount,
    answeredCount: session.responses.length,
  };
}

function buildHeuristicAnalysis(session: QuickCheckSession): string {
  const correct = session.responses.filter((r) => r.verdict === 'correct');
  const partial = session.responses.filter((r) => r.verdict === 'partial');
  const wrong = session.responses.filter((r) => r.verdict === 'incorrect');
  const classLabel = session.classLevel ? `Class ${session.classLevel}` : 'your class';

  const understood =
    correct.length > 0
      ? correct.map((r) => `• You answered well on: "${r.question.replace(/^Quick check:\s*/i, '')}"`).join('\n')
      : '• You engaged with the questions — that itself helps cement the ideas.';

  const shaky =
    [...partial, ...wrong].length > 0
      ? [...partial, ...wrong]
          .map((r) => {
            const label = r.verdict === 'partial' ? 'Partly right' : 'Needs work';
            return `• ${label} on: "${r.question.replace(/^Quick check:\s*/i, '')}" — ${r.feedback}`;
          })
          .join('\n')
      : '• No major gaps showed up in this round.';

  const nextStep =
    wrong.length > 0
      ? `Revisit the idea behind "${wrong[0]!.question.replace(/^Quick check:\s*/i, '')}" and try one similar practice question before moving on.`
      : partial.length > 0
        ? `Strengthen your answer on "${partial[0]!.question.replace(/^Quick check:\s*/i, '')}" with a fuller explanation in your notes.`
        : `You are ready to tackle slightly harder problems on ${session.topic}.`;

  return [
    '### Quick Challenge summary',
    '',
    `**What you clearly understood** (${classLabel})`,
    understood,
    '',
    '**What to tighten up**',
    shaky,
    '',
    '**Your next step**',
    nextStep,
  ].join('\n');
}

async function generateSessionAnalysis(session: QuickCheckSession): Promise<string> {
  const classLabel = session.classLevel ? `Class ${session.classLevel}` : 'unknown class';
  const responseLog = session.responses
    .map(
      (r, i) =>
        `Q${i + 1}: ${r.question}\nStudent: ${r.userAnswer}\nVerdict: ${r.verdict}\nFeedback: ${r.feedback}`,
    )
    .join('\n\n');

  const prompt = [
    `You are Synaptiq, a warm but precise CBSE tutor closing a short Quick Challenge session.`,
    `Write a brief analysis for a ${classLabel} ${session.subjectId} student.`,
    '',
    `Original doubt: ${session.doubt}`,
    `Topic: ${session.topic}`,
    `Tutor explanation (summary): ${session.tutorAnswerSummary.slice(0, 400)}`,
    '',
    'Challenge responses:',
    responseLog,
    '',
    'Write markdown with exactly these sections:',
    '### What you clearly understood',
    '(2-3 bullets referencing SPECIFIC questions they got right and WHY — not generic praise)',
    '### What to tighten up',
    '(2-3 bullets on wrong/partial answers — name the concept, not "study more")',
    '### Your next step',
    '(ONE concrete, actionable step — e.g. "practice 2-3 more factoring problems before the quadratic formula")',
    '',
    'Tone: encouraging tutor, not report card. Under 200 words total. No JSON.',
  ].join('\n');

  if (!isLlmProviderConfigured()) {
    return buildHeuristicAnalysis(session);
  }

  try {
    const result = await withTimeout(
      tutorAgent.generate(prompt),
      ANALYSIS_TIMEOUT_MS,
      'Quick challenge session analysis',
    );
    const text = result.text?.trim();
    if (!text || text.length < 40) return buildHeuristicAnalysis(session);
    return text.includes('###') ? text : buildHeuristicAnalysis(session);
  } catch (err) {
    console.warn('Quick challenge analysis LLM failed, using heuristic:', err);
    return buildHeuristicAnalysis(session);
  }
}

export async function evaluateQuickCheckSessionAnswer(
  studentSessionId: string,
  challengeSessionId: string,
  userAnswer: string,
): Promise<QuickCheckEvaluationResult> {
  const session = challengeSessionStore.get(challengeSessionId);
  if (!session) {
    throw new Error('This Quick Challenge session is no longer available. Ask a new question to start fresh.');
  }
  if (session.status === 'abandoned') {
    throw new Error('This Quick Challenge was ended when you asked a new question. Start a new challenge from your latest answer.');
  }
  if (session.status === 'completed') {
    throw new Error('This Quick Challenge is already complete.');
  }

  const question = currentQuestion(session);
  if (!question) {
    throw new Error('No more questions in this session.');
  }

  const trimmed = userAnswer.trim();
  if (!trimmed) {
    throw new Error('Please enter an answer before submitting.');
  }

  const evalResult = await evaluateWithLlm(question, trimmed);
  const verdict: QuickCheckVerdict = evalResult.verdict;
  const score = evalResult.score;
  const correct = verdictToCorrect(verdict);

  const response: QuickCheckResponse = {
    questionId: question.id,
    questionIndex: question.index,
    question: question.question,
    userAnswer: trimmed,
    verdict,
    score,
    feedback: evalResult.feedback,
  };

  session.responses.push(response);
  setMasteryState(studentSessionId, session.topic, session.subjectId, isSessionCorrect(score));

  const isLast = session.currentIndex >= session.totalQuestions - 1;
  if (isLast) {
    session.status = 'completed';
    session.currentIndex = session.totalQuestions;
    activeChallengeByStudentSession.delete(studentSessionId);
    challengeSessionStore.set(session.id, session);

    const finalAnalysis = await generateSessionAnalysis(session);
    const mastery = getMasteryState(studentSessionId, session.topic, session.subjectId);

    return {
      correct,
      partial: verdict === 'partial',
      verdict,
      score,
      feedback: evalResult.feedback,
      mastery,
      sessionProgress: buildSessionProgress(session),
      sessionComplete: true,
      finalAnalysis,
    };
  }

  session.currentIndex += 1;
  challengeSessionStore.set(session.id, session);

  const mastery = getMasteryState(studentSessionId, session.topic, session.subjectId);
  return {
    correct,
    partial: verdict === 'partial',
    verdict,
    score,
    feedback: evalResult.feedback,
    mastery,
    sessionProgress: buildSessionProgress(session),
    sessionComplete: false,
  };
}

/** @deprecated Use createQuickCheckSession — returns first question for legacy callers */
export function createQuickCheck(
  doubt: string,
  tutorAnswer: string,
  chunks: RetrievedChunk[],
  subjectIdOverride?: SubjectKey,
  classLevelOverride?: ClassLevel,
): QuickCheck | null {
  const session = createQuickCheckSession(
    doubt,
    tutorAnswer,
    chunks,
    subjectIdOverride ?? 'math',
    classLevelOverride,
  );
  return session?.questions[0] ?? null;
}

/** @deprecated Use evaluateQuickCheckSessionAnswer */
export async function evaluateQuickCheck(
  sessionId: string,
  quickCheck: QuickCheck,
  userAnswer: string,
): Promise<QuickCheckEvaluationResult> {
  const tempSession: QuickCheckSession = {
    id: randomUUID(),
    topic: quickCheck.topic,
    subjectId: quickCheck.subjectId,
    classLevel: quickCheck.classLevel,
    totalQuestions: 1,
    questions: [quickCheck],
    doubt: '',
    tutorAnswerSummary: '',
    status: 'active',
    currentIndex: 0,
    responses: [],
  };
  challengeSessionStore.set(tempSession.id, tempSession);

  return evaluateQuickCheckSessionAnswer(sessionId, tempSession.id, userAnswer);
}
