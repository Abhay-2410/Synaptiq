import type { MastraModelConfig, OpenAICompatibleConfig } from '@mastra/core/llm';
import { fetchWithTimeout } from '../pipeline/lib/fetch-timeout.js';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_TUTOR_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_QUICK_CHECK_MODEL = 'llama-3.1-8b-instant';
const GROQ_STARTUP_TIMEOUT_MS = Number(process.env.GROQ_STARTUP_TIMEOUT_MS) || 5_000;

let groqReachable: boolean | null = null;

function stripProviderPrefix(model: string): string {
  return model.replace(/^(openai|ollama|groq)\//, '');
}

function buildGroqModelConfig(modelId: string): OpenAICompatibleConfig {
  return {
    providerId: 'openai',
    modelId: stripProviderPrefix(modelId),
    url: GROQ_BASE_URL,
    apiKey: process.env.GROQ_API_KEY?.trim() || '',
  };
}

export function getLlmProvider(): 'groq' {
  return 'groq';
}

/** Mastra model config for the Tutor agent (Groq llama-3.3-70b-versatile). */
export function resolveTutorModel(): MastraModelConfig {
  const model = process.env.TUTOR_MODEL?.trim() || DEFAULT_TUTOR_MODEL;
  return buildGroqModelConfig(model);
}

/** Mastra model config for Quick Challenge evaluation (Groq llama-3.1-8b-instant). */
export function resolveQuickCheckModel(): MastraModelConfig {
  const model = process.env.QUICK_CHECK_MODEL?.trim() || DEFAULT_QUICK_CHECK_MODEL;
  return buildGroqModelConfig(model);
}

export function describeTutorModel(): string {
  const model = process.env.TUTOR_MODEL?.trim() || DEFAULT_TUTOR_MODEL;
  return `groq/${stripProviderPrefix(model)}`;
}

export function describeQuickCheckModel(): string {
  const model = process.env.QUICK_CHECK_MODEL?.trim() || DEFAULT_QUICK_CHECK_MODEL;
  return `groq/${stripProviderPrefix(model)}`;
}

/** True when GROQ_API_KEY is set. */
export function isLlmProviderConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export function isGroqReachable(): boolean | null {
  return groqReachable;
}

/**
 * Ping Groq at startup so missing/invalid GROQ_API_KEY surfaces immediately.
 */
export async function checkLlmProviderAtStartup(): Promise<void> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    groqReachable = false;
    console.error(
      [
        '',
        '[llm] ERROR: GROQ_API_KEY is not set.',
        '       Tutor LLM and Quick Challenge evaluation will fall back to local/heuristic paths.',
        '       Fix: Add GROQ_API_KEY to backend/.env',
        '',
      ].join('\n'),
    );
    return;
  }

  const modelsUrl = `${GROQ_BASE_URL}/models`;

  try {
    const res = await fetchWithTimeout(
      modelsUrl,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      },
      GROQ_STARTUP_TIMEOUT_MS,
    );

    if (res.status === 401 || res.status === 403) {
      groqReachable = false;
      console.error(
        [
          '',
          '[llm] ERROR: Groq API authentication failed (invalid GROQ_API_KEY).',
          '       Fix: Verify your key at https://console.groq.com',
          '',
        ].join('\n'),
      );
      return;
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    groqReachable = true;
    console.log(
      `[llm] provider=groq tutor=${describeTutorModel()} quickCheck=${describeQuickCheckModel()}`,
    );
  } catch (err) {
    groqReachable = false;
    const detail = err instanceof Error ? err.message : String(err);
    console.error(
      [
        '',
        '[llm] ERROR: Groq API is not reachable.',
        `       URL:    ${modelsUrl}`,
        `       Reason: ${detail}`,
        '       Fix: Check network and GROQ_API_KEY in backend/.env',
        '',
      ].join('\n'),
    );
  }
}
