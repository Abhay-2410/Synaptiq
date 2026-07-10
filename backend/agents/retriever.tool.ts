import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { retrieveFromMastraQdrant } from '../integrations/qdrant-retrieval.js';
import type { SubjectKey } from '../pipeline/curriculum/catalog.js';
import type { DoubtRequest } from '../pipeline/types.js';

const subjectKeys = [
  'math',
  'science',
  'english',
  'social',
  'physics',
  'chemistry',
  'biology',
  'accountancy',
  'business',
  'economics',
  'history',
  'political_science',
] as const;

export const syllabusSearchTool = createTool({
  id: 'syllabus-search',
  description:
    'Search the CBSE/ICSE syllabus corpus stored in Qdrant (via Mastra vector store). Returns grounded syllabus chunks filtered by board, class, and subject.',
  inputSchema: z.object({
    query: z.string().describe('Student doubt or search query'),
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
      }),
    ),
    source: z.literal('mastra-qdrant'),
  }),
  execute: async (inputData) => {
    const doubt: DoubtRequest = {
      text: inputData.query,
      classLevel: inputData.classLevel as DoubtRequest['classLevel'],
      subjectId: inputData.subjectId as SubjectKey | undefined,
    };

    const chunks = await retrieveFromMastraQdrant(doubt);

    return {
      source: 'mastra-qdrant' as const,
      chunks: chunks.map((c) => ({
        id: c.id,
        score: c.score,
        content: c.content,
        topic: c.metadata.topic,
        chapter: c.metadata.chapter,
      })),
    };
  },
});
