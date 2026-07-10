/**
 * Hackathon strict stack — Mastra + Qdrant + Enkrypt must be live and interconnected.
 * Set STRICT_STACK_MODE=false only for local offline development.
 */
export function isStrictStackMode(): boolean {
  return process.env.STRICT_STACK_MODE !== 'false';
}

/** When true, retrieval uses only @mastra/qdrant — no in-memory corpus fallback. */
export function allowCorpusFallback(): boolean {
  const raw = process.env.ALLOW_CORPUS_FALLBACK?.trim().toLowerCase();
  if (!raw || raw === 'false' || raw === '0' || raw === 'no') return false;
  return raw === 'true' || raw === '1' || raw === 'yes';
}

export function requireLiveQdrant(): boolean {
  return isStrictStackMode() && !allowCorpusFallback();
}

/** Enkrypt must run live API (not stub) in strict mode. */
export function requireLiveEnkrypt(): boolean {
  return isStrictStackMode() && process.env.USE_ENKRYPT_STUB !== 'true';
}

export function qdrantCollectionName(): string {
  return process.env.QDRANT_COLLECTION ?? 'synaptiq_course_material';
}

export function qdrantVectorId(): string {
  return process.env.QDRANT_VECTOR_ID ?? 'synaptiq-qdrant';
}
