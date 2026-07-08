import { hashEmbed } from './hash-embed.js';
import { fetchWithTimeout } from '../lib/fetch-timeout.js';

const DEFAULT_DIM = 1536;

function isInsufficientQuota(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /429|insufficient_quota|quota/i.test(msg);
}

async function openAiEmbedBatch(texts: string[], dim: number): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY missing');
  }

  const model = process.env.OPENAI_EMBEDDINGS_MODEL?.trim() || 'text-embedding-3-small';
  const res = await fetchWithTimeout(
    'https://api.openai.com/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, input: texts }),
    },
    15_000,
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const msg = `Embedding API failed: ${res.status} ${body}`;
    if (isInsufficientQuota(msg)) throw new Error(msg);
    throw new Error(msg);
  }

  const data = (await res.json()) as { data: { embedding: number[]; index: number }[] };
  const sorted = data.data.sort((a, b) => a.index - b.index);
  return sorted.map((d) => {
    const e = d.embedding;
    // OpenAI embedding length should match `dim`, but guard anyway.
    if (e.length === dim) return e;
    if (e.length > dim) return e.slice(0, dim);
    const padded = new Array(dim).fill(0);
    for (let i = 0; i < e.length; i++) padded[i] = e[i];
    return padded;
  });
}

/**
 * Embed texts for Qdrant seeding and query-time retrieval.
 * If OpenAI quota fails, fall back to deterministic hash embeddings.
 */
export async function embedTexts(texts: string[], dim = DEFAULT_DIM): Promise<number[][]> {
  try {
    return await openAiEmbedBatch(texts, dim);
  } catch (err) {
    if (isInsufficientQuota(err)) {
      return texts.map((t) => hashEmbed(t, dim));
    }
    // For any other embedding failure, still fall back to hashing so the app works.
    return texts.map((t) => hashEmbed(t, dim));
  }
}

export async function embedText(text: string, dim = DEFAULT_DIM): Promise<number[]> {
  const [v] = await embedTexts([text], dim);
  return v;
}

