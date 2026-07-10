/**
 * Coverage matrix: quick-check generation for all subjects × representative classes.
 * Run: npx tsx scripts/test-coverage-matrix.ts
 */
import 'dotenv/config';
import { ALL_CLASS_11_12_SUBJECTS, STREAM_META, type ClassLevel, type SubjectKey } from '../pipeline/curriculum/catalog.js';
import { buildQuickCheckQuestions } from '../pipeline/stages/quick-check-questions.js';
import { createQuickCheckSession, abandonActiveChallengeSession } from '../pipeline/stages/learning.js';

const JUNIOR_SUBJECTS: SubjectKey[] = ['math', 'science', 'english', 'social'];
const SAMPLE_DOUBTS: Partial<Record<SubjectKey, string>> = {
  math: 'How do I solve x^2 - 5x + 6 = 0',
  science: 'Explain photosynthesis in plants',
  english: 'Change to reported speech: He said, "I am happy."',
  social: 'Explain Gandhi mass movements in freedom struggle',
  physics: 'Explain Coulomb law and electric charge',
  chemistry: 'What happens when acid reacts with base',
  biology: 'Explain mitosis and cell division',
  accountancy: 'Explain the accounting equation and journal entries',
  business: 'What are the functions of management',
  economics: 'Explain the law of demand',
  history: 'Explain Gandhi role in freedom struggle',
  political_science: 'Explain federalism and division of power in India',
};

let failed = 0;

function testSubject(classLevel: ClassLevel, subjectId: SubjectKey) {
  const doubt = SAMPLE_DOUBTS[subjectId] ?? `Explain a key concept in ${subjectId}`;
  const questions = buildQuickCheckQuestions(doubt, 'A'.repeat(120), [], subjectId, classLevel);

  if (questions.length < 3) {
    console.error(`FAIL: ${subjectId} class ${classLevel} — only ${questions.length} questions`);
    failed++;
    return;
  }

  const unique = new Set(questions.map((q) => q.question));
  if (unique.size !== questions.length) {
    console.error(`FAIL: ${subjectId} class ${classLevel} — duplicate questions`);
    failed++;
    return;
  }

  if (questions.some((q) => q.question.includes('political_science') || q.question.includes('accountancy'))) {
    console.error(`FAIL: ${subjectId} class ${classLevel} — raw subject key in question text`);
    failed++;
    return;
  }

  const session = createQuickCheckSession(doubt, 'A'.repeat(120), [], subjectId, classLevel);
  if (!session || session.totalQuestions < 3) {
    console.error(`FAIL: ${subjectId} class ${classLevel} — session not created`);
    failed++;
    return;
  }
}

console.log('=== Classes 6–10 ===');
for (const cls of [6, 8, 10] as ClassLevel[]) {
  for (const subject of JUNIOR_SUBJECTS) {
    testSubject(cls, subject);
  }
}

console.log('=== Class 11–12 (all NCERT subjects) ===');
for (const subject of ALL_CLASS_11_12_SUBJECTS) {
  testSubject(12, subject);
}

console.log('=== Stream subject sets ===');
for (const stream of Object.keys(STREAM_META) as (keyof typeof STREAM_META)[]) {
  for (const subject of STREAM_META[stream].subjects) {
    testSubject(11, subject);
  }
}

const sid = '00000000-0000-4000-8000-000000099999';
abandonActiveChallengeSession(sid);
const s1 = createQuickCheckSession('test', 'A'.repeat(120), [], 'math', 10, sid);
const s2 = createQuickCheckSession('test2', 'A'.repeat(120), [], 'history', 10, sid);
if (!s1 || !s2 || s1.id === s2.id) {
  console.error('FAIL: abandon + new session');
  failed++;
}

if (failed > 0) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}

console.log('\nPASS: Coverage matrix — all subjects/classes produce valid quick-check sessions.');
