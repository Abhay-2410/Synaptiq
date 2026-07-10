import type {
  AskStreamEvent,
  HealthResponse,
  QuickCheckEvaluationResult,
} from '../types';
import type { BoardId, ClassLevel, StreamId, SubjectKey } from '../curriculum';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
/** Total time to wait for /ask (connect + full SSE stream). Must exceed backend PIPELINE_TIMEOUT_MS (60s). */
const ASK_TIMEOUT_MS = Number(import.meta.env.VITE_ASK_TIMEOUT_MS) || 65_000;

export type { BoardId, ClassLevel, StreamId, SubjectKey };

export const ASK_ERROR_MESSAGE =
  'Something went wrong — we could not get an answer in time. Please try again.';

function mergeAbortSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal {
  if (!a) return b ?? new AbortController().signal;
  if (!b) return a;
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (a.aborted || b.aborted) {
    controller.abort();
    return controller.signal;
  }
  a.addEventListener('abort', abort, { once: true });
  b.addEventListener('abort', abort, { once: true });
  return controller.signal;
}

function parseSsePayload(payload: string): AskStreamEvent | null {
  try {
    return JSON.parse(payload) as AskStreamEvent;
  } catch {
    console.warn('Ignoring malformed SSE payload:', payload.slice(0, 120));
    return null;
  }
}

function processSseLine(line: string, onEvent: (event: AskStreamEvent) => void): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return false;
  const payload = trimmed.slice(5).trim();
  if (!payload) return false;
  const event = parseSsePayload(payload);
  if (!event) return false;
  onEvent(event);
  return event.type === 'done' || event.type === 'error';
}

export async function checkHealth(): Promise<HealthResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    if (!res.ok) throw new Error('Health check failed');
    return res.json() as Promise<HealthResponse>;
  } finally {
    clearTimeout(timeout);
  }
}

export interface AskStreamOptions {
  doubt: string;
  sessionId?: string;
  boardId?: BoardId;
  subjectId?: SubjectKey;
  classLevel?: ClassLevel;
  streamId?: StreamId;
  priorMessages?: { role: 'user' | 'assistant'; content: string }[];
  onEvent: (event: AskStreamEvent) => void;
  signal?: AbortSignal;
}

export async function askDoubtStream({
  doubt,
  sessionId,
  boardId,
  subjectId,
  classLevel,
  streamId,
  priorMessages,
  onEvent,
  signal,
}: AskStreamOptions): Promise<void> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), ASK_TIMEOUT_MS);
  const mergedSignal = mergeAbortSignals(signal, timeoutController.signal);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        doubt,
        sessionId,
        boardId,
        subjectId,
        classLevel,
        streamId,
        priorMessages,
        stream: true,
      }),
      signal: mergedSignal,
    });
  } catch (err) {
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error(ASK_ERROR_MESSAGE);
    }
    throw err;
  }

  if (!res.ok) {
    clearTimeout(timeout);
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? ASK_ERROR_MESSAGE);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    clearTimeout(timeout);
    throw new Error(ASK_ERROR_MESSAGE);
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let receivedTerminalEvent = false;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (processSseLine(line, onEvent)) {
          receivedTerminalEvent = true;
        }
      }
    }

    if (buffer.trim()) {
      for (const line of buffer.split('\n')) {
        if (processSseLine(line, onEvent)) {
          receivedTerminalEvent = true;
        }
      }
    }
  } catch (err) {
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error(ASK_ERROR_MESSAGE);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }

  if (!receivedTerminalEvent) {
    throw new Error(ASK_ERROR_MESSAGE);
  }
}

export async function submitQuickCheckAnswer(
  sessionId: string,
  challengeSessionId: string,
  answer: string,
): Promise<QuickCheckEvaluationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(`${API_BASE}/learn/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, challengeSessionId, answer }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(err?.error ?? `Quick check failed (${res.status})`);
    }

    return res.json() as Promise<QuickCheckEvaluationResult>;
  } catch (err) {
    if (controller.signal.aborted) {
      throw new Error('Quick check timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
