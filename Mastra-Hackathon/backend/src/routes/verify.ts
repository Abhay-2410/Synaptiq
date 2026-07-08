import { Router } from 'express';
import { z } from 'zod';
import { runVerification } from '../../pipeline/stages/verify.js';
import type { VerificationInput } from '../../pipeline/types.js';

const verifyBodySchema = z.object({
  doubt: z.string().min(1),
  draft: z.object({
    answer: z.string().min(1),
    reasoningSteps: z.array(
      z.object({
        step: z.number(),
        label: z.string(),
        detail: z.string(),
      }),
    ),
    model: z.string(),
  }),
  retrievedContext: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      content: z.string(),
      metadata: z.object({
        subject: z.string().optional(),
        topic: z.string().optional(),
        source: z.string().optional(),
      }),
    }),
  ),
});

export const verifyRouter = Router();

/**
 * POST /internal/verify
 * Internal pipeline stage endpoint — Tutor output + retrieved context in, verified output out.
 * The main /ask route calls the same stage in-process; this route is for testing and tooling.
 */
verifyRouter.post('/', async (req, res) => {
  const parsed = verifyBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid verification payload', details: parsed.error.flatten() });
  }

  try {
    const input: VerificationInput = parsed.data;
    const result = await runVerification(input);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed';
    return res.status(500).json({ error: message });
  }
});
