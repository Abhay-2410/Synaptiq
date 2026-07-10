/**
 * Smoke test: retrieval miss must never dead-end; tutor always answers.
 * Run: npx tsx scripts/test-retrieval-fallback.ts
 */
import 'dotenv/config';
import { composeLocalDraft } from '../pipeline/stages/local-tutor.js';
import { isDeadEndAnswer } from '../pipeline/stages/tutor-knowledge.js';
import { createQuickCheckSession, shouldOfferQuickCheck } from '../pipeline/stages/learning.js';
import type { DoubtRequest } from '../pipeline/types.js';

const cases: Array<{ label: string; doubt: DoubtRequest }> = [
  {
    label: 'Class 10 English — reported speech (failing case)',
    doubt: {
      text: 'What is reported speech?',
      subjectId: 'english',
      classLevel: 10,
    },
  },
  {
    label: 'Class 7 Science — photosynthesis (unseeded topic)',
    doubt: {
      text: 'What is photosynthesis?',
      subjectId: 'science',
      classLevel: 7,
    },
  },
  {
    label: 'Class 6 Math — fractions',
    doubt: {
      text: 'How do fractions work?',
      subjectId: 'math',
      classLevel: 6,
    },
  },
  {
    label: 'Class 9 Social — democracy',
    doubt: {
      text: 'What is democracy?',
      subjectId: 'social',
      classLevel: 9,
    },
  },
];

let failed = 0;

for (const { label, doubt } of cases) {
  const { answer } = composeLocalDraft(doubt, []);
  const dead = isDeadEndAnswer(answer);
  const ok = !dead && answer.length > 100;
  const quickCheckSession = ok
    ? createQuickCheckSession(doubt.text, answer, [], doubt.subjectId ?? 'math', doubt.classLevel)
    : null;

  console.log(`\n=== ${label} ===`);
  console.log('dead-end:', dead, '| answerLen:', answer.length);
  console.log('preview:', answer.slice(0, 180).replace(/\n/g, ' ') + '…');
  console.log('quick check:', quickCheckSession?.questions[0]?.question ?? '(none)');

  if (!ok) {
    console.error('FAIL:', label);
    failed++;
    continue;
  }
  if (!shouldOfferQuickCheck(answer, 'verified')) {
    console.error('FAIL: shouldOfferQuickCheck false for', label);
    failed++;
    continue;
  }
  if (!quickCheckSession) {
    console.error('FAIL: no quick check for', label);
    failed++;
    continue;
  }
  if (doubt.subjectId === 'english' && doubt.text.includes('reported speech')) {
    const allQs = quickCheckSession.questions.map((q) => q.question).join(' ');
    if (!/reported speech/i.test(allQs + quickCheckSession.topic)) {
      console.error('FAIL: English quick check not about reported speech');
      failed++;
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}

console.log('\nPASS: All retrieval-fallback cases answered without dead-ends.');
