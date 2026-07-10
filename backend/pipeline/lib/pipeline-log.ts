/** Structured console logging for /ask pipeline stages. */

let activeRequestId: string | undefined;

export function setPipelineRequestId(id: string): void {
  activeRequestId = id;
}

export function clearPipelineRequestId(): void {
  activeRequestId = undefined;
}

function prefix(stage: string): string {
  return activeRequestId ? `[ask:${activeRequestId}] [${stage}]` : `[pipeline] [${stage}]`;
}

export function logStageStart(stage: string, detail?: string): void {
  console.log(`${prefix(stage)} START${detail ? ` — ${detail}` : ''}`);
}

export function logStageEnd(stage: string, detail?: string): void {
  console.log(`${prefix(stage)} END${detail ? ` — ${detail}` : ''}`);
}

export function logStageWarn(stage: string, detail: string): void {
  console.warn(`${prefix(stage)} WARN — ${detail}`);
}

export function logStageError(stage: string, detail: string, err?: unknown): void {
  console.error(`${prefix(stage)} ERROR — ${detail}`, err ?? '');
}
