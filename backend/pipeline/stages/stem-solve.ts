/**
 * Deterministic STEM problem solver — always shows real numbers and algebra,
 * never abstract "apply the formula" templates.
 */
import type { ClassLevel } from '../curriculum/catalog.js';
import type { DoubtRequest, TutorDraft } from '../types.js';
import { resolveAnswerMode } from './chunk-focus.js';
import { detectIntent } from './local-tutor.js';
import { stepsToMarkdown, type RawMathStep } from './raw-math/quadratic.js';
import { enhanceRawMathMarkdown } from './raw-math/enhance-steps.js';
import { buildLinearSystemWorked, parseLinearSystem } from './raw-math/linear-system.js';
import {
  formatPhysicsNarrative,
  trySolvePhysicsNumerical,
} from './physics-numerical.js';

export function normalizeMathInput(text: string): string {
  return text
    .replace(/\u2212/g, '-')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface MonicQuadratic {
  b: number;
  c: number;
  display: string;
}

/** Parse monic quadratic x² + bx + c = 0 from natural student wording. */
export function parseMonicQuadratic(question: string): MonicQuadratic | null {
  const q = normalizeMathInput(question);
  const patterns = [
    /x\^2\s*([+-])\s*(\d+)\s*x\s*([+-])\s*(\d+)\s*=\s*0/i,
    /x\^2\s*([+-])\s*(\d+)x\s*([+-])\s*(\d+)\s*=\s*0/i,
    /x\^2\s*([+-])\s*(\d+)\s*x\s*([+-])\s*(\d+)/i,
  ];

  for (const re of patterns) {
    const m = q.match(re);
    if (!m) continue;
    const bSign = m[1];
    const cSign = m[3];
    const bVal = bSign === '-' ? -Number(m[2]) : Number(m[2]);
    const cVal = cSign === '-' ? -Number(m[4]) : Number(m[4]);
    const display =
      question.match(/x[²^]2[\s\S]{0,30}=[\s\S]{0,10}0/)?.[0]?.trim() ??
      `x² ${bSign === '-' ? '-' : '+'} ${m[2]}x ${cSign === '-' ? '-' : '+'} ${m[4]} = 0`;
    return { b: bVal, c: cVal, display };
  }
  return null;
}

function findSplitFactors(b: number, c: number): { p: number; q: number } | null {
  for (let p = -Math.abs(c); p <= Math.abs(c); p++) {
    if (p === 0) continue;
    if (c % p !== 0) continue;
    const q = c / p;
    if (p + q === b) return { p, q };
  }
  return null;
}

function buildMonicQuadraticWorkedSteps(quad: MonicQuadratic, classLevel?: ClassLevel): RawMathStep[] {
  const { b, c, display } = quad;
  const split = findSplitFactors(b, c);
  if (!split) return [];

  const { p, q } = split;
  const rootP = -p;
  const rootQ = -q;
  const r1 = Math.min(rootP, rootQ);
  const r2 = Math.max(rootP, rootQ);

  const verify1 = r1 * r1 + b * r1 + c;
  const verify2 = r2 * r2 + b * r2 + c;

  const eqDisplay = display.includes('$')
    ? display
    : `$x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$`;

  return [
    {
      equation: eqDisplay,
      explanation:
        classLevel && classLevel <= 8
          ? 'This is a quadratic equation — the highest power of x is 2. We want the values of x that make it true.'
          : 'Identify the equation in standard form $ax^2 + bx + c = 0$ (here $a = 1$).',
    },
    {
      equation: `Find two numbers that multiply to ${c} and add to ${b}: ${p} and ${q}`,
      explanation: `Split the middle term: $x^2 ${p >= 0 ? '+' : '-'} ${Math.abs(p)}x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$.`,
    },
    {
      equation: `$(x ${p >= 0 ? '+' : '-'} ${Math.abs(p)})(x ${q >= 0 ? '+' : '-'} ${Math.abs(q)}) = 0$`,
      explanation: 'Factor by grouping — the expression becomes a product of two linear factors.',
    },
    {
      equation: `$x ${p >= 0 ? '+' : '-'} ${Math.abs(p)} = 0 \\Rightarrow x = ${rootP}$; $x ${q >= 0 ? '+' : '-'} ${Math.abs(q)} = 0 \\Rightarrow x = ${rootQ}$`,
      explanation: 'Zero-product property: if $AB = 0$, then $A = 0$ or $B = 0$.',
    },
    {
      equation: `$x = ${r1}$ or $x = ${r2}$`,
      explanation: `Verify: $(${r1})^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${r1}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = ${verify1}$ and $(${r2})^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}(${r2}) ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = ${verify2}$.`,
    },
  ];
}

function formatQuadraticNarrative(quad: MonicQuadratic, classLevel?: ClassLevel): string {
  const { b, c, display } = quad;
  const split = findSplitFactors(b, c);
  if (!split) return '';

  const { p, q } = split;
  const rootP = -p;
  const rootQ = -q;
  const r1 = Math.min(rootP, rootQ);
  const r2 = Math.max(rootP, rootQ);

  const eqDisplay = display.includes('$')
    ? display
    : `$x^2 ${b >= 0 ? '+' : '-'} ${Math.abs(b)}x ${c >= 0 ? '+' : '-'} ${Math.abs(c)} = 0$`;

  const band = classLevel && classLevel <= 8 ? 'junior' : classLevel && classLevel <= 10 ? 'middle' : 'senior';

  const overview =
    band === 'junior'
      ? `We need to find which value(s) of $x$ make ${eqDisplay} true. Since the highest power is 2, this is a **quadratic equation**.`
      : `The equation ${eqDisplay} is a quadratic in standard form ($ax^2 + bx + c = 0$ with $a = 1$). The solutions are the $x$-values where the graph crosses the $x$-axis.`;

  const approach =
    band === 'senior'
      ? `Because the constant term ${c} and middle coefficient ${b} allow clean factorisation, we look for two integers that **multiply to ${c}** and **add to ${b}** — here ${p} and ${q}. We split the $${b}x$ term, factor by grouping, then use the zero-product property.`
      : `We factorise: find two numbers that multiply to **${c}** and add to **${b}**. Those are **${p}** and **${q}**. Rewrite the middle term using them, factor into two brackets, then set each bracket equal to zero.`;

  return [
    '**Quadratic equation**',
    '',
    '### Understanding the problem',
    '',
    overview,
    '',
    '### The approach',
    '',
    approach,
    '',
    '### Final answer',
    '',
    `$$x = ${r1} \\quad \\text{or} \\quad x = ${r2}$$`,
    '',
    `Substituting back: both values satisfy the original equation. The **step-by-step working** below shows every line of algebra — factorisation, roots, and verification — exactly as you would write it in your notebook.`,
  ].join('\n');
}

function formatLinearNarrative(leq: { a: number; b: number; c: number; display: string }): string {
  const x = (leq.c - leq.b) / leq.a;
  return [
    '**Linear equation**',
    '',
    '### Understanding the problem',
    '',
    `Solve $${leq.display}$ for $x$. This is a first-degree equation — the variable appears only to the power 1.`,
    '',
    '### The approach',
    '',
    'Isolate $x$ by undoing operations in reverse order: move the constant term to the other side, then divide by the coefficient of $x$.',
    '',
    '### Final answer',
    '',
    `$$x = ${x}$$`,
    '',
    'See the step-by-step working below for the full calculation with every intermediate line.',
  ].join('\n');
}

function formatFractionNarrative(
  frac: { left: string; op: string; right: string },
  steps: RawMathStep[],
): string {
  const final = steps[steps.length - 1]?.equation ?? '';
  return [
    '**Fractions**',
    '',
    '### Understanding the problem',
    '',
    `Simplify $\\frac{${frac.left.split('/')[0]}}{${frac.left.split('/')[1]}} ${frac.op === '+' ? '+' : '-'} \\frac{${frac.right.split('/')[0]}}{${frac.right.split('/')[1]}}$ by finding a common denominator.`,
    '',
    '### The approach',
    '',
    'Convert both fractions to equivalent fractions with the same denominator (the LCM), combine the numerators, then simplify if possible.',
    '',
    '### Final answer',
    '',
    final,
    '',
    'The step-by-step working below shows each conversion and simplification line by line.',
  ].join('\n');
}

function formatFmaNarrative({ m, f }: { m: number; f: number }): string {
  const a = f / m;
  return [
    "**Newton's second law**",
    '',
    '### Understanding the problem',
    '',
    `A mass of $${m}\\,\\text{kg}$ experiences a force of $${f}\\,\\text{N}$. Find the acceleration using $F = ma$.`,
    '',
    '### The approach',
    '',
    'Rearrange $F = ma$ to $a = F/m$, substitute the given values, and compute with correct SI units ($\\text{m/s}^2$).',
    '',
    '### Final answer',
    '',
    `$$a = ${a}\\,\\text{m/s}^2$$`,
    '',
    'The step-by-step working below shows the formula substitution and arithmetic.',
  ].join('\n');
}

function formatNarrativeAnswer(
  title: string,
  steps: RawMathStep[],
  options?: {
    classLevel?: ClassLevel;
    quad?: MonicQuadratic;
    linear?: { a: number; b: number; c: number; display: string };
    frac?: { left: string; op: string; right: string };
    fma?: { m: number; f: number };
  },
): string {
  if (options?.quad) return formatQuadraticNarrative(options.quad, options.classLevel);
  if (options?.linear) return formatLinearNarrative(options.linear);
  if (options?.frac) return formatFractionNarrative(options.frac, steps);
  if (options?.fma) return formatFmaNarrative(options.fma);

  const final = steps[steps.length - 1];
  return [
    `**${title}**`,
    '',
    '### Overview',
    '',
    'Here is a worked solution to your problem. The final result is stated below; every calculation line is shown in the step-by-step working panel.',
    '',
    '### Final answer',
    '',
    final?.equation ?? '',
    '',
    'See the step-by-step working below for the full derivation.',
  ].join('\n');
}

function parseLinearEquation(question: string): { a: number; b: number; c: number; display: string } | null {
  const q = normalizeMathInput(question);
  if (/x\^2/.test(q)) return null;
  const m = q.match(/(\d+)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)/i);
  if (!m) return null;
  const a = Number(m[1]);
  const bSign = m[2];
  const b = bSign === '-' ? -Number(m[3]) : Number(m[3]);
  const c = Number(m[4]);
  return { a, b, c, display: `${a}x ${bSign} ${m[3]} = ${c}` };
}

function buildLinearWorked(leq: { a: number; b: number; c: number; display: string }): RawMathStep[] {
  const x = (leq.c - leq.b) / leq.a;
  const rhs = leq.c - leq.b;
  return [
    {
      equation: `$${leq.display}$`,
      explanation: 'Linear equation in one variable — we will isolate $x$ on one side.',
    },
    {
      equation: `$${leq.a}x = ${rhs}$`,
      explanation: `Subtract ${Math.abs(leq.b)} from both sides (${leq.c} ${leq.b >= 0 ? '-' : '+'} ${Math.abs(leq.b)} = ${rhs}).`,
    },
    {
      equation: `$x = \\frac{${rhs}}{${leq.a}} = ${x}$`,
      explanation: `Divide both sides by ${leq.a} to isolate $x$.`,
    },
  ];
}

function parseFractionArithmetic(question: string): { left: string; op: string; right: string } | null {
  const q = normalizeMathInput(question);
  const m = q.match(/(\d+)\s*\/\s*(\d+)\s*([+-])\s*(\d+)\s*\/\s*(\d+)/);
  if (!m) return null;
  return { left: `${m[1]}/${m[2]}`, op: m[3], right: `${m[4]}/${m[5]}` };
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function buildFractionWorked(
  frac: { left: string; op: string; right: string },
  classLevel?: ClassLevel,
): RawMathStep[] {
  const [n1, d1] = frac.left.split('/').map(Number);
  const [n2, d2] = frac.right.split('/').map(Number);
  const lcm = (d1 * d2) / gcd(d1, d2);
  const n1s = n1 * (lcm / d1);
  const n2s = n2 * (lcm / d2);
  const resultN = frac.op === '+' ? n1s + n2s : n1s - n2s;
  const g = gcd(Math.abs(resultN), lcm);
  const simpN = resultN / g;
  const simpD = lcm / g;

  return [
    {
      equation: `$\\frac{${n1}}{${d1}} ${frac.op} \\frac{${n2}}{${d2}}$`,
      explanation:
        classLevel && classLevel <= 8
          ? 'Find a common denominator so both fractions have the same bottom number.'
          : 'Use the LCM of denominators as the common denominator.',
    },
    {
      equation: `$\\frac{${n1s}}{${lcm}} ${frac.op} \\frac{${n2s}}{${lcm}} = \\frac{${resultN}}{${lcm}}$`,
      explanation: `Convert: $\\frac{${n1}}{${d1}} = \\frac{${n1s}}{${lcm}}$ and $\\frac{${n2}}{${d2}} = \\frac{${n2s}}{${lcm}}$.`,
    },
    {
      equation: `$\\frac{${resultN}}{${lcm}} = \\frac{${simpN}}{${simpD}}$`,
      explanation: g > 1 ? `Simplify by dividing numerator and denominator by ${g}.` : 'Already in simplest form.',
    },
  ];
}

function parseForceMassAccel(question: string): { m: number; f: number } | null {
  const q = question.toLowerCase();
  if (!/\b(force|acceleration|f\s*=\s*ma)\b/.test(q)) return null;
  const mass = q.match(/mass\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*kg/);
  const force = q.match(/force\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*n/i);
  if (mass && force) return { m: Number(mass[1]), f: Number(force[1]) };
  return null;
}

function buildFmaWorked({ m, f }: { m: number; f: number }): RawMathStep[] {
  const a = f / m;
  return [
    {
      equation: '$F = ma$',
      explanation: "Newton's second law — force equals mass times acceleration.",
    },
    {
      equation: `$a = \\frac{F}{m} = \\frac{${f}}{${m}}$`,
      explanation: 'Rearrange for acceleration.',
    },
    {
      equation: `$a = ${a}\\ \\text{m/s}^2$`,
      explanation: 'Substitute the given values and compute.',
    },
  ];
}

function draftFromSteps(
  title: string,
  steps: RawMathStep[],
  classLevel?: ClassLevel,
  narrativeOptions?: Parameters<typeof formatNarrativeAnswer>[2],
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> {
  return {
    answer: formatNarrativeAnswer(title, steps, { classLevel, ...narrativeOptions }),
    rawMathExplanation: enhanceRawMathMarkdown(stepsToMarkdown(steps, 'Step-by-step working')),
  };
}

function isStemSolveIntent(doubt: DoubtRequest): boolean {
  const mode = resolveAnswerMode(doubt, []);
  if (mode !== 'math' && mode !== 'physical-science') return false;
  const intent = detectIntent(doubt.text);
  if (intent === 'solve') return true;
  if (needsNumericSolveCue(doubt.text)) return true;
  return /[=+\-×÷^²]/.test(doubt.text) || /\d+\s*x/.test(doubt.text);
}

function needsNumericSolveCue(text: string): boolean {
  return (
    /\b(find|calculate|compute|solve|work\s*out|determine)\b/i.test(text) &&
    /\d/.test(text) &&
    (/[=Ωω]/.test(text) ||
      /\b[virfma]\s*=/i.test(text) ||
      /\b(mass|force|resistance|voltage|current|distance|time|speed|energy)\b/i.test(text))
  );
}

/**
 * Attempt a fully worked STEM solution. Returns null if the problem is not
 * recognized — caller should fall through to LLM / narrative synthesis.
 */
export function trySolveStemProblem(
  doubt: DoubtRequest,
): Pick<TutorDraft, 'answer' | 'rawMathExplanation'> | null {
  if (!isStemSolveIntent(doubt)) return null;

  const mode = resolveAnswerMode(doubt, []);
  const classLevel = doubt.classLevel;

  if (mode === 'math') {
    const quad = parseMonicQuadratic(doubt.text);
    if (quad) {
      const steps = buildMonicQuadraticWorkedSteps(quad, classLevel);
      if (steps.length > 0) {
        return draftFromSteps('Quadratic equation', steps, classLevel, { quad });
      }
    }

    const linear = parseLinearEquation(doubt.text);
    if (linear) {
      return draftFromSteps('Linear equation', buildLinearWorked(linear), classLevel, { linear });
    }

    const frac = parseFractionArithmetic(doubt.text);
    if (frac) {
      return draftFromSteps('Fractions', buildFractionWorked(frac, classLevel), classLevel, { frac });
    }

    const system = parseLinearSystem(doubt.text);
    if (system) {
      const sysSteps = buildLinearSystemWorked(system[0], system[1]);
      if (sysSteps && sysSteps.length > 0) {
        return draftFromSteps('Pair of linear equations', sysSteps, classLevel);
      }
    }
  }

  if (mode === 'physical-science') {
    const physics = trySolvePhysicsNumerical(doubt.text);
    if (physics) {
      return {
        answer: formatPhysicsNarrative(physics),
        rawMathExplanation: enhanceRawMathMarkdown(
          stepsToMarkdown(physics.steps, 'Step-by-step working'),
        ),
      };
    }
  }

  return null;
}
