import type { AnswerMode } from './chunk-focus.js';
import type { AnswerIntent } from './answer-format.js';
import { buildExamQuestionAnswer, isExamQuestionRequest } from './exam-question.js';
import type { DoubtRequest } from '../types.js';
import { trySolveStemProblem } from './stem-solve.js';

/** Student-facing phrases that mean the tutor failed to answer — never emit these. */
const DEAD_END_PATTERNS = [
  /no matching course material/i,
  /could not find enough course material/i,
  /nothing in the .+ matched this wording/i,
  /try rephrasing with the chapter name/i,
  /check spelling, pick the right class/i,
  /please rephrase your doubt/i,
  /could not be verified against course material/i,
  /identify what is given, what is unknown/i,
  /apply the correct formula or operation at each step/i,
];

export function isDeadEndAnswer(answer: string): boolean {
  const text = answer.trim();
  if (text.length < 60) return true;
  return DEAD_END_PATTERNS.some((re) => re.test(text));
}

export function topicFromDoubt(doubt: string): string {
  const q = doubt.replace(/\?+$/, '').trim();
  if (/^what (is|are)\s+/i.test(q)) {
    const rest = q.replace(/^what (is|are)\s+/i, '');
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  if (/^explain\s+/i.test(q)) {
    const rest = q.replace(/^explain\s+/i, '');
    return rest.charAt(0).toUpperCase() + rest.slice(1);
  }
  if (/^how (do|does|can|to)\s+/i.test(q)) {
    return q.charAt(0).toUpperCase() + q.slice(1);
  }
  return q.charAt(0).toUpperCase() + q.slice(1);
}

function voice(classLevel?: number): 'junior' | 'middle' | 'senior' {
  if (!classLevel || classLevel <= 8) return 'junior';
  if (classLevel <= 10) return 'middle';
  return 'senior';
}

function formatAnswer(title: string, sections: { heading: string; paragraphs: string[] }[], closing?: string): string {
  const lines: string[] = [`**${title}**`];
  for (const section of sections) {
    lines.push('', `### ${section.heading}`, '');
    for (const p of section.paragraphs) {
      if (p.trim()) lines.push(p.trim(), '');
    }
  }
  if (closing?.trim()) lines.push(closing.trim());
  return lines.join('\n').trim();
}

function reportedSpeechAnswer(classLevel?: number): string {
  const band = voice(classLevel);
  return formatAnswer(
    'Reported speech (indirect speech)',
    [
      {
        heading: 'Overview',
        paragraphs:
          band === 'junior'
            ? [
                'Reported speech tells us what someone said without using their exact words — like passing on a message in your own sentence.',
              ]
            : [
                'Reported speech (indirect speech) reports what someone said without quoting their exact words. We usually shift the tense back one step, change pronouns, and adjust time or place words.',
              ],
      },
      {
        heading: 'How the changes work',
        paragraphs:
          band === 'senior'
            ? [
                '**Rule:** When the reporting verb is past (*said*, *told*), present tense typically shifts back one step.',
                '**Correct:** Direct — She said, "I am tired." → Reported — She said that she **was** tired.',
                '**Correct:** Direct — He said, "I will come tomorrow." → Reported — He said that he **would** come **the next day**.',
                '**Incorrect (common mistake):** She said that she **is** tired. ← tense not shifted.',
                '**Incorrect:** He said that he **will** come tomorrow. ← *will* and *tomorrow* should change.',
                'Questions become statements: "Are you ready?" → He asked if I was ready.',
              ]
            : [
                '**Correct:** He said, "I am happy." → He said that he **was** happy.',
                '**Correct:** She said, "I will finish tomorrow." → She said that she **would** finish **the next day**.',
                '**Incorrect:** He said that he **is** happy. ← you must shift *am* → *was*.',
                'Change pronouns: *I* → *he/she*, *my* → *his/her*.',
                'Change time words: *today* → *that day*, *tomorrow* → *the next day*.',
              ],
      },
      {
        heading: 'For your exam',
        paragraphs: [
          'Marks come from correct tense backshift, pronoun changes, and removing quotation marks — not from copying the direct sentence word for word.',
        ],
      },
    ],
    '*Quick check:* Change to reported speech: She said, "I am studying for my exam."*',
  );
}

function topicSentenceAnswer(classLevel?: number): string {
  const band = voice(classLevel);
  return formatAnswer(
    'Topic sentence and supporting details',
    [
      {
        heading: 'Overview',
        paragraphs: [
          band === 'junior'
            ? 'A paragraph usually starts with a topic sentence that tells the main idea. The other sentences add details that explain or prove that idea.'
            : 'The topic sentence states the main idea of a paragraph. Supporting details are the facts, examples, or explanations that develop that main idea.',
        ],
      },
      {
        heading: 'How they work together',
        paragraphs: [
          '**Topic sentence** — the "headline" of the paragraph (what it is mostly about).',
          '**Supporting details** — evidence, examples, reasons, or descriptions that back up the topic sentence.',
          'A strong paragraph keeps every supporting detail related to the topic sentence — if a sentence does not support the main idea, it probably belongs in another paragraph.',
        ],
      },
    ],
    '*Quick check:* In one sentence, what is the topic sentence of a paragraph about?*',
  );
}

function photosynthesisAnswer(classLevel?: number): string {
  const band = voice(classLevel);
  return formatAnswer(
    'Photosynthesis',
    [
      {
        heading: 'In plain words',
        paragraphs: [
          band === 'junior'
            ? 'Plants make their own food using sunlight, water, and carbon dioxide from the air. This process is called photosynthesis.'
            : 'Photosynthesis is how green plants convert light energy into chemical energy (glucose), using carbon dioxide and water, and release oxygen as a by-product.',
        ],
      },
      {
        heading: 'How it works',
        paragraphs: [
          'Sunlight is absorbed by **chlorophyll** in the **chloroplasts** of leaf cells.',
          'Carbon dioxide enters through stomata; water comes from the roots.',
          'The products are **glucose** (food for the plant) and **oxygen** (released into the air).',
        ],
      },
    ],
    '*Quick check:* What gas do plants release during photosynthesis?*',
  );
}

function fractionsAnswer(classLevel?: number): string {
  const band = voice(classLevel);
  return formatAnswer(
    'Fractions',
    [
      {
        heading: 'Overview',
        paragraphs: [
          band === 'junior'
            ? 'A fraction shows parts of a whole. The top number (numerator) counts the parts you have; the bottom (denominator) shows how many equal parts the whole is divided into.'
            : 'A fraction represents a part of a whole or a ratio of two quantities: numerator ÷ denominator.',
        ],
      },
      {
        heading: 'Key ideas',
        paragraphs: [
          'Equivalent fractions name the same amount (e.g. 1/2 = 2/4) — multiply or divide numerator and denominator by the same number.',
          'To add or subtract fractions, first make the denominators the same (common denominator), then add the numerators.',
          'To compare fractions, convert to like denominators or decimal form.',
        ],
      },
    ],
    '*Quick check:* Which is larger — 3/4 or 2/3?*',
  );
}

function democracyAnswer(classLevel?: number): string {
  const band = voice(classLevel);
  return formatAnswer(
    'Democracy',
    [
      {
        heading: 'The big picture',
        paragraphs: [
          band === 'junior'
            ? 'Democracy means people have a say in who runs the country — leaders are chosen through elections and citizens have basic rights.'
            : 'Democracy is a form of government in which rulers are elected by the people and govern according to constitutional rules, with civil liberties and accountability.',
        ],
      },
      {
        heading: 'Key features',
        paragraphs: [
          '**Free and fair elections** — citizens choose representatives.',
          '**Political equality** — each vote carries equal weight (one person, one vote).',
          '**Rule of law** — everyone, including leaders, is subject to the law.',
          '**Fundamental rights** — freedom of speech, assembly, and equality before law.',
        ],
      },
    ],
    '*Quick check:* Name one feature that makes a country a democracy.*',
  );
}

function modeFallbackAnswer(doubt: DoubtRequest, mode: AnswerMode, intent: AnswerIntent): string {
  const title = topicFromDoubt(doubt.text);
  const band = voice(doubt.classLevel);
  const subject = doubt.subjectId ?? 'this subject';

  const intentLead =
    intent === 'define'
      ? `Here is a clear explanation of **${title.toLowerCase()}** for Class ${doubt.classLevel ?? 'your'} ${subject}.`
      : intent === 'compare'
        ? `Let us compare the ideas you asked about in a structured way.`
        : intent === 'solve'
          ? `Let us work through the method step by step.`
          : `Here is a structured explanation to answer your question.`;

  const modeSections: Record<AnswerMode, { heading: string; paragraphs: string[] }[]> = {
    english: [
      {
        heading: 'The rule',
        paragraphs: [
          intentLead,
          'State the grammar or writing rule in one clear sentence, then demonstrate with real example sentences.',
        ],
      },
      {
        heading: 'Examples',
        paragraphs: [
          'Give at least one **correct** example sentence applying the rule.',
          'Where useful, show one **incorrect** example and fix it — this is how examiners test understanding.',
        ],
      },
    ],
    'life-science': [
      {
        heading: 'In plain words',
        paragraphs: [intentLead, 'Start with what the structure or process does, then name the key parts involved.'],
      },
      {
        heading: 'What to remember',
        paragraphs: [
          'Link structure to function (what it is → what it does).',
          'Use correct biological terms, but explain them if they are new.',
        ],
      },
    ],
    'physical-science': [
      {
        heading: 'Step-by-step working',
        paragraphs: [
          intentLead,
          'Write the formula, substitute the given numbers, and compute the actual result — do not stop at describing the method.',
        ],
      },
    ],
    'social-studies': [
      {
        heading: 'The big picture',
        paragraphs: [intentLead, 'History and civics answers work best as cause → event → consequence chains.'],
      },
      {
        heading: 'Building your answer',
        paragraphs: [
          'Open with one sentence of context (when/where).',
          'Explain two or three key developments and link them.',
          'Close with why it mattered for people or for the exam theme.',
        ],
      },
    ],
    commerce: [
      {
        heading: 'The concept',
        paragraphs: [
          intentLead,
          'Define the term in one precise sentence, then show a **worked example with real figures or a journal entry** where applicable.',
        ],
      },
      {
        heading: 'Worked application',
        paragraphs: [
          'Use a concrete business or accounts example from the CBSE syllabus — numbers, dates, or transaction lines when relevant.',
          'Explain what each part of the example means, not just labels.',
        ],
      },
    ],
    math: [
      {
        heading: 'Step-by-step working',
        paragraphs: [
          intentLead,
          'This problem needs a full worked solution with real arithmetic — the dedicated solver could not parse it automatically. Break it into numbered steps and show every intermediate value.',
        ],
      },
    ],
    general: [
      {
        heading: 'Overview',
        paragraphs: [intentLead],
      },
      {
        heading: 'Explained',
        paragraphs: [
          'Break the question into smaller parts and address each directly.',
          `Calibrate your vocabulary to Class ${doubt.classLevel ?? 'your'} level — clear and exam-ready.`,
        ],
      },
    ],
  };

  return formatAnswer(title, modeSections[mode] ?? modeSections.general);
}

/**
 * Answer from built-in CBSE curriculum knowledge when retrieval found nothing.
 * Never mentions missing course material — teaches the topic directly.
 */
export function buildKnowledgeAnswer(
  doubt: DoubtRequest,
  mode: AnswerMode,
  intent: AnswerIntent,
): string {
  if (intent === 'exam-question' || isExamQuestionRequest(doubt.text)) {
    return buildExamQuestionAnswer(doubt, [], mode);
  }

  const stem = trySolveStemProblem(doubt);
  if (stem) return stem.answer;

  const q = doubt.text.toLowerCase();

  if (/reported speech|indirect speech|direct speech/.test(q)) {
    return reportedSpeechAnswer(doubt.classLevel);
  }
  if (/topic sentence|supporting detail/.test(q)) {
    return topicSentenceAnswer(doubt.classLevel);
  }
  if (/photosynthesis/.test(q)) {
    return photosynthesisAnswer(doubt.classLevel);
  }
  if (/\bfractions?\b/.test(q) && (doubt.subjectId === 'math' || mode === 'math')) {
    return fractionsAnswer(doubt.classLevel);
  }
  if (/\bdemocracy\b/.test(q)) {
    return democracyAnswer(doubt.classLevel);
  }
  if (/\bmitosis\b/.test(q)) {
    return formatAnswer('Mitosis', [
      {
        heading: 'In plain words',
        paragraphs: [
          'Mitosis is cell division that produces two genetically identical daughter cells — used for growth and repair.',
        ],
      },
      {
        heading: 'Key stages',
        paragraphs: [
          'The chromosome copies itself, lines up, splits, and the cell divides — prophase, metaphase, anaphase, telophase (PMAT).',
          'Daughter cells have the same number of chromosomes as the parent.',
        ],
      },
    ], '*Quick check:* How many cells result from one mitosis division?*');
  }
  if (/\bnewton\b.*\b(second|2nd|law)\b/i.test(q) || /\bf\s*=\s*ma\b/i.test(q)) {
    return formatAnswer("Newton's second law", [
      {
        heading: 'The idea',
        paragraphs: [
          "Newton's second law: the net force on an object equals mass times acceleration ($F = ma$).",
          'Greater force → greater acceleration; greater mass → less acceleration for the same force.',
        ],
      },
      {
        heading: 'Worked example',
        paragraphs: [
          'A **2 kg** block is pushed with a net force of **10 N**. Find acceleration.',
          '$F = ma \\Rightarrow a = F/m = 10/2 = 5\\,\\text{m/s}^2$.',
          'The acceleration is **5 m/s²** in the direction of the net force.',
        ],
      },
    ], '*Quick check:* If mass doubles but force stays the same, what happens to acceleration?*');
  }
  if (/\baccounting equation\b|\bassets\s*=.*liabilit/i.test(q) || (doubt.subjectId === 'accountancy' && /\bassets\b|\bliabilit/i.test(q))) {
    return formatAnswer('The accounting equation', [
      {
        heading: 'The rule',
        paragraphs: ['**Assets = Liabilities + Capital** — every transaction keeps this equation balanced.'],
      },
      {
        heading: 'Worked example',
        paragraphs: [
          'Ram starts a business with ₹50,000 cash.',
          '**Journal:** Cash A/c Dr ₹50,000 … To Capital A/c ₹50,000.',
          'After entry: Assets (Cash ₹50,000) = Liabilities (₹0) + Capital (₹50,000).',
        ],
      },
    ], '*Quick check:* If assets are ₹80,000 and liabilities ₹30,000, what is capital?*');
  }
  if (/\blaw of demand\b|\bdemand curve\b/i.test(q) || (doubt.subjectId === 'economics' && /\bdemand\b/i.test(q))) {
    return formatAnswer('Law of demand', [
      {
        heading: 'The rule',
        paragraphs: ['**Law of demand:** ceteris paribus, when price rises, quantity demanded falls.'],
      },
      {
        heading: 'Worked example',
        paragraphs: [
          'Tea at ₹20/cup → 100 cups sold daily. Price rises to ₹30 → quantity may fall to 70 cups.',
          'The demand curve slopes **downward** — inverse price–quantity relationship.',
        ],
      },
    ], '*Quick check:* What happens to quantity demanded when price increases?*');
  }

  return modeFallbackAnswer(doubt, mode, intent);
}

/** Pull an embedded quick-check question from a tutor answer, if present. */
export function extractQuickCheckQuestion(tutorAnswer: string): string | null {
  const patterns = [
    /\*Quick check:\*\s*([^*\n]+)/i,
    /Quick check:\s*([^\n]+)/i,
  ];
  for (const re of patterns) {
    const match = tutorAnswer.match(re);
    const text = match?.[1]?.trim();
    if (text && text.length > 10) {
      return text.endsWith('?') ? `Quick check: ${text}` : `Quick check: ${text}?`;
    }
  }
  return null;
}
