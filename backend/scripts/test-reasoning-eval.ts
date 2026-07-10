/**
 * Part 2 calibration tests — reasoning-based partial credit scorer.
 * Run: npx tsx scripts/test-reasoning-eval.ts
 */
import 'dotenv/config';
import { evaluateWithHeuristics, evaluateWithLlm } from '../pipeline/stages/quick-check-eval.js';
import type { QuickCheck } from '../pipeline/types.js';

const base = (question: string, expectedAnswer: string): QuickCheck => ({
  id: 'test',
  index: 0,
  topic: 'Quadratic equations',
  subjectId: 'math',
  classLevel: 10,
  question,
  expectedAnswer,
  evaluationRubric: 'Judge reasoning quality and method, not keyword overlap.',
});

const CASES = [
  {
    label: 'Case 1 — correct factors, flawed sign reasoning (expect ~70–80%)',
    quickCheck: base(
      'Quick check: Factor x² − 5x + 6 completely.',
      'Accept: (x − 2)(x − 3). Numbers multiply to +6 and add to −5: −2 and −3.',
    ),
    answer:
      'I need two numbers that multiply to give 6 and sum to 5. Those numbers are 2 and 3, so x² − 5x + 6 factors as (x − 2)(x − 3)',
    min: 70,
    max: 82,
  },
  {
    label: 'Case 2 — correct roots/steps, no zero product property (expect ~85–90%)',
    quickCheck: base(
      'Quick check: After factorising (x − 2)(x − 3) = 0, how do you find the values of x?',
      'Accept: zero product property — set each factor to zero; x = 2 or x = 3.',
    ),
    answer:
      'Set x − 2 = 0 so x = 2, and set x − 3 = 0 so x = 3. Those are the two solutions.',
    min: 85,
    max: 92,
  },
  {
    label: 'Case 3 — trial-and-error method (expect ~15–25%)',
    quickCheck: base(
      'Quick check: Factor x² − 5x + 6 completely.',
      'Accept: factor by finding two numbers that multiply to 6 and add to −5.',
    ),
    answer:
      'I substitute different numbers and adjust until it balances, then I get (x − 2)(x − 3).',
    min: 15,
    max: 30,
  },
];

function inRange(score: number, min: number, max: number): boolean {
  return score >= min && score <= max;
}

async function main() {
  console.log('=== Reasoning evaluator — heuristic path (deterministic calibration) ===\n');
  let failed = 0;

  for (const c of CASES) {
    const result = evaluateWithHeuristics(c.quickCheck, c.answer);
    const ok = inRange(result.score, c.min, c.max);
    console.log(c.label);
    console.log(`  score: ${result.score}% | verdict: ${result.verdict} | usedLlm: ${result.usedLlm}`);
    console.log(`  expected range: ${c.min}–${c.max}% | ${ok ? 'PASS' : 'FAIL'}`);
    console.log(`  feedback: ${result.feedback}`);
    console.log('');
    if (!ok) failed++;
  }

  if (process.env.QUICK_CHECK_USE_LLM !== 'false') {
    console.log('=== Reasoning evaluator — LLM path (if configured) ===\n');
    for (const c of CASES) {
      try {
        const result = await evaluateWithLlm(c.quickCheck, c.answer);
        console.log(c.label);
        console.log(`  score: ${result.score}% | verdict: ${result.verdict} | usedLlm: ${result.usedLlm}`);
        console.log(`  feedback: ${result.feedback.slice(0, 160)}…`);
        console.log('');
      } catch (err) {
        console.log(`  LLM skipped: ${err instanceof Error ? err.message : err}\n`);
      }
    }
  }

  if (failed > 0) {
    console.error(`${failed} calibration case(s) out of range`);
    process.exit(1);
  }
  console.log('PASS: All three calibration scenarios score in the expected ranges.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
