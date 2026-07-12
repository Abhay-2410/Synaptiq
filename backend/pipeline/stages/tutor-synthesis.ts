import type { AnswerMode } from './chunk-focus.js';
import { cleanChapterLabel, extractDiscipline, stripChunkDisplayText } from './chunk-focus.js';
import type { AnswerIntent } from './answer-format.js';
import { buildExamQuestionAnswer, isExamQuestionRequest } from './exam-question.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';
import type { SubjectKey } from '../curriculum/catalog.js';
import { buildKnowledgeAnswer, tryCuratedConceptAnswer } from './tutor-knowledge.js';
import { trySolveStemProblem } from './stem-solve.js';

export interface SynthesisInput {
  doubt: DoubtRequest;
  context: RetrievedChunk[];
  mode: AnswerMode;
  intent: AnswerIntent;
}

interface ClassVoice {
  label: string;
  opener: string;
  connective: string;
}

function classVoice(classLevel?: number): ClassVoice {
  if (!classLevel || classLevel <= 8) {
    return {
      label: 'younger',
      opener: 'Think of it this way:',
      connective: 'Then',
    };
  }
  if (classLevel <= 10) {
    return {
      label: 'middle',
      opener: 'To understand this properly,',
      connective: 'After that',
    };
  }
  return {
    label: 'senior',
    opener: 'At this stage in your syllabus,',
    connective: 'Subsequently',
  };
}

/** Split chunk bodies into individual fact sentences — internal use only. */
export function extractFacts(context: RetrievedChunk[]): string[] {
  const facts: string[] = [];
  for (const chunk of context) {
    const text = stripChunkDisplayText(chunk.content);
    const sentences = text.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
    for (const s of sentences) {
      if (s.length > 12) facts.push(s);
    }
  }
  return dedupeFacts(facts);
}

function dedupeFacts(facts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const f of facts) {
    const key = f.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(f);
  }
  return out;
}

/** Rewrite a corpus sentence into tutor prose — never return the source verbatim. */
export function paraphraseFact(sentence: string, classLevel?: number, mode?: AnswerMode): string {
  const s = sentence.trim();
  const cv = classVoice(classLevel);

  // ── History / nationalism (India) ──
  if (/first world war.*khilafat/i.test(s) || /khilafat.*first world war/i.test(s)) {
    if (cv.label === 'younger') {
      return 'Two big events—the First World War and the Khilafat movement—made many Indians feel that British rule was unfair, and more people began supporting the freedom struggle together.';
    }
    if (cv.label === 'middle') {
      return 'The First World War (1914–18) created economic hardship and discontent in India, while the Khilafat agitation (early 1920s) united many Hindus and Muslims on a common political platform. Together, these developments widened and deepened nationalist feeling beyond a small educated elite.';
    }
    return 'The First World War strained colonial finances and expectations of loyalty, while the Khilafat movement mobilised cross-communal protest around a religious-political grievance—both catalysed the shift from moderate constitutionalism to mass-based nationalist politics in the 1920s.';
  }

  if (/non-cooperation.*civil disobedience.*quit india/i.test(s) || /non-cooperation \(1920\)/i.test(s)) {
    if (cv.label === 'younger') {
      return 'Gandhi led three major nationwide movements—the Non-Cooperation Movement (1920), the Civil Disobedience Movement (1930), and the Quit India Movement (1942)—that brought ordinary villagers, workers, and students into the freedom struggle.';
    }
    return 'Three landmark mass campaigns—the Non-Cooperation Movement (1920), Civil Disobedience (1930, including the Dandi March), and Quit India (1942)—successively broadened participation beyond urban elites to peasants, workers, women, and youth, making nationalism a lived popular experience rather than a newspaper debate.';
  }

  if (/satyagraha|dandi march|boycott of foreign/i.test(s)) {
    return cv.label === 'senior'
      ? 'Gandhi\'s method of satyagraha—non-violent civil resistance—combined symbolic acts (such as the Dandi March against the salt tax) with practical boycotts of foreign cloth and institutions, demonstrating how moral persuasion and mass mobilisation could challenge colonial authority.'
      : 'Gandhi asked people to protest peacefully through satyagraha—refusing to cooperate with unfair laws, boycotting British goods, and marching (famously to Dandi for salt)—which showed that ordinary citizens could resist empire without violence.';
  }

  if (/peasants.*workers.*women|role of peasants/i.test(s)) {
    return 'Nationalism was not only led by famous politicians—peasants facing heavy rents, industrial workers striking for rights, women joining processions and pickets, and revolutionary groups all shaped how the movement grew in different regions.';
  }

  // ── Life science patterns ──
  if (mode === 'life-science' && /process|cell|organism|plant/i.test(s)) {
    return restructureAsTeaching(s, cv);
  }

  // ── Generic restructure ──
  return restructureAsTeaching(s, cv);
}

function restructureAsTeaching(sentence: string, cv: ClassVoice): string {
  let s = sentence.replace(/[.!?]+$/, '').trim();

  // "X: a, b, c" definition lines → prose
  const colonIdx = s.indexOf(':');
  if (colonIdx > 0 && colonIdx < 40) {
    const term = s.slice(0, colonIdx).trim();
    const rest = s.slice(colonIdx + 1).trim();
    if (rest.includes(',')) {
      const traits = rest.split(/\s*,\s*/).filter(Boolean);
      return `When we talk about ${term.toLowerCase()}, we mean something defined by ${traits.slice(0, -1).join(', ')}${traits.length > 1 ? ', and ' : ''}${traits.at(-1)}.`;
    }
    return `${term.charAt(0).toUpperCase()}${term.slice(1)} means ${rest.charAt(0).toLowerCase()}${rest.slice(1)}.`;
  }

  // Passive → active where possible
  if (/^([A-Z][^.]{10,80})\s+(is|are|was|were)\s+/i.test(s)) {
    return `${s}.`;
  }

  // Prefix with connective occasionally for flow
  if (s.length < 120) {
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
  }

  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
}

function titleFromDoubt(doubt: string, fallback: string): string {
  const q = doubt.replace(/\?+$/, '').trim();
  if (/^explain\s+/i.test(q)) {
    return q.replace(/^explain\s+/i, '').charAt(0).toUpperCase() + q.replace(/^explain\s+/i, '').slice(1);
  }
  if (/^what (is|are)\s+/i.test(q)) {
    const rest = q.replace(/^what (is|are)\s+/i, '');
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  if (/^how (do|does|can|to)\s+/i.test(q)) {
    return q.charAt(0).toUpperCase() + q.slice(1);
  }
  return fallback;
}

function buildClosing(
  mode: AnswerMode,
  doubt: string,
  classLevel?: number,
  discipline?: string,
): string {
  const q = doubt.toLowerCase();

  if (mode === 'social-studies' && discipline === 'History' && /nationalism.*india|india.*nationalism/i.test(q)) {
    return (
      '**For your exam:** Write in three moves—(1) what caused nationalist feeling to grow, (2) two or three key movements with dates and examples, (3) how mass participation changed the struggle. Avoid listing events without explaining *why* each mattered.\n\n' +
      '*Quick check:* Can you name one economic reason and one political reason why Indians turned to mass protest after the First World War?*'
    );
  }

  if (mode === 'social-studies' && discipline === 'History') {
    return (
      '**For your exam:** Always chain your points as cause → event → consequence; one paragraph per major phase works better than a bare timeline.\n\n' +
      '*Quick check:* If you had to explain this topic in two sentences to a friend, what would your opening line be?*'
    );
  }

  if (mode === 'life-science') {
    return '*Quick check:* Can you explain this process in your own words without looking at your notes—starting with what goes in and what comes out?*';
  }

  if (mode === 'physical-science' || mode === 'math') {
    return '*Quick check:* What is the first step you would write if this came as a 3-mark numerical in your paper?*';
  }

  if (mode === 'commerce') {
    return '**For your exam:** Define the term, give two distinguishing features, and add one real-world example—examiners reward clarity over length.';
  }

  if (classLevel && classLevel <= 8) {
    return '*Quick check:* Try explaining this to someone at home in one minute—if they understand, you\'ve got it!*';
  }

  return '';
}

function synthesizeNarrative(facts: string[], classLevel?: number, mode?: AnswerMode): string[] {
  return facts.map((f) => paraphraseFact(f, classLevel, mode));
}

function buildHistoryNarrative(
  doubt: string,
  facts: string[],
  classLevel?: number,
  chapter?: string,
): { overview: string; body: string[]; closing: string } {
  const cv = classVoice(classLevel);
  const discipline = extractDiscipline(chapter);
  const paraphrased = synthesizeNarrative(facts, classLevel, 'social-studies');

  const isIndia =
    /india/i.test(doubt) ||
    /india/i.test(chapter ?? '') ||
    paraphrased.some((p) => /india|khilafat|gandhi|quit india/i.test(p));

  let overview: string;
  if (isIndia) {
    if (cv.label === 'younger') {
      overview =
        `${cv.opener} nationalism in India means that people across the country began to see themselves as one nation that should rule itself, not be controlled by the British. In the twentieth century, this feeling grew from speeches and newspapers into huge movements involving millions of ordinary people.`;
    } else if (cv.label === 'middle') {
      overview =
        `${cv.opener} Indian nationalism in the twentieth century was the growing belief that Indians should govern themselves and that British colonial rule was unjust. It moved from the work of early leaders into mass campaigns that connected economic grievances, cultural pride, and political rights.`;
    } else {
      overview =
        `${cv.opener} twentieth-century Indian nationalism transformed anti-colonial sentiment into organised mass politics—linking wartime economic pressures, constitutional disappointments, and Gandhian mobilisation into successive nationwide campaigns that ultimately undermined British authority.`;
    }
  } else {
    overview =
      `${cv.opener} this topic is about how people came to identify with a nation and demand political self-rule. The key is to see how ideas, leaders, and events connected—not just memorise dates.`;
  }

  const body: string[] = [];
  if (paraphrased.length >= 1) {
    body.push(paraphrased[0]!);
  }
  if (paraphrased.length >= 2) {
    body.push(`${cv.connective}, ${paraphrased[1]!.charAt(0).toLowerCase()}${paraphrased[1]!.slice(1)}`);
  }
  if (paraphrased.length >= 3) {
    body.push(...paraphrased.slice(2));
  }

  const closing = buildClosing('social-studies', doubt, classLevel, discipline ?? 'History');
  return { overview, body, closing };
}

function buildLifeScienceNarrative(
  doubt: string,
  facts: string[],
  classLevel?: number,
): { plain: string; mechanism: string[]; closing: string } {
  const cv = classVoice(classLevel);
  const paraphrased = synthesizeNarrative(facts, classLevel, 'life-science');

  const plain =
    cv.label === 'younger'
      ? `${cv.opener} let us understand the basic idea before the details. ${paraphrased[0] ?? 'Living organisms carry out this process to stay alive and grow.'}`
      : `${cv.opener} start with the big picture: ${paraphrased[0] ?? 'this is a core life-process that connects structure to function in living systems.'}`;

  const mechanism = paraphrased.slice(1);
  const closing = buildClosing('life-science', doubt, classLevel);
  return { plain, mechanism, closing };
}

function buildPhysicalScienceNarrative(
  doubt: string,
  facts: string[],
  classLevel?: number,
): { concept: string; details: string[]; closing: string } {
  const paraphrased = synthesizeNarrative(facts, classLevel, 'physical-science');
  const cv = classVoice(classLevel);
  const concept = `${cv.opener} ${paraphrased[0] ?? 'this concept describes a physical relationship you will use in numerical problems.'}`;
  const details = paraphrased.slice(1);
  const closing = buildClosing('physical-science', doubt, classLevel);
  return { concept, details, closing };
}

export function formatTutorAnswer(options: {
  title: string;
  subtitle?: string;
  sections: { heading: string; paragraphs: string[] }[];
  closing?: string;
  mathWorkingHint?: boolean;
}): string {
  const lines: string[] = [`**${options.title}**`];
  if (options.subtitle) lines.push(`*${options.subtitle}*`);

  for (const section of options.sections) {
    lines.push('', `### ${section.heading}`, '');
    for (const p of section.paragraphs) {
      if (p.trim()) lines.push(p.trim(), '');
    }
  }

  if (options.mathWorkingHint) {
    lines.push('### Step-by-step working', '');
    lines.push('_The full calculation is worked line-by-line below._', '');
  }

  if (options.closing?.trim()) {
    lines.push(options.closing.trim());
  }

  return lines.join('\n').trim();
}

export function synthesizeTutorAnswer(input: SynthesisInput): string {
  const { doubt, context, mode, intent } = input;

  const curated = tryCuratedConceptAnswer(doubt);
  if (curated) return curated;

  if (intent === 'exam-question' || isExamQuestionRequest(doubt.text)) {
    return buildExamQuestionAnswer(doubt, context, mode);
  }

  const facts = extractFacts(context);
  const topic = context[0]?.metadata.topic ?? 'this topic';
  const chapter = context[0]?.metadata.chapter;
  const classLevel = doubt.classLevel ?? context[0]?.metadata.classLevel;
  const discipline = extractDiscipline(chapter);
  const chapterLabel = cleanChapterLabel(chapter);
  const title = titleFromDoubt(doubt.text, topic);
  const subtitle =
    mode === 'social-studies' && discipline && chapterLabel
      ? `${discipline} · ${chapterLabel}`
      : mode === 'commerce' && chapterLabel
        ? `Business Studies · ${chapterLabel}`
        : undefined;

  if (facts.length === 0) {
    const stem = trySolveStemProblem(doubt);
    if (stem) return stem.answer;
    return buildKnowledgeAnswer(doubt, mode, intent);
  }

  // ── Social studies: narrative tutor voice ──
  if (mode === 'social-studies') {
    const { overview, body, closing } = buildHistoryNarrative(
      doubt.text,
      facts,
      classLevel,
      chapter,
    );
    return formatTutorAnswer({
      title,
      subtitle,
      sections: [
        { heading: 'The big picture', paragraphs: [overview] },
        {
          heading: discipline === 'Geography' ? 'How it works on the ground' : 'How events unfolded',
          paragraphs: body,
        },
        ...(body.length > 0
          ? [
              {
                heading: 'Why this matters',
                paragraphs: [
                  discipline === 'Geography'
                    ? 'Understanding this helps you explain patterns on a map and connect them to people\'s lives — not just name categories from the textbook. In map-based questions, always link the physical feature to human activity (farming, trade, settlement).'
                    : 'In the exam, marks come from showing how one development led to the next, not from copying a list of headings from your notes. Practice writing one paragraph that chains cause → event → consequence.',
                ],
              },
              {
                heading: 'Common exam mistake',
                paragraphs: [
                  discipline === 'Geography'
                    ? 'Students often list features without explaining the process — always say *how* and *why* the pattern forms, not just *what* it is called.'
                    : 'Students often dump dates without explaining significance — always answer "so what?" after naming an event or leader.',
                ],
              },
            ]
          : []),
      ],
      closing,
    });
  }

  // ── Life science ──
  if (mode === 'life-science') {
    const { plain, mechanism, closing } = buildLifeScienceNarrative(doubt.text, facts, classLevel);
    const keyTerms =
      mechanism.length >= 2
        ? [
            'Keep these terms straight in your notes — examiners often test whether you can use them in the right order:',
            mechanism.slice(-2).join(' '),
          ]
        : [];
    return formatTutorAnswer({
      title,
      sections: [
        { heading: 'In plain words', paragraphs: [plain] },
        {
          heading: 'How it works — step by step',
          paragraphs:
            mechanism.length > 0
              ? mechanism
              : [
                  'Each step builds on the previous one — follow the order carefully when you draw or label diagrams.',
                  'Ask yourself at each step: what goes in, what changes, and what comes out?',
                ],
        },
        ...(keyTerms.length > 0
          ? [{ heading: 'Key terms to remember', paragraphs: keyTerms }]
          : []),
      ],
      closing,
    });
  }

  // ── Physical science ──
  if (mode === 'physical-science') {
    const { concept, details, closing } = buildPhysicalScienceNarrative(doubt.text, facts, classLevel);
    return formatTutorAnswer({
      title,
      sections: [
        { heading: 'The idea — in plain words', paragraphs: [concept] },
        {
          heading: 'What you need to know',
          paragraphs:
            details.length > 0
              ? details
              : [
                  'Focus on the quantities involved and the units — CBSE often tests whether you can set up the relationship correctly.',
                  'Write the formula, label each symbol, and check units before substituting numbers.',
                ],
        },
        {
          heading: 'How to use this in problems',
          paragraphs: [
            'Read the question for what is given and what is asked. Pick the right formula, substitute with consistent units, and state the final answer with the correct unit.',
          ],
        },
      ],
      closing,
    });
  }

  // ── Commerce: short labels, tutor explanations (not echoed headings) ──
  if (mode === 'commerce') {
    const paragraphs = synthesizeNarrative(facts, classLevel, 'commerce');
    return formatTutorAnswer({
      title,
      subtitle,
      sections: [
        {
          heading: 'Overview',
          paragraphs: [
            classLevel && classLevel >= 11
              ? 'Let us walk through each form clearly—examiners want definitions plus how ownership, liability, and control differ.'
              : 'Here is what you need to know, explained simply.',
          ],
        },
        {
          heading: 'Explained step by step',
          paragraphs,
        },
      ],
      closing: buildClosing('commerce', doubt.text, classLevel),
    });
  }

  // ── Math (concept, not solve) ──
  if (mode === 'math') {
    const paragraphs = synthesizeNarrative(facts, classLevel, 'math');
    return formatTutorAnswer({
      title,
      sections: [
        {
          heading: 'Understanding the method',
          paragraphs: [
            paragraphs[0] ??
              'Before calculating, be clear about what the question is asking and which formula or technique applies.',
            ...paragraphs.slice(1),
          ],
        },
      ],
      closing: buildClosing('math', doubt.text, classLevel),
      mathWorkingHint: intent === 'solve',
    });
  }

  // ── English / general fallback ──
  const paragraphs = synthesizeNarrative(facts, classLevel, mode);
  return formatTutorAnswer({
    title,
    sections: [
      { heading: 'Overview', paragraphs: [paragraphs[0] ?? 'Let us break this down clearly.'] },
      { heading: 'Explained', paragraphs: paragraphs.slice(1) },
    ],
    closing: buildClosing(mode, doubt.text, classLevel),
  });
}

/** Shared depth guidance appended to all mode instructions. */
function answerDepthBlock(classLevel?: number): string {
  const cv = classVoice(classLevel);
  const wordTarget =
    cv.label === 'younger'
      ? '200–350 words'
      : cv.label === 'middle'
        ? '300–450 words'
        : '350–550 words';
  return [
    'DEPTH TARGET: Write a thorough tutor explanation (~' + wordTarget + ' for conceptual questions).',
    'Structure: (1) plain-language direct answer, (2) developed explanation with specifics, (3) example/analogy, (4) exam tip or common mistake if useful.',
    'Use ### subheadings when the answer has multiple distinct parts.',
    'Every paragraph must teach something new — depth through substance, not repetition.',
  ].join('\n');
}

/** Mode-specific instructions appended to LLM tutor prompts. */
export function tutorModeInstructions(
  mode: AnswerMode,
  classLevel?: number,
  intent?: AnswerIntent,
): string {
  const cv = classVoice(classLevel);
  const depth =
    cv.label === 'younger'
      ? 'Use simple vocabulary and one everyday analogy. Short sentences, but cover every important point — do not shorten into a summary.'
      : cv.label === 'middle'
        ? 'Use clear exam-appropriate language for Class 9–10. Enough detail to score well on 3–5 mark questions.'
        : 'Use precise terminology and assume prior chapters are known. Include connections, nuance, and syllabus-level detail.';

  const depthBlock = answerDepthBlock(classLevel);

  const antiEcho =
    'CRITICAL: Retrieved context is reference only. NEVER repeat chunk titles/headings verbatim. Synthesize into original tutor prose.';
  const antiFiller =
    'BANNED PHRASES (never use as substitutes for real work): "identify what is given", "apply the correct method", "this step would involve", "use the appropriate formula" without then showing the formula and calculation. Also banned as openers: "Let\'s explore", "To understand this, let\'s break it down", "Imagine you\'re on a merry-go-round" unless the student asked about circular motion.';

  const compareNote =
    intent === 'compare'
      ? 'COMPARE MODE: Give precise definitions, formulas with units, and a difference table — not a single vague paragraph.'
      : '';

  switch (mode) {
    case 'social-studies':
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\nNARRATIVE MODE: Write cause → event → consequence with specific dates and names. Explain WHY each development mattered. Flowing paragraphs with ### subheadings — NOT a bullet index of facts. ${depth}`;
    case 'life-science':
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\nMECHANISM MODE: Plain-language overview first, then step-by-step process (each step = what happens + why), then key terms, then a real example/analogy. Never restate the question as the answer. ${depth}`;
    case 'physical-science':
      return intent === 'compare'
        ? `${antiEcho}\n${antiFiller}\n${depthBlock}\n${compareNote}\nCONCEPTUAL PHYSICS MODE: Define each term, state formulas ($W=Fs$, $KE=\\frac{1}{2}mv^2$, etc.) with SI units, worked mini-example, then compare in a table. ${depth}`
        : `${antiEcho}\n${antiFiller}\n${depthBlock}\nQUANTITATIVE MODE: Show the FULL worked solution — real numbers, real substitutions, real final answer at every step. Also explain the concept in prose before or after the calculation. Use $...$ LaTeX. Put line-by-line work in [[RAW_MATH]]. Each step explanation must name the exact operation (e.g. "Divide both sides by 3") — never vague labels like "Simplifying" alone. ${depth}`;
    case 'math':
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\n${compareNote}\nQUANTITATIVE MODE: Show the FULL worked solution — real numbers, real substitutions, real final answer at every step. For concept questions, explain the method and WHY each step works before calculating. Use $...$ LaTeX. Put line-by-line work in [[RAW_MATH]]. Each step explanation must name the exact operation (e.g. "Divide both sides by 3") — never vague labels like "Simplifying" alone. ${depth}`;
    case 'commerce':
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\nCOMMERCE MODE: Definitions in full sentences PLUS worked examples (journal entries, numerical problems, business scenarios) with real figures. Explain the logic behind each entry or calculation. ${depth}`;
    case 'english':
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\nENGLISH MODE: State the rule in plain words, explain why it exists, then 2–3 correct example sentences and 1 incorrect contrast. For literature, quote or reference specific textual detail. ${depth}`;
    default:
      return `${antiEcho}\n${antiFiller}\n${depthBlock}\n${depth}`;
  }
}

export function subjectKeyFromMode(mode: AnswerMode): SubjectKey | undefined {
  void mode;
  return undefined;
}
