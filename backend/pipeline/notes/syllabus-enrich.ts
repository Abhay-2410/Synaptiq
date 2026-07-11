import { executeSyllabusSearch } from '../../agents/retriever.tool.js';
import { stripChunkDisplayText } from '../stages/chunk-focus.js';
import type { ResolvedNotesContext } from './detect-subject.js';

const ENRICH_TIMEOUT_MS = Number(process.env.NOTES_ENRICH_TIMEOUT_MS) || 8_000;

/**
 * Fetch 2–3 syllabus chunks to help the tutor add missing key points and examples.
 * Fails silently — simplification still works without Qdrant.
 */
export async function fetchNotesSyllabusContext(
  extractedText: string,
  context: ResolvedNotesContext,
): Promise<string> {
  const query = extractedText
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);

  if (query.length < 40) return '';

  try {
    const result = await Promise.race([
      executeSyllabusSearch({
        query,
        boardId: context.boardId,
        classLevel: context.classLevel,
        subjectId: context.subjectId,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('syllabus enrich timeout')), ENRICH_TIMEOUT_MS),
      ),
    ]);

    if (result.chunks.length === 0) return '';

    return result.chunks
      .slice(0, 3)
      .map((chunk, i) => {
        const topic = chunk.metadata.topic ?? 'Topic';
        const chapter = chunk.metadata.chapter ?? '';
        const body = stripChunkDisplayText(chunk.content).slice(0, 600);
        return `[Syllabus ${i + 1}] ${topic}${chapter ? ` · ${chapter}` : ''}\n${body}`;
      })
      .join('\n\n');
  } catch {
    return '';
  }
}
