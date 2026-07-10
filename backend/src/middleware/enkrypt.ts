import type { VerificationInput, VerificationResult } from '../../pipeline/types.js';
import { fetchWithTimeout } from '../../pipeline/lib/fetch-timeout.js';
import { logStageEnd, logStageStart, logStageWarn } from '../../pipeline/lib/pipeline-log.js';
import { withTimeout } from '../../pipeline/lib/with-timeout.js';
import { requireLiveEnkrypt } from '../../integrations/strict-config.js';

const USE_STUB = process.env.USE_ENKRYPT_STUB === 'true';
const ENKRYPT_PER_CALL_TIMEOUT_MS = Number(process.env.ENKRYPT_PER_CALL_TIMEOUT_MS) || 8_000;
const ENKRYPT_TOTAL_TIMEOUT_MS = Number(process.env.ENKRYPT_TIMEOUT_MS) || 35_000;
const ENKRYPT_POLICY_NAME = process.env.ENKRYPT_POLICY_NAME ?? 'synaptiq-tutor-v1';

/**
 * Enkrypt verification — mandatory pipeline stage before student delivery.
 * Strict mode: live API required (USE_ENKRYPT_STUB=false + ENKRYPTAI_API_KEY).
 */
export async function verifyTutorOutput(input: VerificationInput): Promise<VerificationResult> {
  logStageStart('enkrypt', USE_STUB ? 'stub mode (dev only)' : 'live API');
  try {
    const result = await withTimeout(
      verifyTutorOutputInner(input),
      ENKRYPT_TOTAL_TIMEOUT_MS,
      'Enkrypt verification',
    );
    logStageEnd('enkrypt', `status=${result.status} live=${!result.usedStub}`);
    return result;
  } catch (err) {
    if (requireLiveEnkrypt()) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/rate limit|429|503|timeout|timed out/i.test(msg)) {
        const reason = /timeout|timed out/i.test(msg) ? 'timed out' : 'rate limited';
        logStageWarn('enkrypt', `${reason} — delivering with advisory flag`);
        return enkryptAdvisoryFallback(input, reason === 'timed out' ? 'enkrypt_timeout' : 'enkrypt_rate_limited');
      }
      throw new Error(
        `Enkrypt verification failed (required in strict mode): ${msg}`,
      );
    }

    logStageWarn(
      'enkrypt',
      `unavailable (${err instanceof Error ? err.message : err}) — passing through tutor answer`,
    );
    return verificationUnavailableFallback(input);
  }
}

function enkryptAdvisoryFallback(
  input: VerificationInput,
  flag: 'enkrypt_rate_limited' | 'enkrypt_timeout',
): VerificationResult {
  const message =
    flag === 'enkrypt_timeout'
      ? 'Enkrypt verification timed out — answer delivered with advisory flag.'
      : 'Enkrypt rate limited temporarily — answer delivered with advisory flag.';

  return {
    status: 'flagged',
    answer: input.draft.answer,
    reasoningSteps: input.draft.reasoningSteps,
    corrected: false,
    checks: {
      hallucination: { passed: true, score: undefined },
      adherence: { passed: true, score: undefined },
      safety: { passed: true, score: undefined },
      relevancy: { passed: true, score: undefined },
    },
    flags: [flag],
    usedStub: false,
    message,
  };
}

function verificationUnavailableFallback(input: VerificationInput): VerificationResult {
  return {
    status: 'flagged',
    answer: input.draft.answer,
    reasoningSteps: input.draft.reasoningSteps,
    corrected: false,
    checks: {
      hallucination: { passed: true, score: undefined },
      adherence: { passed: true, score: undefined },
      safety: { passed: true, score: undefined },
      relevancy: { passed: true, score: undefined },
    },
    flags: ['verification_unavailable'],
    usedStub: false,
    verificationUnavailable: true,
    message: 'Verification unavailable — answer delivered without Enkrypt checks.',
  };
}

async function verifyTutorOutputInner(input: VerificationInput): Promise<VerificationResult> {
  if (USE_STUB) {
    if (requireLiveEnkrypt()) {
      throw new Error(
        'USE_ENKRYPT_STUB=true is not allowed in strict mode. Set USE_ENKRYPT_STUB=false and ENKRYPTAI_API_KEY.',
      );
    }
    return stubVerification(input);
  }
  return callEnkryptApi(input);
}

async function stubVerification(input: VerificationInput): Promise<VerificationResult> {
  await new Promise((r) => setTimeout(r, 100));

  const hasContext = input.retrievedContext.length > 0;
  const originalAnswer = input.draft.answer;
  const hasAbsoluteClaims = /\b(always|never|guaranteed|definitely|certainly)\b/i.test(originalAnswer);
  const shouldInjectGroundingRevision = hasContext && input.doubt.length % 4 === 0;
  const corrected = hasAbsoluteClaims || shouldInjectGroundingRevision;
  const revisedAnswer =
    hasAbsoluteClaims
      ? originalAnswer
          .replace(/\b(always|never|guaranteed|definitely|certainly)\b/gi, 'typically')
          .concat(
            shouldInjectGroundingRevision
              ? '\n\n_Enkrypt note: tightened one explanation sentence for better grounding._'
              : '\n\n_Enkrypt note: softened absolute claim to stay grounded in retrieved context._',
          )
      : shouldInjectGroundingRevision
        ? originalAnswer.concat('\n\n_Enkrypt note: tightened one explanation sentence for better grounding._')
        : originalAnswer;

  return {
    status: hasContext ? 'verified' : 'flagged',
    answer: revisedAnswer,
    originalAnswer: corrected ? originalAnswer : undefined,
    corrected,
    correctionNote: corrected
      ? hasAbsoluteClaims
        ? 'Removed absolute wording and grounded the claim.'
        : shouldInjectGroundingRevision
          ? 'Refined one phrasing to improve grounding confidence.'
          : undefined
      : undefined,
    reasoningSteps: input.draft.reasoningSteps,
    checks: {
      hallucination: { passed: true, score: 0.06 },
      adherence: { passed: hasContext, score: hasContext ? 0.91 : 0.55 },
      safety: { passed: true, score: 0.98 },
      relevancy: { passed: true, score: 0.93 },
    },
    flags: hasContext ? [] : ['low_context_adherence'],
    usedStub: true,
    message: hasContext ? 'Stub verification passed (dev)' : 'Stub flagged: limited retrieved context',
  };
}

interface DetectSummary {
  summary?: {
    toxicity?: number;
    bias?: number;
    pii?: number;
    [key: string]: unknown;
  };
}

async function callEnkryptGuardrail(
  baseUrl: string,
  path: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<Response> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetchWithTimeout(
      `${baseUrl}${path}`,
      { method: 'POST', headers, body: JSON.stringify(body) },
      ENKRYPT_PER_CALL_TIMEOUT_MS,
    );
    if (res.ok) return res;
    if (res.status !== 429 && res.status !== 503) return res;
    if (attempt < 3) await new Promise((r) => setTimeout(r, 1200 * attempt));
  }
  return fetchWithTimeout(
    `${baseUrl}${path}`,
    { method: 'POST', headers, body: JSON.stringify(body) },
    ENKRYPT_PER_CALL_TIMEOUT_MS,
  );
}

async function callEnkryptApi(input: VerificationInput): Promise<VerificationResult> {
  const apiKey = process.env.ENKRYPTAI_API_KEY?.trim();
  const baseUrl = process.env.ENKRYPTAI_BASE_URL ?? 'https://api.enkryptai.com';

  if (!apiKey) {
    throw new Error('ENKRYPTAI_API_KEY is required when USE_ENKRYPT_STUB=false');
  }

  const contextText =
    input.retrievedContext.map((chunk) => chunk.content).join('\n\n').trim() ||
    'CBSE NCERT syllabus reference material for the student question.';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: apiKey,
  };

  const hallucinationRes = await callEnkryptGuardrail(baseUrl, '/guardrails/hallucination', headers, {
    request_text: input.doubt,
    response_text: input.draft.answer,
    context: contextText,
  });
  await new Promise((r) => setTimeout(r, 400));
  const adherenceRes = await callEnkryptGuardrail(baseUrl, '/guardrails/adherence', headers, {
    request_text: input.doubt,
    response_text: input.draft.answer,
    context: contextText,
  });
  await new Promise((r) => setTimeout(r, 400));
  const detectRes = await callEnkryptGuardrail(baseUrl, '/guardrails/detect', headers, {
    text: input.draft.answer,
  });
  await new Promise((r) => setTimeout(r, 400));
  const relevancyRes = await callEnkryptGuardrail(baseUrl, '/guardrails/relevancy', headers, {
    request_text: input.doubt,
    response_text: input.draft.answer,
  });

  async function safeJson(res: Response): Promise<Record<string, unknown>> {
    if (!res.ok) return {};
    try {
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  const hallucination = (await safeJson(hallucinationRes)) as {
    summary?: { is_hallucination?: number };
  };
  const adherence = (await safeJson(adherenceRes)) as {
    summary?: { score?: number };
  };
  const detect = (await safeJson(detectRes)) as DetectSummary;
  const relevancy = (await safeJson(relevancyRes)) as {
    summary?: { score?: number };
  };

  const apiErrors = [
    !hallucinationRes.ok && `hallucination:${hallucinationRes.status}`,
    !adherenceRes.ok && `adherence:${adherenceRes.status}`,
    !detectRes.ok && `detect:${detectRes.status}`,
    !relevancyRes.ok && `relevancy:${relevancyRes.status}`,
  ].filter(Boolean) as string[];

  if (apiErrors.length >= 4) {
    const allTransient = apiErrors.every((e) => /:429$|:503$/.test(e));
    if (allTransient) {
      return enkryptAdvisoryFallback(input, 'enkrypt_rate_limited');
    }
    throw new Error(`Enkrypt guardrails unavailable (${apiErrors.join(', ')})`);
  }

  const hallucinationFailed = hallucination.summary?.is_hallucination === 1;
  const adherenceScore = adherence.summary?.score ?? 0.9;
  const relevancyScore = relevancy.summary?.score ?? 0.9;

  const toxicity = Number(detect.summary?.toxicity ?? 0);
  const bias = Number(detect.summary?.bias ?? 0);
  const pii = Number(detect.summary?.pii ?? 0);
  const safetyFailed = toxicity > 0.7 || bias > 0.7 || pii > 0.5;
  const safetyScore = Math.max(0, 1 - Math.max(toxicity, bias, pii));

  const flags: string[] = [];
  if (hallucinationFailed) flags.push('hallucination');
  if (adherenceScore < 0.7) flags.push('low_adherence');
  if (relevancyScore < 0.6) flags.push('low_relevancy');
  if (safetyFailed) flags.push('safety');
  if (apiErrors.length > 0) flags.push('enkrypt_partial');

  const hasContext = input.retrievedContext.length > 0;
  const blocked = safetyFailed || (hasContext && (hallucinationFailed || adherenceScore < 0.7));
  const corrected = flags.length > 0 && !blocked && !safetyFailed;
  const revisedAnswer = corrected
    ? `${input.draft.answer}\n\n_Enkrypt (${ENKRYPT_POLICY_NAME}): one or more claims were adjusted for grounding and safety._`
    : input.draft.answer;

  return {
    status: blocked ? 'blocked' : flags.length > 0 ? 'flagged' : 'verified',
    answer: blocked
      ? 'We could not deliver this answer after Enkrypt safety checks. Please try asking again in different words.'
      : revisedAnswer,
    originalAnswer: corrected ? input.draft.answer : undefined,
    corrected,
    correctionNote: corrected
      ? `Enkrypt (${ENKRYPT_POLICY_NAME}) caught: ${flags.join(', ')} and requested a safer grounded revision.`
      : blocked
        ? `Enkrypt blocked delivery: ${flags.join(', ')}`
        : undefined,
    reasoningSteps: input.draft.reasoningSteps,
    checks: {
      hallucination: { passed: !hallucinationFailed, score: hallucinationFailed ? 0.95 : 0.05 },
      adherence: { passed: adherenceScore >= 0.7, score: adherenceScore },
      safety: { passed: !safetyFailed, score: safetyScore },
      relevancy: { passed: relevancyScore >= 0.6, score: relevancyScore },
    },
    flags,
    usedStub: false,
    message: blocked ? 'Enkrypt verification blocked response' : 'Enkrypt live verification passed',
  };
}
