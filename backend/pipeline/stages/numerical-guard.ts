/**
 * Detect incomplete numerical answers and route solve questions to the STEM solver.
 */
import type { DoubtRequest } from '../types.js';
import { resolveAnswerMode } from './chunk-focus.js';
import { detectIntent } from './local-tutor.js';

const NUMERIC_SOLVE_CUE =
  /\b(solve|find|calculate|compute|evaluate|work\s*out|determine)\b/i;

const FINAL_VALUE_PATTERNS = [
  /=\s*\d+(?:\.\d+)?\s*(?:A|V|Ω|m\/s|kg|J|W|N|mol|g|cm|km\/h)\b/i,
  /\$\$[^$]*=\s*\d+(?:\.\d+)?[^$]*\$\$/i,
  /\*\*Final answer\*\*[\s\S]{0,200}\d+(?:\.\d+)?/i,
  /\\text\{[^}]*\}[^=]*=\s*\d+(?:\.\d+)?/i,
];

/** Student question asks for a numerical solution. */
export function needsNumericalSolution(text: string): boolean {
  if (!NUMERIC_SOLVE_CUE.test(text)) return false;
  return /\d/.test(text);
}

export function isNumericalDoubt(doubt: DoubtRequest): boolean {
  const mode = resolveAnswerMode(doubt, []);
  if (mode !== 'math' && mode !== 'physical-science') return false;
  const intent = detectIntent(doubt.text);
  if (intent === 'solve') return true;
  return needsNumericalSolution(doubt.text);
}

/** Answer includes an actual computed result, not just a formula statement. */
export function hasWorkedNumericalResult(
  question: string,
  answer: string,
  rawMath?: string,
): boolean {
  const combined = `${answer}\n${rawMath ?? ''}`;
  if (!/\d/.test(question)) return true;

  for (const pattern of FINAL_VALUE_PATTERNS) {
    if (pattern.test(combined)) return true;
  }

  // Raw math panel with numbered steps and a numeric result line
  if (rawMath && /\*\*\d+\.\*\*/.test(rawMath) && /=\s*\d+(?:\.\d+)?/.test(rawMath)) {
    return true;
  }

  // Multiple calculation lines with substitution
  const calcLines = combined.match(/=\s*\d+(?:\.\d+)?/g) ?? [];
  if (calcLines.length >= 2) return true;

  return false;
}

export function isIncompleteNumericalAnswer(
  doubt: DoubtRequest,
  answer: string,
  rawMath?: string,
): boolean {
  if (!isNumericalDoubt(doubt)) return false;
  return !hasWorkedNumericalResult(doubt.text, answer, rawMath);
}
