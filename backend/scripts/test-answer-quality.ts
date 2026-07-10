/**
 * Part 1 — answer quality smoke test across subject families and class levels.
 * Run: npx tsx scripts/test-answer-quality.ts
 */
import 'dotenv/config';
import { buildKnowledgeAnswer } from '../pipeline/stages/tutor-knowledge.js';
import { trySolveStemProblem } from '../pipeline/stages/stem-solve.js';
import { isDeadEndAnswer } from '../pipeline/stages/tutor-knowledge.js';
import type { DoubtRequest } from '../pipeline/types.js';
import { resolveAnswerMode } from '../pipeline/stages/chunk-focus.js';
import { detectIntent } from '../pipeline/stages/local-tutor.js';
import { synthesizeTutorAnswer } from '../pipeline/stages/tutor-synthesis.js';
import { isExamQuestionRequest } from '../pipeline/stages/exam-question.js';

const BANNED = [
  /identify what is given/i,
  /apply the correct (method|formula)/i,
  /this step would involve/i,
  /use the appropriate formula without/i,
];

interface Case {
  label: string;
  doubt: DoubtRequest;
  getAnswer: () => string;
  mustContain: RegExp[];
}

function checkAnswer(label: string, answer: string, mustContain: RegExp[]): boolean {
  if (isDeadEndAnswer(answer)) {
    console.error(`FAIL [${label}]: dead-end answer`);
    return false;
  }
  for (const b of BANNED) {
    if (b.test(answer)) {
      console.error(`FAIL [${label}]: banned filler phrase`);
      return false;
    }
  }
  for (const re of mustContain) {
    if (!re.test(answer)) {
      console.error(`FAIL [${label}]: missing ${re}`);
      return false;
    }
  }
  if (label.includes('exam question') && /The big picture|In plain words|Overview/i.test(answer)) {
    console.error(`FAIL [${label}]: looks like an explanation, not a question`);
    return false;
  }
  console.log(`PASS [${label}] (${answer.length} chars)`);
  console.log(`  preview: ${answer.slice(0, 140).replace(/\n/g, ' ')}…\n`);
  return true;
}

const cases: Case[] = [
  {
    label: 'Math C8 — fractions',
    doubt: { text: 'Explain fractions', subjectId: 'math', classLevel: 8 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Explain fractions', subjectId: 'math', classLevel: 8 }, 'math', detectIntent('Explain fractions')),
    mustContain: [/numerator/i, /denominator/i],
  },
  {
    label: 'Math C10 — quadratic STEM',
    doubt: { text: 'How do I solve x^2 - 5x + 6 = 0', subjectId: 'math', classLevel: 10 },
    getAnswer: () => trySolveStemProblem({ text: 'How do I solve x^2 - 5x + 6 = 0', subjectId: 'math', classLevel: 10 })?.answer ?? '',
    mustContain: [/x = 2/i, /x = 3/i, /Understanding/i],
  },
  {
    label: 'History C8 — democracy narrative',
    doubt: { text: 'What is democracy', subjectId: 'social', classLevel: 8 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'What is democracy', subjectId: 'social', classLevel: 8 }, 'social-studies', detectIntent('What is democracy')),
    mustContain: [/election/i, /The big picture/i],
  },
  {
    label: 'History C12 — reported speech via english',
    doubt: { text: 'Explain reported speech', subjectId: 'english', classLevel: 12 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Explain reported speech', subjectId: 'english', classLevel: 12 }, 'english', detectIntent('Explain reported speech')),
    mustContain: [/Correct:/i, /Incorrect/i, /said that she/i],
  },
  {
    label: 'English C7 — grammar examples',
    doubt: { text: 'Change to reported speech', subjectId: 'english', classLevel: 7 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Change to reported speech', subjectId: 'english', classLevel: 7 }, 'english', detectIntent('Change to reported speech')),
    mustContain: [/Correct:/i, /Incorrect/i],
  },
  {
    label: 'Biology C9 — photosynthesis mechanism',
    doubt: { text: 'Explain photosynthesis', subjectId: 'science', classLevel: 9 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Explain photosynthesis', subjectId: 'science', classLevel: 9 }, 'life-science', detectIntent('Explain photosynthesis')),
    mustContain: [/chloroplast|chlorophyll/i, /oxygen|glucose/i, /In plain words/i],
  },
  {
    label: 'Commerce C11 — accounting equation worked',
    doubt: { text: 'Explain the accounting equation', subjectId: 'accountancy', classLevel: 11 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Explain the accounting equation', subjectId: 'accountancy', classLevel: 11 }, 'commerce', detectIntent('Explain the accounting equation')),
    mustContain: [/Assets = Liabilities/i, /₹|Journal|Dr/i],
  },
  {
    label: 'Commerce C12 — law of demand',
    doubt: { text: 'Explain the law of demand', subjectId: 'economics', classLevel: 12 },
    getAnswer: () => buildKnowledgeAnswer({ text: 'Explain the law of demand', subjectId: 'economics', classLevel: 12 }, 'commerce', detectIntent('Explain the law of demand')),
    mustContain: [/price/i, /quantity demanded/i, /Worked example/i],
  },
  {
    label: 'Social C8 — exam question (not explanation)',
    doubt: { text: 'Give me an exam-style question on Class 8 Social.', subjectId: 'social', classLevel: 8 },
    getAnswer: () =>
      synthesizeTutorAnswer({
        doubt: { text: 'Give me an exam-style question on Class 8 Social.', subjectId: 'social', classLevel: 8 },
        context: [
          {
            id: 'c1',
            score: 0.9,
            content:
              'The Indian Constitution came into effect on 26 January 1950. The Preamble declares India a sovereign, socialist, secular, democratic republic.',
            metadata: {
              topic: 'Features and Values of the Constitution',
              chapter: 'The Indian Constitution',
              classLevel: 8,
              subject: 'social',
            },
          },
        ],
        mode: 'social-studies',
        intent: detectIntent('Give me an exam-style question on Class 8 Social.'),
      }),
    mustContain: [/exam-style question/i, /Question 1 ·/i, /Preamble|salient features|Fundamental Rights/i],
  },
  {
    label: 'Social C8 — constitution important questions (user phrasing)',
    doubt: { text: 'get me 2 important that could be asked on constitution.', subjectId: 'social', classLevel: 8 },
    getAnswer: () =>
      synthesizeTutorAnswer({
        doubt: { text: 'get me 2 important that could be asked on constitution.', subjectId: 'social', classLevel: 8 },
        context: [
          {
            id: 'c1',
            score: 0.9,
            content:
              'The Indian Constitution came into effect on 26 January 1950. The Preamble declares India a sovereign, socialist, secular, democratic republic.',
            metadata: {
              topic: 'Features and Values of the Constitution',
              chapter: 'The Indian Constitution',
              classLevel: 8,
              subject: 'social',
            },
          },
        ],
        mode: 'social-studies',
        intent: detectIntent('get me 2 important that could be asked on constitution.'),
      }),
    mustContain: [/Question 1 ·/i, /Question 2 ·/i, /Preamble/i, /Fundamental Rights/i],
  },
  {
    label: 'Math C8 — exam question intent detected',
    doubt: { text: 'Give me a practice question on fractions', subjectId: 'math', classLevel: 8 },
    getAnswer: () =>
      buildKnowledgeAnswer(
        { text: 'Give me a practice question on fractions', subjectId: 'math', classLevel: 8 },
        'math',
        detectIntent('Give me a practice question on fractions'),
      ),
    mustContain: [/exam-style question/i, /2\/3 \+ 5\/6/i],
  },
  {
    label: 'ICSE C8 — History & Civics constitution exam questions',
    doubt: {
      text: 'get me 2 important that could be asked on constitution.',
      subjectId: 'history_civics',
      classLevel: 8,
      boardId: 'icse',
    },
    getAnswer: () =>
      synthesizeTutorAnswer({
        doubt: {
          text: 'get me 2 important that could be asked on constitution.',
          subjectId: 'history_civics',
          classLevel: 8,
          boardId: 'icse',
        },
        context: [
          {
            id: 'icse-c1',
            score: 0.9,
            content:
              'The Indian Constitution came into effect on 26 January 1950. The Preamble declares India a sovereign, socialist, secular, democratic republic.',
            metadata: {
              topic: 'The Indian Constitution',
              chapter: 'History and Civics — The Constitution',
              classLevel: 8,
              subjectKey: 'history_civics',
              board: 'icse',
            },
          },
        ],
        mode: 'social-studies',
        intent: detectIntent('get me 2 important that could be asked on constitution.'),
      }),
    mustContain: [/ICSE/i, /Question 1 ·/i, /Question 2 ·/i, /Preamble|Fundamental Rights/i],
  },
  {
    label: 'ICSE C8 — Geography resources narrative',
    doubt: {
      text: 'Distinguish renewable and non-renewable resources.',
      subjectId: 'geography',
      classLevel: 8,
      boardId: 'icse',
    },
    getAnswer: () =>
      buildKnowledgeAnswer(
        {
          text: 'Distinguish renewable and non-renewable resources.',
          subjectId: 'geography',
          classLevel: 8,
          boardId: 'icse',
        },
        'social-studies',
        detectIntent('Distinguish renewable and non-renewable resources.'),
      ),
    mustContain: [/renewable/i, /non-renewable|nonrenewable/i],
  },
];

let failed = 0;
for (const c of cases) {
  const answer = c.getAnswer();
  if (!answer) {
    console.error(`FAIL [${c.label}]: empty answer`);
    failed++;
    continue;
  }
  void resolveAnswerMode(c.doubt, []);
  if (!checkAnswer(c.label, answer, c.mustContain)) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} failure(s)`);
  process.exit(1);
}
if (!isExamQuestionRequest('Give me an exam-style question on Class 8 Social.')) {
  console.error('FAIL: exam question detector');
  process.exit(1);
}
if (!isExamQuestionRequest('get me 2 important that could be asked on constitution.')) {
  console.error('FAIL: important-questions detector');
  process.exit(1);
}
console.log('PASS: Answer quality checks across subject families and class levels.');
