import { Agent } from '@mastra/core/agent';
import { resolveTutorModel } from './llm-provider.js';
import { syllabusSearchTool } from './retriever.tool.js';

export const RETRIEVER_AGENT_ID = 'syllabus-retriever';

export const retrieverAgent = new Agent({
  id: RETRIEVER_AGENT_ID,
  name: 'Synaptiq Syllabus Retriever',
  instructions: `You retrieve grounded CBSE/ICSE syllabus material from Qdrant for student doubts.
Always call the syllabus-search tool with the student's question and their class/subject when provided.
Summarize which topics were found — do not invent content beyond retrieved chunks.`,
  model: resolveTutorModel(),
  tools: { syllabusSearch: syllabusSearchTool },
});
