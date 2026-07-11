import type { Response } from 'express';
import type { AskStreamEvent } from '../../pipeline/types.js';

export function initSse(res: Response): void {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();
}

export function writeSseEvent(res: Response, event: AskStreamEvent | Record<string, unknown>): void {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(event)}\n\n`);
  const flush = (res as Response & { flush?: () => void }).flush;
  flush?.();
}

export function endSse(res: Response): void {
  if (!res.writableEnded) {
    res.end();
  }
}
