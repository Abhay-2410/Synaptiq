const DEFAULT_DIM = 1536;

function fnv1a32(str: string): number {
  // Deterministic 32-bit hash for stable vector indices.
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function tokenize(text: string): string[] {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z0-9]+/g) ?? [];
  // Add bigrams to increase "semantic-ish" overlap for short doubts.
  const bigrams: string[] = [];
  for (let i = 0; i + 1 < words.length; i++) bigrams.push(`${words[i]} ${words[i + 1]}`);

  // Add character trigrams to handle minor morphological variants:
  // polynomial vs polynomials, photosynthesis vs photosynthesise, etc.
  const trigrams: string[] = [];
  for (const w of words) {
    if (w.length < 3) continue;
    for (let i = 0; i + 2 < w.length; i++) trigrams.push(w.slice(i, i + 3));
  }

  return [...words, ...bigrams, ...trigrams];
}

function l2Normalize(vec: Float32Array): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) sumSq += vec[i] * vec[i];
  const norm = Math.sqrt(sumSq) || 1;
  const out = new Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
  return out;
}

/**
 * Fast, deterministic fallback embedding.
 * Not "true" semantics, but enables vector similarity search in Qdrant even without external embedding quota.
 */
export function hashEmbed(text: string, dim = DEFAULT_DIM): number[] {
  const vec = new Float32Array(dim);
  const tokens = tokenize(text);
  if (tokens.length === 0) return l2Normalize(vec);

  for (const token of tokens) {
    const idx = fnv1a32(token) % dim;
    vec[idx] += 1;
  }

  return l2Normalize(vec);
}

