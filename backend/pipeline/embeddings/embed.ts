import { hashEmbed } from './hash-embed.js';

const DEFAULT_DIM = 1536;

/**
 * Deterministic hash embeddings for Qdrant seeding and query-time retrieval.
 * Groq does not provide an embeddings API — hash vectors keep retrieval working
 * without OpenAI or other external embedding services.
 */
export async function embedTexts(texts: string[], dim = DEFAULT_DIM): Promise<number[][]> {
  return texts.map((t) => hashEmbed(t, dim));
}

export async function embedText(text: string, dim = DEFAULT_DIM): Promise<number[]> {
  const [v] = await embedTexts([text], dim);
  return v;
}
