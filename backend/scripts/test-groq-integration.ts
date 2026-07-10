/**
 * Groq integration smoke test — tutor paths + reasoning evaluator calibration.
 * Run: npx tsx scripts/test-groq-integration.ts
 */
import 'dotenv/config';
import { checkLlmProviderAtStartup, isGroqReachable, isLlmProviderConfigured } from '../agents/llm-provider.js';
import { trySolveStemProblem } from '../pipeline/stages/stem-solve.js';
import { buildKnowledgeAnswer } from '../pipeline/stages/tutor-knowledge.js';
import { detectIntent } from '../pipeline/stages/local-tutor.js';
import { evaluateWithLlm } from '../pipeline/stages/quick-check-eval.js';
import { isDeadEndAnswer } from '../pipeline/stages/tutor-knowledge.js';
import type { QuickCheck } from '../pipeline/types.js';

await checkLlmProviderAtStartup();

if (!isLlmProviderConfigured()) {
  console.error('FAIL: GROQ_API_KEY not configured');
  process.exit(1);
}
if (isGroqReachable() === false) {
  console.error('FAIL: Groq not reachable at startup');
  process.exit(1);
}

console.log('\n=== Part 1: Answer quality (local + STEM paths) ===\n');

const quad = trySolveStemProblem({
  text: 'How do I solve x^2 - 5x + 6 = 0',
  subjectId: 'math',
  classLevel: 10,
});
if (!quad?.answer || isDeadEndAnswer(quad.answer)) {
  console.error('FAIL: quadratic STEM answer');
  process.exit(1);
}
console.log('PASS Math quadratic — STEM solver');
console.log(`  preview: ${quad.answer.slice(0, 120).replace(/\n/g, ' ')}…\n`);

const history = buildKnowledgeAnswer(
  { text: 'Explain Gandhi mass movements in the freedom struggle', subjectId: 'history', classLevel: 10 },
  'social-studies',
  detectIntent('Explain Gandhi mass movements'),
);
if (isDeadEndAnswer(history) || !/Gandhi|satyagraha|movement/i.test(history)) {
  console.error('FAIL: history narrative');
  process.exit(1);
}
console.log('PASS History nationalism — narrative knowledge path');
console.log(`  preview: ${history.slice(0, 120).replace(/\n/g, ' ')}…\n`);

const base = (question: string, expectedAnswer: string): QuickCheck => ({
  id: 'groq-test',
  index: 0,
  topic: 'Quadratic',
  subjectId: 'math',
  classLevel: 10,
  question,
  expectedAnswer,
  evaluationRubric: 'Score reasoning quality, not keywords.',
});

const CALIBRATION = [
  {
    label: 'Case 1 (expect ~70–82%)',
    quickCheck: base(
      'Quick check: Factor x² − 5x + 6 completely.',
      'Accept: (x − 2)(x − 3); numbers multiply to +6 and add to −5.',
    ),
    answer:
      'I need two numbers that multiply to give 6 and sum to 5. Those numbers are 2 and 3, so x² − 5x + 6 factors as (x − 2)(x − 3)',
    min: 65,
    max: 85,
  },
  {
    label: 'Case 2 (expect ~85–92%)',
    quickCheck: base(
      'Quick check: After factorising (x − 2)(x − 3) = 0, how do you find the values of x?',
      'Accept: zero product property; x = 2 or x = 3.',
    ),
    answer: 'Set x − 2 = 0 so x = 2, and set x − 3 = 0 so x = 3. Those are the two solutions.',
    min: 80,
    max: 95,
  },
  {
    label: 'Case 3 (expect ~15–30%)',
    quickCheck: base(
      'Quick check: Factor x² − 5x + 6 completely.',
      'Accept: algebraic factorisation.',
    ),
    answer: 'I substitute different numbers and adjust until it balances, then I get (x − 2)(x − 3).',
    min: 10,
    max: 35,
  },
];

console.log('=== Part 2: Quick Challenge evaluator via Groq ===\n');
let failed = 0;

for (const c of CALIBRATION) {
  const start = Date.now();
  const result = await evaluateWithLlm(c.quickCheck, c.answer);
  const ms = Date.now() - start;
  const ok = result.score >= c.min && result.score <= c.max;
  console.log(c.label);
  console.log(`  score: ${result.score}% | verdict: ${result.verdict} | ${ms}ms | usedLlm: ${result.usedLlm}`);
  console.log(`  range: ${c.min}–${c.max}% | ${ok ? 'PASS' : 'FAIL'}`);
  console.log(`  feedback: ${result.feedback.slice(0, 200)}${result.feedback.length > 200 ? '…' : ''}`);
  console.log('');
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`${failed} calibration case(s) out of range on Groq`);
  process.exit(1);
}

console.log('PASS: Groq integration — answers + reasoning evaluator calibration OK.');
