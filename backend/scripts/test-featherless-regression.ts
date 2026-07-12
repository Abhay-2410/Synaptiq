/**
 * Full regression suite after Featherless provider swap.
 * Run: npx tsx scripts/test-featherless-regression.ts
 */
import '../load-env.js';
import { checkLlmProviderAtStartup, isLlmReachable, isLlmProviderConfigured } from '../agents/llm-provider.js';
import { runDoubtPipeline } from '../pipeline/index.js';
import { trySolveStemProblem } from '../pipeline/stages/stem-solve.js';
import { isDeadEndAnswer } from '../pipeline/stages/tutor-knowledge.js';
import { evaluateWithLlm } from '../pipeline/stages/quick-check-eval.js';
import {
  createQuickCheckSession,
  evaluateQuickCheckSessionAnswer,
} from '../pipeline/stages/learning.js';
import type { QuickCheck, RetrievedChunk } from '../pipeline/types.js';

interface TestResult {
  name: string;
  pass: boolean;
  ms: number;
  detail: string;
}

const results: TestResult[] = [];

function record(name: string, pass: boolean, ms: number, detail: string) {
  results.push({ name, pass, ms, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name} (${ms}ms)`);
  console.log(`  ${detail}\n`);
}

await checkLlmProviderAtStartup();
if (!isLlmProviderConfigured() || isLlmReachable() === false) {
  console.error('ABORT: Featherless LLM not configured or unreachable');
  process.exit(1);
}

// 1. Quadratic STEM
{
  const start = Date.now();
  const quad = trySolveStemProblem({
    text: 'How do I solve x^2 - 5x + 6 = 0',
    subjectId: 'math',
    classLevel: 10,
  });
  const pass =
    Boolean(quad?.answer) &&
    !isDeadEndAnswer(quad!.answer) &&
    (/x\s*=\s*2/.test(quad!.answer) || /\(x\s*[-−]\s*2\)/.test(quad!.answer)) &&
    (/x\s*=\s*3/.test(quad!.answer) || /\(x\s*[-−]\s*3\)/.test(quad!.answer));
  record(
    '1. Quadratic STEM worked steps',
    pass,
    Date.now() - start,
    pass ? 'Factorisation steps present' : 'Missing worked factorisation',
  );
}

// 2. History nationalism via full LLM pipeline
{
  const start = Date.now();
  const result = await runDoubtPipeline(
    {
      text: 'Explain nationalism in India',
      boardId: 'cbse',
      subjectId: 'social',
      classLevel: 10,
    },
    { requestId: 'regression-history', emit: () => {}, streamTokens: false },
  );
  const answer = result.draft.answer;
  const pass =
    !isDeadEndAnswer(answer) &&
    /national/i.test(answer) &&
    !/Let's explore|no material was found/i.test(answer) &&
    result.retrievedChunks.length > 0;
  record(
    '2. History nationalism narrative',
    pass,
    Date.now() - start,
    `chunks=${result.retrievedChunks.length} model=${result.draft.model} len=${answer.length}`,
  );
}

// 3. Quick Challenge calibration (3 cases)
{
  const base = (question: string, expectedAnswer: string): QuickCheck => ({
    id: 'regression-qc',
    index: 0,
    topic: 'Quadratic',
    subjectId: 'math',
    classLevel: 10,
    question,
    expectedAnswer,
    evaluationRubric: 'Score reasoning quality, not keywords.',
  });

  const cases = [
    {
      label: '70–80%',
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
      label: '85–90%',
      quickCheck: base(
        'Quick check: After factorising (x − 2)(x − 3) = 0, how do you find the values of x?',
        'Accept: zero product property; x = 2 or x = 3.',
      ),
      answer: 'Set x − 2 = 0 so x = 2, and set x − 3 = 0 so x = 3. Those are the two solutions.',
      min: 80,
      max: 95,
    },
    {
      label: '15–25%',
      quickCheck: base(
        'Quick check: Factor x² − 5x + 6 completely.',
        'Accept: algebraic factorisation.',
      ),
      answer: 'I substitute different numbers and adjust until it balances, then I get (x − 2)(x − 3).',
      min: 10,
      max: 35,
    },
  ];

  const start = Date.now();
  const scores: string[] = [];
  let pass = true;
  for (const c of cases) {
    const r = await evaluateWithLlm(c.quickCheck, c.answer);
    const ok = r.score >= c.min && r.score <= c.max;
    scores.push(`${c.label}=${r.score}%`);
    if (!ok) pass = false;
  }
  record(
    '3. Quick Challenge calibration (3 cases)',
    pass,
    Date.now() - start,
    scores.join(', '),
  );
}

// 4. Full end-to-end: doubt → Quick Challenge → analysis
{
  const start = Date.now();
  const sessionId = '00000000-0000-4000-8000-000000000099';
  const chunks: RetrievedChunk[] = [
    {
      id: 'hist-regression',
      score: 0.9,
      content: 'Nationalism in India grew through mass movements, unity against colonial rule, and cultural revival.',
      metadata: {
        subjectKey: 'social',
        topic: 'Nationalism in India',
        classLevel: 10,
      },
    },
  ];

  const pipeline = await runDoubtPipeline(
    {
      text: 'Explain nationalism in India',
      boardId: 'cbse',
      subjectId: 'social',
      classLevel: 10,
      sessionId,
    },
    { requestId: 'regression-e2e', emit: () => {}, streamTokens: false },
  );

  const challenge = createQuickCheckSession(
    'Explain nationalism in India',
    pipeline.draft.answer.slice(0, 500),
    chunks,
    'social',
    10,
    sessionId,
  );

  let finalResult;
  let hang = false;
  if (!challenge || challenge.totalQuestions < 1) {
    hang = true;
  } else {
    for (let i = 0; i < challenge.totalQuestions; i++) {
      finalResult = await evaluateQuickCheckSessionAnswer(
        sessionId,
        challenge.id,
        i === 0 ? 'Nationalism united Indians against British rule' : 'Mass movements spread nationalist ideas',
      );
    }
  }

  const pass =
    !hang &&
    Boolean(pipeline.draft.answer) &&
    Boolean(finalResult?.sessionComplete) &&
    Boolean(finalResult?.finalAnalysis && finalResult.finalAnalysis.length > 20);

  record(
    '4. End-to-end doubt → Quick Challenge → analysis',
    pass,
    Date.now() - start,
    hang
      ? 'Quick Challenge session failed to start'
      : `questions=${challenge?.totalQuestions} complete=${finalResult?.sessionComplete}`,
  );
}

// 5. Enkrypt verification on pipeline response
{
  const start = Date.now();
  const result = await runDoubtPipeline(
    {
      text: 'What is photosynthesis?',
      boardId: 'cbse',
      subjectId: 'science',
      classLevel: 8,
    },
    { requestId: 'regression-enkrypt', emit: () => {}, streamTokens: false },
  );

  const v = result.verification;
  const pass =
    Boolean(v) &&
    v.usedStub === false &&
    Boolean(v.checks?.hallucination) &&
    Boolean(v.checks?.adherence) &&
    Boolean(v.checks?.safety) &&
    Boolean(v.checks?.relevancy) &&
    result.agentTrail.some((s) => s.id === 'verification');

  record(
    '5. Enkrypt verification fires on every response',
    pass,
    Date.now() - start,
    `status=${v.status} stub=${v.usedStub} trail=${result.agentTrail.some((s) => s.id === 'verification')}`,
  );
}

console.log('═══ Regression Summary ═══');
let allPass = true;
for (const r of results) {
  console.log(`  ${r.pass ? '✓' : '✗'} ${r.name} — ${r.ms}ms`);
  if (!r.pass) allPass = false;
}

if (!allPass) {
  console.error('\nREGRESSION FAILED — consider rolling back to Groq');
  process.exit(1);
}

console.log('\nALL 5 REGRESSION TESTS PASSED');
