import { tutorAgent } from '../../agents/index.js';
import { getLlmProvider, isLlmProviderConfigured } from '../../agents/llm-provider.js';
import { logStageEnd, logStageStart, logStageWarn } from '../lib/pipeline-log.js';
import { withTimeout } from '../lib/with-timeout.js';
import {
  buildFollowUpInstructions,
  formatConversationHistory,
  isFollowUpRequest,
  trimConversationHistory,
} from './conversation-context.js';
import { resolveAnswerMode } from './chunk-focus.js';
import { buildLocalReasoningSteps, detectIntent, generateLocalTutorDraft } from './local-tutor.js';
import { tryFollowUpAnswer } from './follow-up-answer.js';
import { trySolveStemProblem } from './stem-solve.js';
import { tutorModeInstructions } from './tutor-synthesis.js';
import { isExamQuestionRequest } from './exam-question.js';
import { studentBoardPhrase, getBoardMeta } from '../curriculum/boards.js';
import { enhanceRawMathMarkdown } from './raw-math/enhance-steps.js';
import { tryCuratedConceptAnswer } from './tutor-knowledge.js';
import type { DoubtRequest, ReasoningStep, RetrievedChunk, TutorDraft } from '../types.js';

const TUTOR_LLM_TIMEOUT_MS = Number(process.env.TUTOR_LLM_TIMEOUT_MS) || 25_000;

export interface TutorStreamHandlers {
  onChunk?: (delta: string) => void;
}

export async function generateTutorDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  handlers: TutorStreamHandlers = {},
): Promise<TutorDraft> {
  const stemDraft = trySolveStemProblem(doubt);
  if (stemDraft) {
    logStageStart('tutor-stem', 'deterministic worked solution');
    const intent = detectIntent(doubt.text);
    if (handlers.onChunk) {
      const chunkSize = 48;
      for (let i = 0; i < stemDraft.answer.length; i += chunkSize) {
        handlers.onChunk(stemDraft.answer.slice(i, i + chunkSize));
      }
    }
    const draft: TutorDraft = {
      answer: stemDraft.answer,
      rawMathExplanation: stemDraft.rawMathExplanation,
      reasoningSteps: buildLocalReasoningSteps(doubt, context, intent),
      model: 'synaptiq-stem-solver',
    };
    logStageEnd('tutor-stem', `answerLen=${draft.answer.length}`);
    return draft;
  }

  const followUpDraft = tryFollowUpAnswer(doubt);
  if (followUpDraft) {
    logStageStart('tutor-follow-up', 'worked examples for prior questions');
    if (handlers.onChunk) {
      const chunkSize = 48;
      for (let i = 0; i < followUpDraft.answer.length; i += chunkSize) {
        handlers.onChunk(followUpDraft.answer.slice(i, i + chunkSize));
      }
    }
    const draft: TutorDraft = {
      ...followUpDraft,
      model: 'synaptiq-follow-up',
    };
    logStageEnd('tutor-follow-up', `answerLen=${draft.answer.length}`);
    return draft;
  }

  const curated = tryCuratedConceptAnswer(doubt);
  if (curated) {
    logStageStart('tutor-curated', 'precise built-in concept answer');
    if (handlers.onChunk) {
      const chunkSize = 48;
      for (let i = 0; i < curated.length; i += chunkSize) {
        handlers.onChunk(curated.slice(i, i + chunkSize));
      }
    }
    const draft: TutorDraft = {
      answer: curated,
      reasoningSteps: buildLocalReasoningSteps(doubt, context, detectIntent(doubt.text)),
      model: 'synaptiq-curated',
    };
    logStageEnd('tutor-curated', `answerLen=${draft.answer.length}`);
    return draft;
  }

  const useLlm = isLlmProviderConfigured() && process.env.TUTOR_USE_LLM !== 'false';

  if (!useLlm) {
    logStageStart('tutor-local', 'TUTOR_USE_LLM=false or LLM provider not configured');
    const draft = await generateLocalTutorDraft(doubt, context, handlers);
    logStageEnd('tutor-local', `answerLen=${draft.answer.length}`);
    return draft;
  }

  const prompt = buildTutorPrompt(doubt, context);
  logStageStart('tutor-llm', `provider=${getLlmProvider()} timeout=${TUTOR_LLM_TIMEOUT_MS}ms`);

  try {
    if (handlers.onChunk) {
      const draft = await withTimeout(
        streamTutorDraft(prompt, handlers),
        TUTOR_LLM_TIMEOUT_MS,
        'Tutor LLM stream',
      );
      logStageEnd('tutor-llm', `stream complete, model=${draft.model}`);
      return draft;
    }

    const result = await withTimeout(
      tutorAgent.generate(prompt),
      TUTOR_LLM_TIMEOUT_MS,
      'Tutor LLM generate',
    );
    if (!result.text?.trim()) {
      throw new Error('Tutor agent returned an empty response');
    }

    const parsed = parseTutorResponse(result.text);
    logStageEnd('tutor-llm', `generate complete`);
    return {
      answer: parsed.answer,
      reasoningSteps: parsed.reasoningSteps,
      rawMathExplanation: parsed.rawMathExplanation,
      model: String(result.response?.modelId ?? 'mastra-tutor'),
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStageWarn('tutor-llm', `failed (${msg}) — falling back to local tutor`);
    return generateLocalTutorDraft(doubt, context, handlers);
  }
}

async function streamTutorDraft(
  prompt: string,
  handlers: TutorStreamHandlers,
): Promise<TutorDraft> {
  const stream = await tutorAgent.stream(prompt);
  const reader = stream.textStream.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      handlers.onChunk?.(value);
    }
  } finally {
    reader.releaseLock();
  }

  const fullOutput = await stream.getFullOutput();
  if (fullOutput.error) {
    throw fullOutput.error;
  }

  const parsed = parseTutorResponse(fullOutput.text);
  return {
    answer: parsed.answer,
    reasoningSteps: parsed.reasoningSteps,
    rawMathExplanation: parsed.rawMathExplanation,
    model: String(fullOutput.response?.modelId ?? 'mastra-tutor'),
  };
}

function buildTutorPrompt(doubt: DoubtRequest, context: RetrievedChunk[]): string {
  const mode = resolveAnswerMode(doubt, context);
  const intent = detectIntent(doubt.text);
  const modeBlock = tutorModeInstructions(mode, doubt.classLevel, intent);
  const examQuestion = isExamQuestionRequest(doubt.text);
  const history = trimConversationHistory(doubt.priorMessages);

  const contextBlock =
    context.length > 0
      ? context
          .map(
            (chunk, index) =>
              `[Reference ${index + 1}] Topic: ${chunk.metadata.topic ?? 'Unknown'} | Chapter: ${chunk.metadata.chapter ?? 'Unknown'}\n${chunk.content}`,
          )
          .join('\n\n')
      : `No retrieved excerpts for this query — answer fully from accurate ${getBoardMeta(doubt.boardId ?? 'cbse').syllabus}-aligned knowledge for the student's class and subject. Do not mention missing material.`;

  const blocks: string[] = [];

  if (history.length > 0) {
    blocks.push(
      '--- Conversation so far (use for follow-ups) ---',
      formatConversationHistory(history),
      '--- End conversation ---',
      '',
    );
    if (isFollowUpRequest(doubt.text)) {
      blocks.push(buildFollowUpInstructions(doubt.text, history), '');
    }
  }

  blocks.push(
    'Student doubt:',
    doubt.text,
    '',
    `Student: ${studentBoardPhrase(doubt.boardId ?? 'cbse', doubt.classLevel)}`,
    `Selected subject: ${doubt.subjectId ?? 'unknown'}`,
    `Selected stream: ${doubt.stream ?? 'n/a'}`,
    `Answer mode: ${mode}`,
    `Question intent: ${intent}`,
    '',
  );

  if (examQuestion) {
    blocks.push(
      'REQUEST TYPE: EXAM-STYLE QUESTION(S)',
      'The student wants practice/board question(s) — NOT an explanation of the topic.',
      'In [[ANSWER]], output ONLY:',
      '- The requested number of realistic board questions with mark allocation (e.g. 3 marks each)',
      '- Use this exact heading per question: #### Question 1 · 3 marks (then question text on following lines)',
      '- Use the middle dot · between label and marks — same format for every question',
      '- A brief format hint per question (word limit or what to include)',
      '- A closing line inviting them to attempt or ask for help',
      'Do NOT answer the questions yourself. Do NOT explain the topic in full.',
      '',
    );
  }

  if (intent === 'compare') {
    blocks.push(
      'REQUEST TYPE: COMPARE / DIFFERENCE',
      'Structure [[ANSWER]] with markdown headings:',
      '- ### First concept — definition + formula (if any) + unit + one example',
      '- ### Second concept — definition + formula (if any) + unit + one example',
      '- ### Key differences — precise bullet or table (aspect | first | second)',
      '- ### One short worked example tying both together',
      '- ### When to use which — exam tip on how boards test this comparison',
      'Answer the comparison directly — no vague analogies without definitions.',
      '',
    );
  } else if (intent === 'define' || intent === 'explain' || intent === 'general') {
    blocks.push(
      'REQUEST TYPE: TEACH / EXPLAIN',
      'The student wants a thorough, understandable explanation — not a short summary.',
      'In [[ANSWER]], use ### subheadings and write enough detail that they could explain this topic to a friend afterward.',
      'Include: direct answer → developed explanation → concrete example → exam tip or common mistake (if useful).',
      '',
    );
  }

  blocks.push(
    '--- Reference material (for reasoning only — do NOT copy verbatim) ---',
    contextBlock,
    '--- End reference material ---',
    '',
    modeBlock,
    '',
    'Use the exact [[ANSWER]] / [[REASONING_STEPS]] / [[RAW_MATH]] wrapper format from your instructions.',
  );

  return blocks.join('\n');
}

function parseTutorResponse(raw: string): Pick<TutorDraft, 'answer' | 'reasoningSteps' | 'rawMathExplanation'> {
  const answerMatch = raw.match(/\[\[ANSWER\]\]\s*([\s\S]*?)\s*\[\[REASONING_STEPS\]\]/);
  const stepsMatch = raw.match(/\[\[REASONING_STEPS\]\]\s*([\s\S]*?)(?:\s*\[\[RAW_MATH\]\]|$)/);
  const rawMathMatch = raw.match(/\[\[RAW_MATH\]\]\s*([\s\S]*)$/);

  const answer = answerMatch?.[1]?.trim() || raw.trim();
  const reasoningSteps = parseReasoningSteps(stepsMatch?.[1] ?? '');
  const rawMathExplanation = enhanceRawMathMarkdown(rawMathMatch?.[1]?.trim() || undefined);

  return {
    answer,
    rawMathExplanation,
    reasoningSteps:
      reasoningSteps.length > 0
        ? reasoningSteps
        : [
            {
              step: 1,
              label: 'Explain the method',
              detail: 'The tutor answered directly, so a single fallback reasoning step was created.',
            },
          ],
  };
}

function parseReasoningSteps(block: string): ReasoningStep[] {
  return block
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const cleaned = line.replace(/^\d+\.\s*/, '');
      const [label, ...rest] = cleaned.split('::');
      return {
        step: index + 1,
        label: (label || `Step ${index + 1}`).trim(),
        detail: (rest.join('::') || cleaned).trim(),
      };
    });
}
