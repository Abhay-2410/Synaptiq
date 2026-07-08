import type {
  AskStreamEvent,
  HealthResponse,
  QuickCheck,
  QuickCheckEvaluationResult,
} from '../types';
import type { ClassLevel, StreamId, SubjectKey } from '../curriculum';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const ASK_TIMEOUT_MS = 120_000;

export type { ClassLevel, StreamId, SubjectKey };

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
  subjectId?: SubjectKey;
  classLevel?: ClassLevel;
  streamId?: StreamId;
  onEvent: (event: AskStreamEvent) => void;
  signal?: AbortSignal;
}

export async function askDoubtStream({
  doubt,
  sessionId,
  subjectId,
  classLevel,
  streamId,
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
        subjectId,
        classLevel,
        streamId,
        stream: true,
      }),
      signal: mergedSignal,
    });
  } catch (err) {
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error('Request timed out — the tutor took too long. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Request failed (${res.status})`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

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
  } finally {
    reader.releaseLock();
  }

  if (!receivedTerminalEvent) {
    throw new Error('Connection closed before the answer finished. Please try again.');
  }
}

export async function submitQuickCheckAnswer(
  sessionId: string,
  quickCheck: QuickCheck,
  answer: string,
): Promise<QuickCheckEvaluationResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const res = await fetch(`${API_BASE}/learn/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, quickCheck, answer }),
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
