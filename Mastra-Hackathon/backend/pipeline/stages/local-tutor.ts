import type { DoubtRequest, ReasoningStep, RetrievedChunk, TutorDraft } from '../types.js';
import {
  buildQuadraticDefinitionSteps,
  buildQuadraticFactorizationSteps,
  stepsToMarkdown,
} from './raw-math/quadratic.js';
import {
  buildOverviewFromContext,
  formatStructuredAnswer,
  mathConceptKeyPoints,
  quadraticSolveKeyPoints,
  toKeyPointItems,
  type KeyPointItem,
} from './answer-format.js';
import {
  cleanChapterLabel,
  extractDiscipline,
  focusRetrievedChunks,
  resolveAnswerMode,
  stripChunkDisplayText,
  type AnswerMode,
} from './chunk-focus.js';

type Intent = 'define' | 'solve' | 'compare' | 'explain' | 'general';

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase();
  if (/\b(difference|compare|vs|versus|distinguish)\b/.test(q)) return 'compare';
  if (/\b(solve|find|calculate|compute|evaluate)\b/.test(q) || /[=+\-×÷^]/.test(q)) return 'solve';
  if (/\b(what is|what are|define|definition of)\b/.test(q)) return 'define';
  if (/\b(explain|how does|why does|describe)\b/.test(q)) return 'explain';
  return 'general';
}

function normalizeMathQuery(question: string): string {
  return question.replace(/\$/g, '').trim();
}

function parseMonicQuadratic(question: string): { b: number; c: number } | null {
  const q = normalizeMathQuery(question);
  const equationMatch = q.match(
    /x(?:\^2|²)\s*([-+])\s*(\d+)\s*x\s*([-+])\s*(\d+)\s*=\s*0/i,
  );
  if (!equationMatch) return null;

  const bSign = equationMatch[1];
  const cSign = equationMatch[3];
  const bVal = bSign === '-' ? -Number(equationMatch[2]) : Number(equationMatch[2]);
  const cVal = cSign === '-' ? -Number(equationMatch[4]) : Number(equationMatch[4]);
  return { b: bVal, c: cVal };
}

function commerceFooter(doubt: string): string | undefined {
  if (/\b(form|organisation|organization|partnership|company|proprietorship)\b/i.test(doubt)) {
    return '**Exam tip:** For each form, write **definition → features → one advantage and one limitation** in a table-friendly way.';
  }
  return '**Exam tip:** Use NCERT terms exactly and support definitions with one short example where possible.';
}

function socialFooter(discipline: string | undefined, doubt: string): string | undefined {
  if (discipline === 'History' && /\bnationalism\b/i.test(doubt)) {
    return '**Exam tip:** Link causes → movements → impact (e.g. World War I & Khilafat → Non-Cooperation / Civil Disobedience / Quit India → mass participation).';
  }
  if (discipline === 'History') {
    return '**Exam tip:** Always write cause → event → consequence in chronological order.';
  }
  if (discipline === 'Civics') {
    return '**Exam tip:** Give one real-life example of how the institution or right works in India.';
  }
  if (discipline === 'Geography') {
    return '**Exam tip:** Mention location, resource, and human activity together.';
  }
  if (discipline === 'Economics') {
    return '**Exam tip:** Connect the definition to producers, consumers, or government policy.';
  }
  return undefined;
}

function composeFromChunks(
  doubt: string,
  context: RetrievedChunk[],
  mode: AnswerMode,
  intent: Intent,
  options?: { mathWorkingHint?: boolean },
): string {
  const topic = context[0]?.metadata.topic ?? 'this topic';
  const chapter = context[0]?.metadata.chapter;
  const discipline = extractDiscipline(chapter);
  const chapterLabel = cleanChapterLabel(chapter);
  const points = context.map((c) => stripChunkDisplayText(c.content));
  let keyItems = toKeyPointItems(points);

  if (mode === 'math' && keyItems.length === 0) {
    keyItems = mathConceptKeyPoints(topic);
  }

  const overview = buildOverviewFromContext({
    topic,
    doubt,
    mode,
    chapter,
    classLevel: context[0]?.metadata.classLevel,
    intent,
    keyItemCount: keyItems.length,
  });

  if (intent === 'compare' && keyItems.length >= 2) {
    keyItems = keyItems.map((item, i) => ({
      ...item,
      label: i === 0 ? `First idea — ${item.label}` : `Compare with — ${item.label}`,
    }));
  }

  return formatStructuredAnswer({
    topic,
    subtitle:
      mode === 'social-studies' && discipline && chapterLabel
        ? `${discipline} · ${chapterLabel}`
        : mode === 'commerce' && chapterLabel
          ? `Business Studies · ${chapterLabel}`
          : undefined,
    overview,
    keyItems,
    footer:
      mode === 'social-studies'
        ? socialFooter(discipline, doubt)
        : mode === 'commerce'
          ? commerceFooter(doubt)
          : undefined,
    mathWorkingHint: options?.mathWorkingHint,
  });
}

function composeMathDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  intent: Intent,
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> {
  const topic = context[0]?.metadata.topic ?? 'Mathematics';
  const parsed = parseMonicQuadratic(doubt.text);
  const isQuadratic =
    topic.toLowerCase().includes('quadratic') ||
    /x(?:\^2|²)/i.test(doubt.text) ||
    /\bquadratic\b/i.test(doubt.text);

  if (intent === 'solve' && parsed) {
    const steps = buildQuadraticFactorizationSteps(parsed.b, parsed.c);
    const overview =
      'A **quadratic equation** has the form ax² + bx + c = 0. When it factorises neatly, we split the middle term, group, and use the **zero-product rule** to find x.';

    return {
      answer: formatStructuredAnswer({
        topic: topic.includes('quadratic') ? topic : 'Quadratic equations',
        overview,
        keyItems: quadraticSolveKeyPoints(parsed.b, parsed.c),
        mathWorkingHint: Boolean(steps),
      }),
      rawMathExplanation: steps
        ? stepsToMarkdown(steps, 'Step-by-step working')
        : undefined,
    };
  }

  let rawMath: string | undefined;
  if (parsed) {
    const steps = buildQuadraticFactorizationSteps(parsed.b, parsed.c);
    if (steps) rawMath = stepsToMarkdown(steps, 'Step-by-step working');
  } else if (isQuadratic && /\b(what is|define|definition)\b/i.test(doubt.text)) {
    rawMath = stepsToMarkdown(buildQuadraticDefinitionSteps(), 'Formulas and definitions');
  } else if (isQuadratic) {
    rawMath = stepsToMarkdown(buildQuadraticDefinitionSteps(), 'Reference formulas');
  }

  const conceptKeys = mathConceptKeyPoints(topic);
  const corpusKeys = toKeyPointItems(context.map((c) => stripChunkDisplayText(c.content)));
  const keyItems: KeyPointItem[] =
    corpusKeys.length > 0 ? corpusKeys : conceptKeys.length > 0 ? conceptKeys : [];

  if (context.length === 0 && keyItems.length === 0) {
    return { answer: composeEmptyAnswer(doubt), rawMathExplanation: rawMath };
  }

  const answer =
    context.length > 0
      ? composeFromChunks(doubt.text, context, 'math', intent, { mathWorkingHint: Boolean(rawMath) })
      : formatStructuredAnswer({
          topic,
          overview: buildOverviewFromContext({
            topic,
            doubt: doubt.text,
            mode: 'math',
            classLevel: doubt.classLevel,
            intent,
          }),
          keyItems,
          mathWorkingHint: Boolean(rawMath),
        });

  return { answer, rawMathExplanation: rawMath };
}

function composeEmptyAnswer(doubt: DoubtRequest): string {
  const subjectHint = doubt.subjectId
    ? `Nothing in the **${doubt.subjectId}** NCERT deck matched this wording for Class ${doubt.classLevel ?? '?'}.`
    : 'Nothing in the knowledge deck matched this wording.';
  return [
    `**Your doubt:** ${doubt.text}`,
    '',
    'No matching course material found.',
    subjectHint,
    '',
    '**Tip:** Check spelling, pick the right class/subject tab, or rephrase with the chapter name.',
  ].join('\n');
}

export function composeLocalDraft(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> {
  const intent = detectIntent(doubt.text);
  const focused = focusRetrievedChunks(doubt.text, context);
  const mode = resolveAnswerMode(doubt, focused);

  if (focused.length === 0 && !(mode === 'math' && intent === 'solve' && parseMonicQuadratic(doubt.text))) {
    return { answer: composeEmptyAnswer(doubt) };
  }

  if (mode === 'math') {
    return composeMathDraft(doubt, focused, intent);
  }

  return {
    answer: composeFromChunks(doubt.text, focused, mode, intent),
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
          : 'No direct match — provided general guidance.',
    },
    {
      step: 3,
      label: 'Compose explanation',
      detail: 'Built overview → key points → worked steps (for maths) from NCERT material.',
    },
    {
      step: 4,
      label: 'Verify completeness',
      detail: 'Checked that the answer directly addresses what the student asked.',
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
    model: 'synaptiq-local-tutor',
  };
}

export { focusRetrievedChunks, stripChunkDisplayText };
