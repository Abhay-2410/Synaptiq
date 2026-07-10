/**
 * Unit tests for math step clarity enhancements.
 * Run: npx tsx scripts/test-enhance-math-steps.ts
 */
import { enhanceRawMathMarkdown } from '../pipeline/stages/raw-math/enhance-steps.js';
import { buildLinearSystemWorked, parseLinearSystem } from '../pipeline/stages/raw-math/linear-system.js';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}

const vague = enhanceRawMathMarkdown(`### Step-by-step working

**1.** \`$3y = \\frac{39}{7}$\`
*Simplifying*

**2.** \`$y = \\frac{39}{21}$\`
*Solving for y*

**3.** \`$y = \\frac{13}{7}$\`
*Simplifying the fraction*
`);

assert(Boolean(vague?.includes('Divide both sides by 3')), 'step 2 should mention divide by 3');
assert(Boolean(vague?.includes('GCD')), 'step 3 should mention GCD simplification');
assert(!vague?.includes('*Simplifying*'), 'vague label should be replaced');

const system = parseLinearSystem('Solve 2x + 3y = 12 and x - y = 1');
assert(system != null, 'should parse linear system');

const steps = buildLinearSystemWorked(system![0], system![1]);
assert(steps != null && steps.length >= 6, 'should build system steps');
assert(
  steps!.some((s) => /Divide both sides/i.test(s.explanation)),
  'system steps should include divide both sides',
);

console.log('PASS: enhance-math-steps');
