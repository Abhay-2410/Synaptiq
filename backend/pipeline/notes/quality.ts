import type { ExtractionQuality } from './types.js';

/** Score OCR / PDF text extraction — flags garbled or empty output. */
export function scoreExtractionQuality(text: string): ExtractionQuality {
  const trimmed = text.replace(/\s+/g, ' ').trim();
  if (trimmed.length < 25) return 'failed';

  const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
  if (words.length < 6) return 'failed';

  const alphanumeric = trimmed.match(/[a-zA-Z0-9]/g)?.length ?? 0;
  if (alphanumeric / trimmed.length < 0.35) return 'failed';

  const weird = trimmed.match(/[^\w\s.,;:'"()\-+=/\\[\]{}@#%&*?!]/g)?.length ?? 0;
  if (weird / trimmed.length > 0.25) return 'poor';

  const shortTokens = words.filter((w) => w.length === 1 && !/[\d]/.test(w)).length;
  if (shortTokens / words.length > 0.35) return 'poor';

  return 'good';
}

export function isClearlyGarbled(text: string): boolean {
  return scoreExtractionQuality(text) === 'failed';
}
