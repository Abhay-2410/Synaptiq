import { tryCuratedConceptAnswer } from '../pipeline/stages/tutor-knowledge.js';
import { tryFollowUpAnswer } from '../pipeline/stages/follow-up-answer.js';

const work = tryCuratedConceptAnswer({
  text: 'What is the difference between work and energy?',
  subjectId: 'physics',
  classLevel: 9,
});
const workOk = Boolean(work?.includes('### Work') && work?.includes('Key differences'));
console.log(workOk ? 'PASS work/energy structured' : 'FAIL work/energy');
if (!workOk) process.exit(1);

const follow = tryFollowUpAnswer({
  text: 'give me some examples for the above questions',
  subjectId: 'science',
  classLevel: 9,
  priorMessages: [
    {
      role: 'assistant',
      content: `Here are **2 important exam questions** for **Class 9 Science (CBSE)** on **Motion**:

#### Question 1 · 3 marks

Define speed and calculate speed when distance is 120 m and time is 30 s.

#### Question 2 · 3 marks

Explain the difference between speed and velocity with an example.

*Try answering on your own first.*`,
    },
  ],
});
const followOk = Boolean(follow?.answer.includes('Example for Question 1'));
console.log(followOk ? 'PASS follow-up per-question examples' : 'FAIL follow-up');
if (!followOk) process.exit(1);
