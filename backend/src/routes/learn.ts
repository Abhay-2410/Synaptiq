import { Router } from 'express';
import { z } from 'zod';
import { evaluateQuickCheckSessionAnswer } from '../../pipeline/stages/learning.js';

const checkBodySchema = z.object({
  sessionId: z.string().uuid(),
  challengeSessionId: z.string().uuid(),
  answer: z.string().min(1, 'answer is required'),
});

export const learnRouter = Router();

learnRouter.post('/check', async (req, res) => {
  const parsed = checkBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid check payload', details: parsed.error.flatten() });
  }

  const { sessionId, challengeSessionId, answer } = parsed.data;

  try {
    const result = await evaluateQuickCheckSessionAnswer(sessionId, challengeSessionId, answer);
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Quick check evaluation failed';
    const status =
      message.includes('no longer available') ||
      message.includes('already complete') ||
      message.includes('ended when') ||
      message.includes('abandoned')
        ? 409
        : 500;
    return res.status(status).json({ error: message });
  }
});
