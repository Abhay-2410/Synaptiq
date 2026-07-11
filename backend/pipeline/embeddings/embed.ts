import { hashEmbed } from './hash-embed.js';

const DEFAULT_DIM = 1536;

export type EmbeddingMode = 'hash-vector+lexical-rerank';

/** How syllabus chunks are embedded and ranked at query time. */
export function getEmbeddingMode(): EmbeddingMode {
  return 'hash-vector+lexical-rerank';
}

/**
 * Deterministic hash embeddings for Qdrant seeding and query-time retrieval.
 * Groq does not provide an embeddings API — hash vectors keep retrieval working
 * without OpenAI or other external embedding services. Lexical re-ranking and
 * corpus supplement handle weak hash matches at query time.
 */
export async function embedTexts(texts: string[], dim = DEFAULT_DIM): Promise<number[][]> {
  return texts.map((t) => hashEmbed(t, dim));
}

export async function embedText(text: string, dim = DEFAULT_DIM): Promise<number[]> {
  const [v] = await embedTexts([text], dim);
  return v;
}
