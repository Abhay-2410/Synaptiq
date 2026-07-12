import type { NotesStreamEvent } from '../pipeline/notes/types.js';

export type NotesProgressCallback = (event: NotesStreamEvent) => void;

const reporters = new Map<string, NotesProgressCallback>();

export function setNotesProgressReporter(requestId: string, callback: NotesProgressCallback): void {
  reporters.set(requestId, callback);
}

export function getNotesProgressReporter(requestId: string): NotesProgressCallback | undefined {
  return reporters.get(requestId);
}

export function clearNotesProgressReporter(requestId: string): void {
  reporters.delete(requestId);
}
