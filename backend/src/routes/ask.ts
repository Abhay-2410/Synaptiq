import { randomUUID } from 'node:crypto';
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
      'history_civics',
      'geography',
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
  boardId: z.enum(['cbse', 'icse']).optional().default('cbse'),
  classLevel: z.number().int().min(6).max(12).default(10),
  streamId: z.enum(['pcm', 'pcb', 'commerce', 'humanities']).optional(),
  stream: z.boolean().optional().default(true),
});

const ROUTE_TIMEOUT_MS = Number(process.env.ASK_ROUTE_TIMEOUT_MS) || 45_000;

export const askRouter = Router();

function sendSseError(res: import('express').Response, message: string): void {
  if (!res.headersSent) {
    initSse(res);
  }
  writeSseEvent(res, { type: 'error', message });
  endSse(res);
}

/**
 * POST /ask
 * Student submits a doubt (text + optional image reference).
 * Streams pipeline events via SSE when stream=true (default).
 */
askRouter.post('/', async (req, res) => {
  const requestId = randomUUID().slice(0, 8);
  const started = Date.now();

  const parsed = askBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }

  const { doubt, imageUrl, sessionId, subjectId, classLevel, streamId, boardId, stream } = parsed.data;
  const isSse = stream || req.headers.accept === 'text/event-stream';

  console.log(
    `[ask:${requestId}] POST /ask received — doubt="${doubt.slice(0, 60)}${doubt.length > 60 ? '…' : ''}" board=${boardId} subject=${subjectId ?? 'none'} class=${classLevel} sse=${isSse}`,
  );

  const routeTimer = setTimeout(() => {
    if (res.writableEnded) return;
    console.error(`[ask:${requestId}] ROUTE TIMEOUT after ${ROUTE_TIMEOUT_MS}ms — sending error`);
    if (isSse) {
      sendSseError(res, 'Request timed out. Please try again.');
    } else if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
  }, ROUTE_TIMEOUT_MS);

  const doubtPayload = {
    text: doubt,
    imageUrl,
    sessionId,
    subjectId,
    classLevel: classLevel as any,
    stream: streamId,
    boardId,
  };

  try {
    if (isSse) {
      initSse(res);

      await runDoubtPipeline(doubtPayload, {
        requestId,
        emit: (event) => writeSseEvent(res, event),
        streamTokens: true,
      });

      endSse(res);
      console.log(`[ask:${requestId}] SSE response sent (${Date.now() - started}ms)`);
      return;
    }

    const result = await runDoubtPipeline(doubtPayload, {
      requestId,
      emit: () => {},
      streamTokens: false,
    });

    console.log(`[ask:${requestId}] JSON response sent (${Date.now() - started}ms)`);
    return res.json({
      sessionId: result.sessionId,
      answer: result.verification.answer,
      reasoningSteps: result.verification.reasoningSteps,
      rawMathExplanation: result.draft.rawMathExplanation,
      retrievedChunks: result.retrievedChunks,
      verification: result.verification,
      agentTrail: result.agentTrail,
      quickCheckSession: result.quickCheckSession,
      mastery: result.mastery,
      draft: result.draft,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pipeline failed';
    console.error(`[ask:${requestId}] FAILED (${Date.now() - started}ms):`, message);

    if (isSse) {
      sendSseError(res, message);
      return;
    }

    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
  } finally {
    clearTimeout(routeTimer);
  }
});
