import type { PipelineCallbacks } from '../pipeline/index.js';

const reporters = new Map<string, PipelineCallbacks>();

export function setProgressReporter(requestId: string, callbacks: PipelineCallbacks): void {
  reporters.set(requestId, callbacks);
}

export function getProgressReporter(requestId: string): PipelineCallbacks | undefined {
  return reporters.get(requestId);
}

export function clearProgressReporter(requestId: string): void {
  reporters.delete(requestId);
}
