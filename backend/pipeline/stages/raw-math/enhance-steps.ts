import { parseRawMathMarkdown } from './parse-markdown.js';
import { type RawMathStep, stepsToMarkdown } from './quadratic.js';

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

function normEq(equation: string): string {
  let s = equation.replace(/\\frac\{(\d+)\}\{(\d+)\}/g, '$1/$2');
  return s
    .replace(/\\/g, '')
    .replace(/[{}$`]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function parseVarFraction(norm: string): { variable: string; num: number; den: number } | null {
  const m = norm.match(/^([a-z])=(\d+)\/(\d+)$/);
  if (!m) return null;
  return { variable: m[1], num: Number(m[2]), den: Number(m[3]) };
}

function parseCoeffVar(norm: string): { coeff: number; variable: string; rhs: string } | null {
  const m = norm.match(/^(\d+)([a-z])=(.+)$/);
  if (!m) return null;
  return { coeff: Number(m[1]), variable: m[2], rhs: m[3] };
}

const VAGUE_RE =
  /^(simplifying|simplified|solve|solving|solving for [a-z]|calculate|calculating|find|finding)[\s.:]*$/i;

function isVagueExplanation(text: string): boolean {
  const t = text.trim();
  if (VAGUE_RE.test(t)) return true;
  if (/^simplifying\b/i.test(t) && t.length < 45) return true;
  if (/^solving for [a-z]\.?$/i.test(t)) return true;
  return false;
}

function inferExplanation(prev: RawMathStep | undefined, curr: RawMathStep): string | null {
  const p = normEq(prev?.equation ?? '');
  const c = normEq(curr.equation);

  const prevCv = parseCoeffVar(p);
  const currFrac = parseVarFraction(c);
  if (prevCv && currFrac && prevCv.variable === currFrac.variable && prevCv.coeff > 1) {
    return `Divide both sides by ${prevCv.coeff} to isolate $${currFrac.variable}$.`;
  }

  const prevFrac = parseVarFraction(p);
  const currFrac2 = parseVarFraction(c);
  if (prevFrac && currFrac2 && prevFrac.variable === currFrac2.variable) {
    const g = gcd(prevFrac.num, prevFrac.den);
    if (g > 1 && prevFrac.num / g === currFrac2.num && prevFrac.den / g === currFrac2.den) {
      return `Simplify $\\frac{${prevFrac.num}}{${prevFrac.den}}$ by dividing numerator and denominator by ${g} (GCD).`;
    }
  }

  // ax + b = c  →  ax = d
  const prevLin = p.match(/^(\d+)?([a-z])([+-]\d+)=(\d+)$/);
  const currLin = c.match(/^(\d+)?([a-z])=(\d+)$/);
  if (prevLin && currLin && prevLin[2] === currLin[2]) {
    const constTerm = prevLin[3];
    const n = constTerm.startsWith('-') ? constTerm.slice(1) : constTerm.slice(1);
    const op = constTerm.startsWith('-') ? `add ${n}` : `subtract ${n}`;
    return `${op.charAt(0).toUpperCase() + op.slice(1)} to both sides to move the constant term.`;
  }

  return null;
}

function enhanceStepExplanation(steps: RawMathStep[], index: number): string {
  const curr = steps[index]!;
  const prev = index > 0 ? steps[index - 1] : undefined;
  const inferred = inferExplanation(prev, curr);

  if (!isVagueExplanation(curr.explanation)) {
    if (inferred && curr.explanation.length < 40) return inferred;
    return curr.explanation;
  }

  if (inferred) return inferred;

  const c = normEq(curr.equation);
  const cv = parseCoeffVar(c);
  if (cv) {
    return `Equation with $${cv.coeff}${cv.variable}$ — isolate $${cv.variable}$ by dividing both sides by ${cv.coeff}.`;
  }
  const vf = parseVarFraction(c);
  if (vf) {
    return `Express $${vf.variable}$ as a fraction; simplify if the top and bottom share a common factor.`;
  }

  return curr.explanation;
}

/**
 * Improve vague LLM step labels and add explicit operations (divide both sides, simplify by GCD, etc.).
 */
export function enhanceRawMathMarkdown(markdown: string | undefined): string | undefined {
  if (!markdown?.trim()) return markdown;

  const { title, steps } = parseRawMathMarkdown(markdown);
  if (steps.length === 0) return markdown;

  const enhanced: RawMathStep[] = steps.map((step, index) => ({
    equation: step.equation,
    explanation: enhanceStepExplanation(steps, index),
  }));

  return stepsToMarkdown(enhanced, title);
}
