import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { retrieveFromMastraQdrant } from '../integrations/qdrant-retrieval.js';
import type { SubjectKey } from '../pipeline/curriculum/catalog.js';
import type { DoubtRequest, RetrievedChunk } from '../pipeline/types.js';

const subjectKeys = [
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
] as const;

export type SyllabusSearchInput = {
  query: string;
  boardId?: 'cbse' | 'icse';
  classLevel?: number;
  subjectId?: SubjectKey;
};

/** Shared retrieval logic — used by Mastra tool and workflow retrieve step. */
export async function executeSyllabusSearch(inputData: SyllabusSearchInput): Promise<{
  source: 'mastra-qdrant';
  agentId: 'syllabus-retriever';
  toolId: 'syllabus-search';
  chunks: RetrievedChunk[];
}> {
  const doubt: DoubtRequest = {
    text: inputData.query,
    boardId: inputData.boardId ?? 'cbse',
    classLevel: inputData.classLevel as DoubtRequest['classLevel'],
    subjectId: inputData.subjectId,
  };

  const chunks = await retrieveFromMastraQdrant(doubt);

  return {
    source: 'mastra-qdrant',
    agentId: 'syllabus-retriever',
    toolId: 'syllabus-search',
    chunks,
  };
}

export const syllabusSearchTool = createTool({
  id: 'syllabus-search',
  description:
    'Search the CBSE/ICSE syllabus corpus stored in Qdrant (via Mastra vector store). Returns grounded syllabus chunks filtered by board, class, and subject.',
  inputSchema: z.object({
    query: z.string().describe('Student doubt or search query'),
    boardId: z.enum(['cbse', 'icse']).optional().describe('Exam board'),
    classLevel: z.number().int().min(6).max(12).optional(),
    subjectId: z.enum(subjectKeys).optional(),
  }),
  outputSchema: z.object({
    chunks: z.array(
      z.object({
        id: z.string(),
        score: z.number(),
        content: z.string(),
        topic: z.string().optional(),
        chapter: z.string().optional(),
        board: z.enum(['cbse', 'icse']).optional(),
        subjectKey: z.string().optional(),
      }),
    ),
    source: z.literal('mastra-qdrant'),
    agentId: z.literal('syllabus-retriever'),
    toolId: z.literal('syllabus-search'),
  }),
  execute: async (inputData) => {
    const result = await executeSyllabusSearch(inputData);
    return {
      ...result,
      chunks: result.chunks.map((c) => ({
        id: c.id,
        score: c.score,
        content: c.content,
        topic: c.metadata.topic,
        chapter: c.metadata.chapter,
        board: c.metadata.board,
        subjectKey: c.metadata.subjectKey,
      })),
    };
  },
});
