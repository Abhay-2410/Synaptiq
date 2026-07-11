/**
 * Smoke test: STEM doubts must show real worked algebra, not generic templates.
 * Run: npx tsx scripts/test-stem-solve.ts
 */
import 'dotenv/config';
import { trySolveStemProblem } from '../pipeline/stages/stem-solve.js';
import { isDeadEndAnswer } from '../pipeline/stages/tutor-knowledge.js';
import type { DoubtRequest } from '../pipeline/types.js';

const cases: Array<{ label: string; doubt: DoubtRequest; mustInclude: string[] }> = [
  {
    label: 'Quadratic — "How do I solve" prefix (must not match linear)',
    doubt: {
      text: 'How do I solve x² − 5x + 6 = 0',
      subjectId: 'math',
      classLevel: 10,
    },
    mustInclude: ['x = 2', 'x = 3', 'Quadratic'],
  },
  {
    label: 'Quadratic — unicode minus',
    doubt: {
      text: 'How do I solve x² − 5x + 6 = 0',
      subjectId: 'math',
      classLevel: 10,
    },
    mustInclude: ['x = 2', 'x = 3', '(x', 'factor'],
  },
  {
    label: 'Physics — Ohm\'s law numerical',
    doubt: {
      text: "State Ohm's law and solve: R = 10 Ω, V = 5 V — find I.",
      subjectId: 'physics',
      classLevel: 10,
    },
    mustInclude: ['0.5', 'V = IR', 'I =', 'A'],
  },
  {
    label: 'Physics — F=ma numerical',
    doubt: {
      text: 'A body of mass 2 kg is subjected to a force of 10 N. Find acceleration.',
      subjectId: 'physics',
      classLevel: 11,
    },
    mustInclude: ['5', 'm/s', 'F = ma', '10', '2'],
  },
  {
    label: 'Class 8 — fraction arithmetic',
    doubt: {
      text: 'Simplify 3/4 + 1/2',
      subjectId: 'math',
      classLevel: 8,
    },
    mustInclude: ['frac{5}{4}', 'frac{3}{4}'],
  },
  {
    label: 'Class 10 — pair of linear equations',
    doubt: {
      text: 'Solve 2x + 3y = 12 and x - y = 1',
      subjectId: 'math',
      classLevel: 10,
    },
    mustInclude: ['x = 3', 'y = 2', 'Divide both sides'],
  },
];

let failed = 0;

for (const { label, doubt, mustInclude } of cases) {
  const result = trySolveStemProblem(doubt);
  console.log(`\n=== ${label} ===`);

  if (!result) {
    console.error('FAIL: no solution returned');
    failed++;
    continue;
  }

  const combined = `${result.answer}\n${result.rawMathExplanation ?? ''}`;
  console.log('model path: stem-solver');
  console.log('preview:', result.answer.slice(0, 220).replace(/\n/g, ' ') + '…');

  if (isDeadEndAnswer(combined)) {
    console.error('FAIL: dead-end or generic template detected');
    failed++;
    continue;
  }

  if (/identify what is given/i.test(combined) && !/\d/.test(combined.slice(0, 200))) {
    console.error('FAIL: generic template without numbers');
    failed++;
    continue;
  }

  if (result.answer.includes('**Step 1:**') || result.answer.includes('### Step-by-step working')) {
    console.error('FAIL: main answer should be narrative only, not duplicate steps');
    failed++;
    continue;
  }

  if (!result.rawMathExplanation?.includes('**1.**')) {
    console.error('FAIL: raw math panel missing numbered steps');
    failed++;
    continue;
  }

  for (const needle of mustInclude) {
    if (!combined.toLowerCase().includes(needle.toLowerCase())) {
      console.error(`FAIL: missing "${needle}"`);
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}

console.log('\nPASS: STEM solver returns real worked solutions.');
