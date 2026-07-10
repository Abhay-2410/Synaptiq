/**
 * Smoke test for multi-question Quick Challenge sessions.
 * Run: npx tsx scripts/test-quick-check.ts
 */
import 'dotenv/config';
import {
  createQuickCheckSession,
  evaluateQuickCheckSessionAnswer,
} from '../pipeline/stages/learning.js';
import type { RetrievedChunk } from '../pipeline/types.js';

const sessionId = '00000000-0000-4000-8000-000000000001';

const freedomChunks: RetrievedChunk[] = [
  {
    id: 'hist-1',
    score: 0.9,
    content:
      'Gandhi led mass movements including Non-Cooperation (1920), Civil Disobedience (1930), and Quit India (1942). Satyagraha was his method of non-violent resistance.',
    metadata: {
      subject: 'History',
      subjectKey: 'history',
      topic: 'Freedom Struggle and Mass Movements',
      chapter: 'Nationalism in India',
      classLevel: 10,
    },
  },
];

const mathAnswer = `**Quadratic equation**

### Understanding the problem
The equation $x^2 - 5x + 6 = 0$ is a quadratic in standard form.

### Final answer
$$x = 2 \\quad \\text{or} \\quad x = 3$$`;

async function testHistorySession() {
  console.log('=== History multi-question session ===');
  const challenge = createQuickCheckSession(
    'Explain Gandhi mass movements',
    'Satyagraha was Gandhi method of non-violent resistance...',
    freedomChunks,
    'history',
    10,
    sessionId,
  );
  if (!challenge || challenge.totalQuestions < 3) {
    console.error('FAIL: expected 3+ history questions');
    process.exit(1);
  }

  console.log(`Generated ${challenge.totalQuestions} questions:`);
  for (const q of challenge.questions) {
    console.log(`  [${q.difficulty}] ${q.question.replace(/^Quick check:\s*/i, '')}`);
  }

  const uniqueQuestions = new Set(challenge.questions.map((q) => q.question));
  if (uniqueQuestions.size !== challenge.questions.length) {
    console.error('FAIL: duplicate questions in session');
    process.exit(1);
  }

  const answers = ['Satyagraha', 'Non-Cooperation Movement 1920', 'World War 1', 'protests'];
  let finalResult;
  for (let i = 0; i < challenge.totalQuestions; i++) {
    finalResult = await evaluateQuickCheckSessionAnswer(sessionId, challenge.id, answers[i] ?? 'test');
    console.log(`Q${i + 1} verdict: ${finalResult.verdict} — ${finalResult.feedback.slice(0, 80)}…`);
    console.log(`  progress: ${finalResult.sessionProgress.correctCount}/${finalResult.sessionProgress.answeredCount} correct, index=${finalResult.sessionProgress.questionIndex}`);
  }

  if (!finalResult?.sessionComplete) {
    console.error('FAIL: session should be complete after last question');
    process.exit(1);
  }
  if (!finalResult.finalAnalysis || finalResult.finalAnalysis.length < 40) {
    console.error('FAIL: missing final analysis');
    process.exit(1);
  }
  console.log('Final analysis preview:', finalResult.finalAnalysis.slice(0, 200), '…');
  console.log('PASS: History session\n');
}

async function testMathSession() {
  console.log('=== Math multi-question session ===');
  const challenge = createQuickCheckSession(
    'How do I solve x^2 - 5x + 6 = 0',
    mathAnswer,
    [],
    'math',
    10,
    '00000000-0000-4000-8000-000000000002',
  );
  if (!challenge || challenge.totalQuestions < 3) {
    console.error('FAIL: expected 3+ math questions');
    process.exit(1);
  }

  console.log(`Generated ${challenge.totalQuestions} math questions`);
  const mathAnswers = [
    'D > 0 means two real roots',
    '(x-2)(x-3)',
    'x = 2 or x = 3',
    'set each factor to zero',
  ];

  let finalResult;
  for (let i = 0; i < challenge.totalQuestions; i++) {
    finalResult = await evaluateQuickCheckSessionAnswer(
      '00000000-0000-4000-8000-000000000002',
      challenge.id,
      mathAnswers[i] ?? 'test',
    );
  }

  if (!finalResult?.sessionComplete || !finalResult.finalAnalysis) {
    console.error('FAIL: math session incomplete');
    process.exit(1);
  }
  console.log('PASS: Math session\n');
}

async function main() {
  await testHistorySession();
  await testMathSession();
  console.log('PASS: Multi-question Quick Challenge works end-to-end.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
