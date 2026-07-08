import { Router } from 'express';
import { z } from 'zod';
import { runDoubtPipeline } from '../../pipeline/index.js';
import { endSse, initSse, writeSseEvent } from '../lib/sse.js';

const askBodySchema = z.object({
  doubt: z.string().min(1, 'doubt is required'),
  imageUrl: z.string().url().optional(),
  sessionId: z.string().uuid().optional(),
  subjectId: z
    .enum([
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
    ])
    .optional(),
  classLevel: z.number().int().min(6).max(12).default(10),
  streamId: z.enum(['pcm', 'pcb', 'commerce', 'humanities']).optional(),
  stream: z.boolean().optional().default(true),
});

export const askRouter = Router();

/**
 * POST /ask
 * Student submits a doubt (text + optional image reference).
 * Streams pipeline events via SSE when stream=true (default).
 */
askRouter.post('/', async (req, res) => {
  const parsed = askBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { doubt, imageUrl, sessionId, subjectId, classLevel, streamId, stream } = parsed.data;

  if (stream || req.headers.accept === 'text/event-stream') {
    initSse(res);

    try {
      await runDoubtPipeline(
        {
          text: doubt,
          imageUrl,
          sessionId,
          subjectId,
          classLevel: classLevel as any,
          stream: streamId,
        },
        { emit: (event) => writeSseEvent(res, event), streamTokens: true },
      );
      endSse(res);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pipeline failed';
      writeSseEvent(res, { type: 'error', message });
      endSse(res);
    }
    return;
  }

  try {
    const result = await runDoubtPipeline(
      {
        text: doubt,
        imageUrl,
        sessionId,
        subjectId,
        classLevel: classLevel as any,
        stream: streamId,
      },
      { emit: () => {}, streamTokens: false },
    );
    return res.json({
      sessionId: result.sessionId,
      answer: result.verification.answer,
      reasoningSteps: result.verification.reasoningSteps,
      rawMathExplanation: result.draft.rawMathExplanation,
      retrievedChunks: result.retrievedChunks,
      verification: result.verification,
      agentTrail: result.agentTrail,
      quickCheck: result.quickCheck,
      mastery: result.mastery,
      draft: result.draft,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline failed';
    return res.status(500).json({ error: message });
  }
});
