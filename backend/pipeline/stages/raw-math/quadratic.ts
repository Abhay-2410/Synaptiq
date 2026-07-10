export interface RawMathStep {
  equation: string;
  explanation: string;
}

function fmtXCoeff(n: number): string {
  if (n === 0) return '';
  if (n === 1) return '+ x';
  if (n === -1) return '- x';
  if (n > 0) return `+ ${n}x`;
  return `- ${Math.abs(n)}x`;
}

function fmtConst(n: number): string {
  if (n > 0) return `+ ${n}`;
  if (n < 0) return `- ${Math.abs(n)}`;
  return '';
}

/** x² + bx + c with a = 1 */
function fmtQuad(b: number, c: number, split?: { p: number; q: number }): string {
  if (!split) return `x² ${fmtXCoeff(b)} ${fmtConst(c)} = 0`.replace(/\s+/g, ' ').trim();
  const p = split.p;
  const q = split.q;
  return `x² ${fmtXCoeff(p)} ${fmtXCoeff(q)} ${fmtConst(c)} = 0`.replace(/\s+/g, ' ').trim();
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

/**
 * Line-by-line factorization walkthrough (matches chalkboard style).
 * Example: x² - 5x + 6 = 0 → split → group → factor → roots
 */
export function buildQuadraticFactorizationSteps(b: number, c: number): RawMathStep[] | null {
  const split = findSplitFactors(b, c);
  if (!split) return null;

  const { p, q } = split;
  const root1 = -q;
  const root2 = -p;

  const secondGroup =
    q < 0 && c > 0
      ? `- (${Math.abs(q)}x - ${c})`
      : q < 0
        ? `- (${Math.abs(q)}x ${fmtConst(c)})`
        : `( ${fmtXCoeff(q)} ${fmtConst(c)} )`.replace(/\s+/g, ' ').trim();

  const groupLine = `(x² ${fmtXCoeff(p)}) ${secondGroup} = 0`.replace(/\s+/g, ' ').trim();

  const binomial = p < 0 ? `(x - ${Math.abs(p)})` : `(x + ${p})`;
  const factorCoeff = q < 0 ? `- ${Math.abs(q)}` : `+ ${q}`;
  const factorLineClean = `x${binomial} ${factorCoeff}${binomial} = 0`.replace(/\s+/g, ' ').trim();

  const finalFactors = `(x - ${Math.min(root1, root2)})(x - ${Math.max(root1, root2)}) = 0`;

  return [
    {
      equation: fmtQuad(b, c),
      explanation: 'Start with the given quadratic equation in standard form.',
    },
    {
      equation: fmtQuad(b, c, split),
      explanation: `Split the middle term (${b}x) into ${fmtXCoeff(p).replace(/^\+ /, '')} and ${fmtXCoeff(q).replace(/^\+ /, '')} because (${p})×(${q})=${c} and ${p}+(${q})=${b}.`,
    },
    {
      equation: groupLine,
      explanation: 'Group the four terms into two pairs so we can factor each pair separately.',
    },
    {
      equation: factorLineClean,
      explanation: `Factor out the common term ${binomial} from both groups.`,
    },
    {
      equation: finalFactors,
      explanation: 'Combine the shared binomial into a single factored expression.',
    },
    {
      equation: `x = ${root1}, ${root2}`,
      explanation: 'Apply the zero-product property: if AB = 0, then A = 0 or B = 0.',
    },
  ];
}

export function buildQuadraticDefinitionSteps(): RawMathStep[] {
  return [
    {
      equation: 'ax² + bx + c = 0',
      explanation: 'Standard form of a quadratic equation, where a ≠ 0.',
    },
    {
      equation: 'a = coefficient of x²',
      explanation: 'Determines how steep the parabola opens; a > 0 opens upward, a < 0 opens downward.',
    },
    {
      equation: 'b = coefficient of x',
      explanation: 'Appears in the linear term and affects the axis of symmetry.',
    },
    {
      equation: 'c = constant term',
      explanation: 'The y-intercept when the equation is written as y = ax² + bx + c.',
    },
    {
      equation: 'Δ = b² - 4ac',
      explanation: 'Discriminant: Δ > 0 → two real roots, Δ = 0 → one repeated root, Δ < 0 → complex roots.',
    },
    {
      equation: 'x = (-b ± √Δ) / 2a',
      explanation: 'Quadratic formula — gives exact roots for any quadratic.',
    },
  ];
}

export function stepsToMarkdown(steps: RawMathStep[], title = 'Solution'): string {
  const lines = [`### ${title}`, ''];
  for (let i = 0; i < steps.length; i++) {
    const { equation, explanation } = steps[i];
    lines.push(`**${i + 1}.** \`${equation}\``);
    lines.push(`*${explanation}*`);
    lines.push('');
  }
  return lines.join('\n').trim();
}
