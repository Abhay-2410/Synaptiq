import { verifyTutorOutput } from '../../src/middleware/enkrypt.js';
import type { VerificationInput, VerificationResult } from '../types.js';

/**
 * Step 5 — Enkrypt AI guardrails. Single swap point for real credentials.
 */
export async function runVerification(input: VerificationInput): Promise<VerificationResult> {
  return verifyTutorOutput(input);
}
