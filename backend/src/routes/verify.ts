import { Router } from 'express';
import { z } from 'zod';
import { runVerification } from '../../pipeline/stages/verify.js';
import type { VerificationInput } from '../../pipeline/types.js';

function requireInternalAccess(
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction,
): void {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    next();
    return;
  }
  const provided = req.header('x-internal-secret');
  if (provided !== secret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

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

verifyRouter.use(requireInternalAccess);

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
