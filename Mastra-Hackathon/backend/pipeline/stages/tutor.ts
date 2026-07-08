import { tutorAgent } from '../../agents/index.js';
import { withTimeout } from '../lib/with-timeout.js';
import { generateLocalTutorDraft } from './local-tutor.js';
import type { DoubtRequest, ReasoningStep, RetrievedChunk, TutorDraft } from '../types.js';

const TUTOR_LLM_TIMEOUT_MS = Number(process.env.TUTOR_LLM_TIMEOUT_MS) || 90_000;

export interface TutorStreamHandlers {
  onChunk?: (delta: string) => void;
}

export async function generateTutorDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  handlers: TutorStreamHandlers = {},
): Promise<TutorDraft> {
  const useLlm =
    Boolean(process.env.OPENAI_API_KEY) && process.env.TUTOR_USE_LLM !== 'false';

  if (!useLlm) {
    return generateLocalTutorDraft(doubt, context, handlers);
  }

  const prompt = buildTutorPrompt(doubt, context);

  try {
    if (handlers.onChunk) {
      const draft = await withTimeout(
        streamTutorDraft(prompt, handlers),
        TUTOR_LLM_TIMEOUT_MS,
        'Tutor LLM stream',
      );
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
    return {
      answer: parsed.answer,
      reasoningSteps: parsed.reasoningSteps,
      rawMathExplanation: parsed.rawMathExplanation,
      model: String(result.response?.modelId ?? 'mastra-tutor'),
    };
  } catch (error) {
    console.error('Tutor agent failed, using local tutor:', error);
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
  const contextBlock =
    context.length > 0
      ? context
          .map(
            (chunk, index) =>
              `[Chunk ${index + 1}] Subject: ${chunk.metadata.subject ?? 'Unknown'} | Topic: ${chunk.metadata.topic ?? 'Unknown'}\n${chunk.content}`,
          )
          .join('\n\n')
      : 'No matching course material found — answer from general knowledge, calibrated to the student’s class and subject.';

  return [
    'Student doubt:',
    doubt.text,
    '',
    `Image reference: ${doubt.imageUrl ?? 'None provided'}`,
    '',
    `Student class (CBSE): ${doubt.classLevel ?? 'unknown'}`,
    `Selected subject: ${doubt.subjectId ?? 'unknown'}`,
    `Selected stream: ${doubt.stream ?? 'n/a'}`,
    '',
    'Retrieved context:',
    contextBlock,
    '',
    'Write a response using the required structure: Overview → Key points explained → (for maths) step-by-step working in [[RAW_MATH]].',
    'Use the exact output format required in the system instructions.',
  ].join('\n');
}

function parseTutorResponse(raw: string): Pick<TutorDraft, 'answer' | 'reasoningSteps' | 'rawMathExplanation'> {
  const answerMatch = raw.match(/\[\[ANSWER\]\]\s*([\s\S]*?)\s*\[\[REASONING_STEPS\]\]/);
  const stepsMatch = raw.match(/\[\[REASONING_STEPS\]\]\s*([\s\S]*?)(?:\s*\[\[RAW_MATH\]\]|$)/);
  const rawMathMatch = raw.match(/\[\[RAW_MATH\]\]\s*([\s\S]*)$/);

  const answer = answerMatch?.[1]?.trim() || raw.trim();
  const reasoningSteps = parseReasoningSteps(stepsMatch?.[1] ?? '');
  const rawMathExplanation = rawMathMatch?.[1]?.trim() || undefined;

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
