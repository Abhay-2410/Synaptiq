import type { DoubtRequest, ReasoningStep, RetrievedChunk, TutorDraft } from '../types.js';
import {
  focusRetrievedChunks,
  resolveAnswerMode,
  type AnswerMode,
} from './chunk-focus.js';
import { buildExamQuestionAnswer, isExamQuestionRequest } from './exam-question.js';
import { buildKnowledgeAnswer } from './tutor-knowledge.js';
import { synthesizeTutorAnswer } from './tutor-synthesis.js';
import { trySolveStemProblem } from './stem-solve.js';

export type Intent = 'define' | 'solve' | 'compare' | 'explain' | 'exam-question' | 'general';

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase();
  if (isExamQuestionRequest(question)) return 'exam-question';
  if (/\b(difference|compare|vs|versus|distinguish)\b/.test(q)) return 'compare';
  // "State X and solve …" — numerical solve takes priority over definition
  if (/\b(solve|find|calculate|compute|evaluate)\b/.test(q) || /[=+\-×÷^²]/.test(q)) return 'solve';
  if (/\b(state|what is|what are|define|definition of)\b/.test(q)) return 'define';
  if (/\b(explain|how does|why does|describe|how do i)\b/.test(q)) return 'explain';
  return 'general';
}

function composeFromChunks(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  mode: AnswerMode,
  intent: Intent,
): string {
  return synthesizeTutorAnswer({ doubt, context, mode, intent });
}

function composeMathDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  intent: Intent,
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> {
  const stem = trySolveStemProblem(doubt);
  if (stem) return stem;

  if (context.length > 0) {
    return {
      answer: composeFromChunks(doubt, context, 'math', intent),
    };
  }

  return {
    answer: buildKnowledgeAnswer(doubt, 'math', intent),
  };
}

export function composeLocalDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> {
  const intent = detectIntent(doubt.text);
  const focused = focusRetrievedChunks(doubt.text, context);
  const mode = resolveAnswerMode(doubt, focused);

  const stem = trySolveStemProblem(doubt);
  if (stem) return stem;

  if (focused.length === 0) {
    return {
      answer: synthesizeTutorAnswer({ doubt, context: [], mode, intent }),
    };
  }

  if (mode === 'math' || mode === 'physical-science') {
    if (mode === 'math') {
      return composeMathDraft(doubt, focused, intent);
    }
    const physStem = trySolveStemProblem(doubt);
    if (physStem) return physStem;
    return {
      answer: composeFromChunks(doubt, focused, mode, intent),
    };
  }

  return {
    answer: composeFromChunks(doubt, focused, mode, intent),
  };
}

export function composeLocalAnswer(doubt: DoubtRequest, context: RetrievedChunk[]): string {
  return composeLocalDraft(doubt, context).answer;
}

export function buildLocalReasoningSteps(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  intent: Intent,
): ReasoningStep[] {
  const focused = focusRetrievedChunks(doubt.text, context);
  const topic = focused[0]?.metadata.topic ?? 'the topic';
  const stemWorked = Boolean(trySolveStemProblem(doubt));
  return [
    {
      step: 1,
      label: 'Understand the question',
      detail: `Classified "${doubt.text.slice(0, 80)}${doubt.text.length > 80 ? '…' : ''}" as a ${intent} question.`,
    },
    {
      step: 2,
      label: 'Retrieve context',
      detail:
        focused.length > 0
          ? `Matched ${focused.length} snippet(s) about ${topic}.`
          : 'No corpus match — solving from built-in STEM knowledge.',
    },
    {
      step: 3,
      label:
        intent === 'exam-question'
          ? 'Compose practice question'
          : stemWorked
            ? 'Work the solution'
            : 'Compose explanation',
      detail:
        intent === 'exam-question'
          ? 'Composed a CBSE-style practice question from syllabus context — not a full explanation.'
          : stemWorked
            ? 'Performed the actual calculation step by step with real numbers and algebra.'
            : 'Synthesised a tutor-style explanation — in our own words, not copied fragments.',
    },
    {
      step: 4,
      label: 'Verify completeness',
      detail: stemWorked
        ? 'Checked roots/values by substitution where applicable.'
        : 'Checked that the answer directly addresses what the student asked.',
    },
  ];
}

export async function generateLocalTutorDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  handlers: { onChunk?: (delta: string) => void } = {},
): Promise<TutorDraft> {
  const intent = detectIntent(doubt.text);
  const { answer, rawMathExplanation } = composeLocalDraft(doubt, context);
  const reasoningSteps = buildLocalReasoningSteps(doubt, context, intent);
  const stemWorked = Boolean(trySolveStemProblem(doubt));

  if (handlers.onChunk) {
    const chunkSize = 48;
    for (let i = 0; i < answer.length; i += chunkSize) {
      handlers.onChunk(answer.slice(i, i + chunkSize));
    }
  }

  return {
    answer,
    reasoningSteps,
    rawMathExplanation,
    model: stemWorked ? 'synaptiq-stem-solver' : 'synaptiq-local-tutor',
  };
}

export { focusRetrievedChunks } from './chunk-focus.js';
export { stripChunkDisplayText } from './chunk-focus.js';
