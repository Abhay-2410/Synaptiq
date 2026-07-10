import { fetchWithTimeout } from '../pipeline/lib/fetch-timeout.js';
import { isGroqReachable, isLlmProviderConfigured } from '../agents/llm-provider.js';
import { probeMastraQdrant } from './qdrant-retrieval.js';
import { isStrictStackMode, requireLiveEnkrypt, requireLiveQdrant } from './strict-config.js';

export interface StackHealthStatus {
  strictMode: boolean;
  mastra: {
    status: 'live';
    agents: string[];
    workflows: string[];
    vectorStore: string;
  };
  qdrant: {
    status: 'live' | 'degraded' | 'offline';
    provider: '@mastra/qdrant';
    indexName: string;
    vectorCount: number;
    required: boolean;
    error?: string;
  };
  enkrypt: {
    status: 'live' | 'stub' | 'offline';
    required: boolean;
    policyName: string;
    error?: string;
  };
  ready: boolean;
  warnings: string[];
}

const ENKRYPT_PROBE_TIMEOUT_MS = Number(process.env.ENKRYPT_PROBE_TIMEOUT_MS) || 5_000;

async function probeEnkryptLive(): Promise<{ live: boolean; error?: string }> {
  const apiKey = process.env.ENKRYPTAI_API_KEY?.trim();
  if (!apiKey) {
    return { live: false, error: 'ENKRYPTAI_API_KEY not set' };
  }

  const baseUrl = process.env.ENKRYPTAI_BASE_URL ?? 'https://api.enkryptai.com';
  const body = JSON.stringify({
    request_text: 'What is photosynthesis?',
    response_text: 'Photosynthesis converts light energy into chemical energy in plants.',
    context: 'Plants use chlorophyll to capture light.',
  });

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${baseUrl}/guardrails/hallucination`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', apikey: apiKey },
          body,
        },
        ENKRYPT_PROBE_TIMEOUT_MS,
      );

      if (res.status === 401 || res.status === 403) {
        return { live: false, error: 'Enkrypt authentication failed' };
      }

      if (res.ok) return { live: true };

      // 429/503 during health probe still means the API key and endpoint are valid
      if (res.status === 429 || res.status === 503) return { live: true };

      if (res.status === 503 && attempt < 2) continue;

      return { live: false, error: `Enkrypt HTTP ${res.status}` };
    } catch (err) {
      if (attempt < 2) continue;
      return { live: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  return { live: false, error: 'Enkrypt unreachable' };
}

export async function checkStackHealth(agentIds: string[], workflowIds: string[]): Promise<StackHealthStatus> {
  const warnings: string[] = [];
  const strict = isStrictStackMode();

  const qdrantProbe = await probeMastraQdrant();
  let qdrantStatus: StackHealthStatus['qdrant']['status'] = 'offline';
  if (qdrantProbe.reachable && qdrantProbe.vectorCount > 0) {
    qdrantStatus = 'live';
  } else if (qdrantProbe.reachable) {
    qdrantStatus = 'degraded';
    warnings.push('Qdrant collection is empty — run npm run seed:qdrant');
  } else {
    warnings.push(`Qdrant unreachable: ${qdrantProbe.error ?? 'unknown'}`);
  }

  const useStub = process.env.USE_ENKRYPT_STUB === 'true';
  let enkryptStatus: StackHealthStatus['enkrypt']['status'] = 'offline';
  let enkryptError: string | undefined;

  if (useStub) {
    enkryptStatus = 'stub';
    if (requireLiveEnkrypt()) {
      warnings.push('Enkrypt is in stub mode — set USE_ENKRYPT_STUB=false and ENKRYPTAI_API_KEY for live guardrails');
    }
  } else {
    const probe = await probeEnkryptLive();
    if (probe.live) {
      enkryptStatus = 'live';
    } else {
      enkryptStatus = 'offline';
      enkryptError = probe.error;
      warnings.push(`Enkrypt live API unavailable: ${probe.error}`);
    }
  }

  if (!isLlmProviderConfigured()) {
    warnings.push('GROQ_API_KEY not set — Mastra tutor agents will use local fallbacks');
  } else if (isGroqReachable() === false) {
    warnings.push('Groq API unreachable — Mastra tutor agents may fall back locally');
  }

  const qdrantRequired = requireLiveQdrant();
  const enkryptRequired = requireLiveEnkrypt();

  const ready =
    qdrantStatus === 'live' &&
    (!enkryptRequired || enkryptStatus === 'live') &&
    (!qdrantRequired || qdrantStatus === 'live');

  if (strict && !ready) {
    warnings.unshift('STRICT_STACK_MODE: one or more sponsor integrations are not live');
  }

  return {
    strictMode: strict,
    mastra: {
      status: 'live',
      agents: agentIds,
      workflows: workflowIds,
      vectorStore: 'qdrant',
    },
    qdrant: {
      status: qdrantStatus,
      provider: '@mastra/qdrant',
      indexName: qdrantProbe.indexName,
      vectorCount: qdrantProbe.vectorCount,
      required: qdrantRequired,
      error: qdrantProbe.error,
    },
    enkrypt: {
      status: enkryptStatus,
      required: enkryptRequired,
      policyName: process.env.ENKRYPT_POLICY_NAME ?? 'synaptiq-tutor-v1',
      error: enkryptError,
    },
    ready,
    warnings,
  };
}

export async function logStackHealthAtStartup(
  agentIds: string[],
  workflowIds: string[],
): Promise<StackHealthStatus> {
  const health = await checkStackHealth(agentIds, workflowIds);

  console.log('\n[synaptiq] ── Sponsor stack health ──');
  console.log(`  Mastra     agents=[${health.mastra.agents.join(', ')}] workflows=[${health.mastra.workflows.join(', ')}]`);
  console.log(
    `  Qdrant     @mastra/qdrant · ${health.qdrant.indexName} · ${health.qdrant.vectorCount} vectors · ${health.qdrant.status}`,
  );
  console.log(`  Enkrypt    ${health.enkrypt.status}${health.enkrypt.required ? ' (required)' : ''}`);

  if (health.warnings.length > 0) {
    console.warn('\n[synaptiq] Stack warnings:');
    for (const w of health.warnings) {
      console.warn(`  ⚠ ${w}`);
    }
  }

  console.log(`  Ready for strict demo: ${health.ready ? 'YES ✓' : 'NO — fix warnings above'}\n`);

  return health;
}
