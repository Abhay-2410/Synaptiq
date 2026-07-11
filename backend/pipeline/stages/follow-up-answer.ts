import type { DoubtRequest, TutorDraft } from '../types.js';
import { isFollowUpRequest, trimConversationHistory } from './conversation-context.js';
import { formatTutorAnswer } from './tutor-synthesis.js';

interface ParsedQuestion {
  number: number;
  marks?: string;
  prompt: string;
}

function extractExamQuestions(content: string): ParsedQuestion[] {
  const parts = content.split(/(?=#### Question \d+)/i);
  const out: ParsedQuestion[] = [];

  for (const part of parts) {
    const header = part.match(/^#### Question (\d+)(?:\s*·\s*([^.\n]+))?/i);
    if (!header) continue;
    const body = part
      .replace(/^#### Question \d+[^\n]*\n*/i, '')
      .replace(/\*Try answering[\s\S]*$/i, '')
      .replace(/\*[^*]+\*$/m, '')
      .trim();
    if (!body) continue;
    out.push({
      number: Number(header[1]),
      marks: header[2]?.trim(),
      prompt: body.split('\n').filter(Boolean).slice(0, 4).join(' ').trim(),
    });
  }

  return out;
}

function exampleForMotionPrompt(prompt: string, classLevel?: number): string[] {
  const p = prompt.toLowerCase();
  const junior = (classLevel ?? 10) <= 8;

  if (/speed|distance|time/.test(p)) {
    return junior
      ? [
          'A cyclist travels **120 m** in **30 s**.',
          'Speed $= \\dfrac{\\text{distance}}{\\text{time}} = \\dfrac{120}{30} = 4\\,\\text{m/s}$.',
        ]
      : [
          'A car covers **2 km** in **5 minutes**.',
          'Convert: $2\\,\\text{km} = 2000\\,\\text{m}$, $5\\,\\text{min} = 300\\,\\text{s}$.',
          'Average speed $= \\dfrac{2000}{300} \\approx 6.67\\,\\text{m/s}$ (or $24\\,\\text{km/h}$).',
        ];
  }

  if (/velocity|displacement/.test(p)) {
    return [
      'A runner goes **40 m east**, then **10 m west** in **10 s** total.',
      'Displacement $= 40 - 10 = 30\\,\\text{m east}$; distance $= 50\\,\\text{m}$.',
      'Average velocity $= \\dfrac{30}{10} = 3\\,\\text{m/s east}$ (not $5\\,\\text{m/s}$, because velocity uses displacement).',
    ];
  }

  if (/acceleration|uniform/.test(p)) {
    return [
      'A bus speeds up from **5 m/s** to **25 m/s** in **4 s**.',
      'Acceleration $a = \\dfrac{v - u}{t} = \\dfrac{25 - 5}{4} = 5\\,\\text{m/s}^2$.',
      'It is **uniform acceleration** because velocity changes by equal amounts each second.',
    ];
  }

  if (/graph|slope/.test(p)) {
    return [
      'On a **velocity–time graph**, a straight sloping line means uniform acceleration.',
      'The **slope** of the line gives acceleration; the **area under** the line gives displacement.',
    ];
  }

  return [
    'Use the formula that matches what the question gives: speed $= d/t$, velocity $= \\Delta s/\\Delta t$, or $a = (v-u)/t$.',
    'Substitute the given values with correct SI units before calculating.',
  ];
}

function buildExamplesForQuestions(
  questions: ParsedQuestion[],
  doubt: DoubtRequest,
): string {
  const sections = questions.map((q) => {
    const p = q.prompt.toLowerCase();
    let paragraphs: string[];

    if (/work|energy|power|joule/.test(p)) {
      paragraphs = [
        '**Example:** A **10 N** force pushes a box **3 m** along the floor.',
        'Work done $W = F \\times s = 10 \\times 3 = 30\\,\\text{J}$.',
        'If the box gains speed, that work can appear as kinetic energy $KE = \\frac{1}{2}mv^2$.',
      ];
    } else if (/speed|velocity|acceleration|motion|displacement/.test(p)) {
      paragraphs = exampleForMotionPrompt(q.prompt, doubt.classLevel);
    } else if (/ohm|resistance|current|voltage|circuit|electricity/.test(p)) {
      paragraphs = [
        "**Example:** $R = 10\\,\\Omega$, $V = 5\\,\\text{V}$ — find current.",
        "Ohm's law: $V = IR \\Rightarrow I = V/R = 5/10 = 0.5\\,\\text{A}$.",
      ];
    } else if (/force|newton|f\s*=\s*ma/.test(p)) {
      paragraphs = [
        '**Example:** Mass $m = 4\\,\\text{kg}$, net force $F = 12\\,\\text{N}$.',
        '$F = ma \\Rightarrow a = F/m = 12/4 = 3\\,\\text{m/s}^2$.',
      ];
    } else {
      paragraphs = [
        `Address the question directly: ${q.prompt}`,
        'State the definition or formula first, then substitute one concrete numerical example with units.',
      ];
    }

    return {
      heading: `Example for Question ${q.number}${q.marks ? ` (${q.marks})` : ''}`,
      paragraphs,
    };
  });

  return formatTutorAnswer({
    title: 'Worked examples for your questions',
    sections,
    closing:
      '*These examples match the questions above. Ask me to explain any step in more detail.*',
  });
}

/** Deterministic follow-up when the prior message listed exam-style questions. */
export function tryFollowUpAnswer(doubt: DoubtRequest): Pick<TutorDraft, 'answer' | 'reasoningSteps'> | null {
  if (!isFollowUpRequest(doubt.text)) return null;

  const history = trimConversationHistory(doubt.priorMessages);
  const lastAssistant = [...history].reverse().find((t) => t.role === 'assistant');
  if (!lastAssistant) return null;

  const questions = extractExamQuestions(lastAssistant.content);
  if (questions.length === 0) return null;

  if (!/\bexamples?\b|\banswer\b|\bsolve\b|\bsolution\b|\bwork(?:ed)? out\b/i.test(doubt.text)) {
    return null;
  }

  return {
    answer: buildExamplesForQuestions(questions, doubt),
    reasoningSteps: [
      {
        step: 1,
        label: 'Read prior questions',
        detail: `Found ${questions.length} numbered question(s) in the previous tutor message.`,
      },
      {
        step: 2,
        label: 'Build worked examples',
        detail: 'Generated one concrete, numerical example per question — tied to the same topic.',
      },
    ],
  };
}
