import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { runNotesSimplifier } from '../../pipeline/notes/index.js';
import type { NotesStreamEvent, NotesStudyContext } from '../../pipeline/notes/types.js';
import { endSse, initSse, writeSseEvent } from '../lib/sse.js';

const MAX_BYTES = Number(process.env.NOTES_MAX_UPLOAD_BYTES) || 10 * 1024 * 1024;
const ROUTE_TIMEOUT_MS = Number(process.env.NOTES_ROUTE_TIMEOUT_MS) || 95_000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    const okMime =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg';
    const okExt = /\.(pdf|jpe?g|png)$/i.test(file.originalname);
    if (okMime || okExt) {
      cb(null, true);
      return;
    }
    cb(new Error('Only JPG, PNG, or PDF files are allowed.'));
  },
});

const contextSchema = z.object({
  boardId: z.enum(['cbse', 'icse']).default('cbse'),
  subjectId: z.string().min(1),
  classLevel: z.coerce.number().int().min(6).max(12),
  streamId: z.enum(['pcm', 'pcb', 'commerce', 'humanities']).optional(),
});

export const notesRouter = Router();

function writeNotesEvent(res: import('express').Response, event: NotesStreamEvent): void {
  writeSseEvent(res, event);
}

function sendNotesError(res: import('express').Response, message: string): void {
  if (!res.headersSent) {
    initSse(res);
  }
  writeNotesEvent(res, { type: 'error', message });
  endSse(res);
}

notesRouter.post('/simplify', upload.single('file'), async (req, res) => {
  const requestId = randomUUID().slice(0, 8);
  const started = Date.now();

  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded. Choose a JPG, PNG, or PDF (max 10 MB).',
    });
  }

  const parsed = contextSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid study context', details: parsed.error.flatten() });
  }

  const context: NotesStudyContext = {
    boardId: parsed.data.boardId,
    subjectId: parsed.data.subjectId as NotesStudyContext['subjectId'],
    classLevel: parsed.data.classLevel as NotesStudyContext['classLevel'],
    streamId: parsed.data.streamId,
  };

  const isSse = req.headers.accept === 'text/event-stream' || req.query.stream === '1';
  console.log(
    `[notes:${requestId}] POST /notes/simplify — ${req.file.originalname} (${req.file.size} bytes) subject=${context.subjectId} class=${context.classLevel}`,
  );

  const routeTimer = setTimeout(() => {
    if (res.writableEnded) return;
    console.error(`[notes:${requestId}] ROUTE TIMEOUT after ${ROUTE_TIMEOUT_MS}ms`);
    if (isSse) {
      sendNotesError(res, 'Request timed out. Try a smaller or clearer file.');
    } else if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out. Try a smaller or clearer file.' });
    }
  }, ROUTE_TIMEOUT_MS);

  try {
    if (isSse) {
      initSse(res);
      await runNotesSimplifier(
        {
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
          originalname: req.file.originalname,
        },
        context,
        (event) => writeNotesEvent(res, event),
        requestId,
      );
      endSse(res);
      console.log(`[notes:${requestId}] SSE complete (${Date.now() - started}ms)`);
      return;
    }

    const result = await runNotesSimplifier(
      {
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
        originalname: req.file.originalname,
      },
      context,
      () => {},
      requestId,
    );

    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notes simplification failed';
    console.error(`[notes:${requestId}] FAILED:`, message);
    if (isSse) {
      sendNotesError(res, message);
      return;
    }
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
  } finally {
    clearTimeout(routeTimer);
  }
});

notesRouter.use((err: unknown, _req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'File is too large. Maximum size is 10 MB — try a photo of one page or a shorter PDF.',
    });
  }
  if (err instanceof Error && /Only JPG/i.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});
