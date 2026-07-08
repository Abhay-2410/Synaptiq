import { Router } from 'express';
import { z } from 'zod';
import type { QuickCheck } from '../../pipeline/types.js';
import { evaluateQuickCheck } from '../../pipeline/stages/learning.js';

const quickCheckSchema = z.object({
  sessionId: z.string().uuid(),
  quickCheck: z.object({
    topic: z.string().min(1),
    subjectId: z.enum([
      'math',
      'science',
      'english',
      'social',
      'physics',
      'chemistry',
      'biology',
      'accountancy',
      'business',
      'economics',
      'history',
      'political_science',
    ]),
    question: z.string().min(1),
    expectedKeywords: z.array(z.string()).min(1),
  }),
  answer: z.string().min(1, 'answer is required'),
});

export const learnRouter = Router();

learnRouter.post('/check', (req, res) => {
  const parsed = quickCheckSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid check payload', details: parsed.error.flatten() });
  }

  const { sessionId, quickCheck, answer } = parsed.data;
  const result = evaluateQuickCheck(sessionId, quickCheck as QuickCheck, answer);
  return res.json(result);
});
