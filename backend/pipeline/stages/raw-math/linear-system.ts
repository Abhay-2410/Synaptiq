import type { RawMathStep } from './quadratic.js';
import { normalizeMathInput } from '../stem-solve.js';

export interface LinearEq2v {
  a: number;
  b: number;
  c: number;
}

function fmtCoeff(n: number, variable: string): string {
  if (n === 0) return '';
  const abs = Math.abs(n);
  const sign = n >= 0 ? '+ ' : '- ';
  if (abs === 1) return `${sign}${variable}`;
  return `${sign}${abs}${variable}`;
}

function fmtEq(eq: LinearEq2v): string {
  const ax = eq.a === 1 ? 'x' : eq.a === -1 ? '-x' : `${eq.a}x`;
  const by = fmtCoeff(eq.b, 'y');
  return `$${`${ax} ${by}`.trim()} = ${eq.c}$`;
}

function fracLatex(num: number, den: number): string {
  if (den === 1) return `$${num}$`;
  return `$\\frac{${num}}{${den}}$`;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

function simplifyFraction(num: number, den: number): { num: number; den: number; factor: number } {
  const g = gcd(num, den);
  const sign = den < 0 ? -1 : 1;
  return { num: (num / g) * sign, den: Math.abs(den) / g, factor: g };
}

function parseLinearEq2v(segment: string): LinearEq2v | null {
  const q = normalizeMathInput(segment).replace(/^solve\s+/i, '');

  let m = q.match(/([+-]?\d+)\s*x\s*([+-])\s*(\d+)\s*y\s*=\s*([+-]?\d+)/i);
  if (m) {
    return {
      a: Number(m[1]),
      b: m[2] === '-' ? -Number(m[3]) : Number(m[3]),
      c: Number(m[4]),
    };
  }

  m = q.match(/x\s*([+-])\s*(\d+)\s*y\s*=\s*([+-]?\d+)/i);
  if (m) {
    return { a: 1, b: m[1] === '-' ? -Number(m[2]) : Number(m[2]), c: Number(m[3]) };
  }

  m = q.match(/x\s*([+-])\s*y\s*=\s*([+-]?\d+)/i);
  if (m) {
    return { a: 1, b: m[1] === '-' ? -1 : 1, c: Number(m[2]) };
  }

  m = q.match(/([+-]?\d+)\s*x\s*([+-])\s*y\s*=\s*([+-]?\d+)/i);
  if (m) {
    return { a: Number(m[1]), b: m[2] === '-' ? -1 : 1, c: Number(m[3]) };
  }

  return null;
}

/** Parse two linear equations in x and y from a student question. */
export function parseLinearSystem(question: string): [LinearEq2v, LinearEq2v] | null {
  const chunks = question
    .split(/\band\b|,|;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const fromChunks = chunks.map(parseLinearEq2v).filter((e): e is LinearEq2v => e != null);
  if (fromChunks.length >= 2) return [fromChunks[0], fromChunks[1]];

  const globalRe = /([+-]?\d+\s*x\s*[+-]\s*\d+\s*y\s*=\s*[+-]?\d+|x\s*[+-]\s*\d+\s*y\s*=\s*[+-]?\d+)/gi;
  const matches = [...question.matchAll(globalRe)]
    .map((m) => parseLinearEq2v(m[0]))
    .filter((e): e is LinearEq2v => e != null);
  if (matches.length >= 2) return [matches[0], matches[1]];

  return null;
}

function pushIsolateVariable(
  steps: RawMathStep[],
  coeff: number,
  variable: 'x' | 'y',
  rhsNum: number,
  rhsDen: number,
  skipInitial = false,
): { num: number; den: number } {
  const absCoeff = Math.abs(coeff);
  const lhs =
    absCoeff === 1
      ? coeff < 0
        ? `-${variable}`
        : variable
      : coeff < 0
        ? `-${absCoeff}${variable}`
        : `${absCoeff}${variable}`;

  if (!skipInitial) {
    steps.push({
      equation: `$${lhs} = ${fracLatex(rhsNum, rhsDen).replace(/\$/g, '')}$`,
      explanation: `The $${variable}$ term is now alone on the left-hand side.`,
    });
  }

  const divided = simplifyFraction(rhsNum, rhsDen * coeff);

  if (absCoeff !== 1) {
    steps.push({
      equation: `$${variable} = ${fracLatex(divided.num, divided.den).replace(/\$/g, '')}$`,
      explanation: `Divide both sides by ${absCoeff} to isolate $${variable}$.`,
    });
  }

  const g = gcd(Math.abs(divided.num), divided.den);
  if (g > 1 && absCoeff !== 1) {
    const simp = simplifyFraction(divided.num, divided.den);
    if (simp.num !== divided.num || simp.den !== divided.den) {
      steps.push({
        equation: `$${variable} = ${fracLatex(simp.num, simp.den).replace(/\$/g, '')}$`,
        explanation: `Simplify $\\frac{${divided.num}}{${divided.den}}$ by dividing numerator and denominator by ${simp.factor} (GCD).`,
      });
      return { num: simp.num, den: simp.den };
    }
  }

  if (absCoeff === 1 && divided.den !== 1) {
    const simp = simplifyFraction(divided.num, divided.den);
    if (simp.factor > 1) {
      steps.push({
        equation: `$${variable} = ${fracLatex(simp.num, simp.den).replace(/\$/g, '')}$`,
        explanation: `Simplify the fraction by dividing numerator and denominator by ${simp.factor} (GCD).`,
      });
      return { num: simp.num, den: simp.den };
    }
  }

  return { num: divided.num, den: divided.den };
}

/** Elimination method with explicit operation labels for each line. */
export function buildLinearSystemWorked(eq1: LinearEq2v, eq2: LinearEq2v): RawMathStep[] | null {
  const det = eq1.a * eq2.b - eq2.a * eq1.b;
  if (det === 0) return null;

  const steps: RawMathStep[] = [
    { equation: fmtEq(eq1), explanation: 'Equation (1) — first equation in the pair.' },
    { equation: fmtEq(eq2), explanation: 'Equation (2) — second equation in the pair.' },
  ];

  const m1 = eq2.b;
  const m2 = -eq1.b;

  steps.push({
    equation: `Multiply (1) by ${m1}, multiply (2) by ${m2}`,
    explanation: `Scale both equations so the $y$ coefficients cancel when added (${eq1.b}×${m1} + ${eq2.b}×${m2} = 0).`,
  });

  const newA = eq1.a * m1 + eq2.a * m2;
  const newC = eq1.c * m1 + eq2.c * m2;

  steps.push({
    equation: `$${newA}x = ${newC}$`,
    explanation: 'Add the scaled equations — the $y$ terms eliminate, leaving one equation in $x$.',
  });

  const xVal = pushIsolateVariable(steps, newA, 'x', newC, 1, true);

  const yNum = eq1.c * xVal.den - eq1.a * xVal.num;
  const yRhsDen = xVal.den;

  steps.push({
    equation: `Substitute $x = ${fracLatex(xVal.num, xVal.den).replace(/\$/g, '')}$ in equation (1)`,
    explanation: `Replace $x$ in ${fmtEq(eq1)} — simplify to isolate $y$.`,
  });

  const yLhs =
    Math.abs(eq1.b) === 1
      ? eq1.b < 0
        ? '-y'
        : 'y'
      : eq1.b < 0
        ? `-${Math.abs(eq1.b)}y`
        : `${eq1.b}y`;
  steps.push({
    equation: `$${yLhs} = ${yNum}$`,
    explanation: `After substituting $x = ${xVal.num}$, the equation reduces to this line.`,
  });

  const yVal = pushIsolateVariable(steps, eq1.b, 'y', yNum, yRhsDen, true);

  steps.push({
    equation: `Solution: $x = ${fracLatex(xVal.num, xVal.den).replace(/\$/g, '')}$, $y = ${fracLatex(yVal.num, yVal.den).replace(/\$/g, '')}$`,
    explanation: 'Substitute both values into the original equations to verify they satisfy the pair.',
  });

  return steps;
}
