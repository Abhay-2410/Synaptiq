import { getBoardMeta } from '../curriculum/boards.js';
import type { AgentTrailStep, RetrievedChunk, TutorDraft, VerificationResult } from '../types.js';

function friendlyModelName(model: string): string {
  if (model === 'synaptiq-stem-solver') return 'built-in math & science solver';
  if (model === 'synaptiq-local-tutor') return 'offline tutor engine';
  if (/llama-3\.3-70b/i.test(model)) return 'Groq AI tutor (Llama 3.3 70B)';
  if (/llama-3\.1-8b/i.test(model)) return 'Groq AI (Llama 3.1 8B)';
  if (/groq/i.test(model)) return 'Groq AI tutor';
  return model.replace(/^mastra-/, 'Mastra ');
}

function formatTopics(chunks: RetrievedChunk[]): string {
  const topics = [...new Set(chunks.map((c) => c.metadata.topic).filter(Boolean))] as string[];
  if (topics.length === 0) return '';
  if (topics.length === 1) return topics[0]!;
  if (topics.length === 2) return `${topics[0]} and ${topics[1]}`;
  return `${topics.slice(0, 2).join(', ')}, and ${topics.length - 2} more`;
}

function verificationSummary(verification: VerificationResult): string {
  if (verification.verificationUnavailable) {
    return 'Safety check was temporarily unavailable — your answer was still delivered.';
  }
  if (verification.flags?.includes('enkrypt_rate_limited')) {
    return 'Enkrypt AI was busy (rate limit), so the full safety scan could not run. Your answer was delivered with an advisory note.';
  }
  if (verification.flags?.includes('enkrypt_timeout')) {
    return 'The safety check timed out — your answer was delivered with an advisory note.';
  }
  if (verification.status === 'verified') {
    return 'Enkrypt AI reviewed the answer — it looks grounded, safe, and relevant to your question.';
  }
  if (verification.status === 'flagged') {
    return verification.message ?? 'Enkrypt flagged the answer for a minor issue — review the verification badge above.';
  }
  if (verification.status === 'blocked') {
    return 'Enkrypt blocked this answer because it failed a safety or accuracy check.';
  }
  if (verification.corrected && verification.correctionNote) {
    return verification.correctionNote;
  }
  return verification.message ?? `Safety review status: ${verification.status}`;
}

function verificationDetails(verification: VerificationResult): string {
  if (verification.usedStub) {
    return 'Running in developer stub mode — not the live Enkrypt API.';
  }

  const checks = verification.checks;
  const parts: string[] = [];

  if (checks.hallucination.score != null) {
    parts.push(`Made-up facts check: ${checks.hallucination.passed ? 'passed' : 'failed'}`);
  } else {
    parts.push(`Made-up facts: ${checks.hallucination.passed ? 'ok' : 'issue'}`);
  }
  parts.push(`Syllabus match: ${checks.adherence.passed ? 'ok' : 'weak'}`);
  parts.push(`Student safety: ${checks.safety.passed ? 'ok' : 'issue'}`);
  parts.push(`On-topic: ${checks.relevancy.passed ? 'ok' : 'weak'}`);

  if (verification.flags?.includes('enkrypt_rate_limited')) {
    return `${parts.join(' · ')} · Live API was rate-limited, so scores may be advisory only.`;
  }

  return parts.join(' · ');
}

export function buildAgentTrail(args: {
  retrievedChunks: RetrievedChunk[];
  draft: TutorDraft;
  verification: VerificationResult;
  retrievalSource: string;
  classLabel: string;
  streamLabel: string;
  subjectId: string;
  boardId?: 'cbse' | 'icse';
}): AgentTrailStep[] {
  const {
    retrievedChunks,
    draft,
    verification,
    retrievalSource,
    classLabel,
    streamLabel,
    subjectId,
    boardId = 'cbse',
  } = args;

  const boardMeta = getBoardMeta(boardId);
  const syllabusLabel = boardMeta.syllabus;

  const topics = formatTopics(retrievedChunks);
  const chunkCount = retrievedChunks.length;

  return [
    {
      id: 'mastra-orchestration',
      label: 'Mastra — pipeline coordinator',
      status: 'completed',
      summary:
        'Your doubt was processed through the Synaptiq pipeline: find syllabus notes → write explanation → safety check.',
      details:
        'Powered by Mastra workflow “synaptiq-doubt-pipeline” with Tutor, Quick Check, and Retriever agents working together.',
    },
    {
      id: 'retrieval',
      label: 'Qdrant — syllabus search',
      status: chunkCount > 0 ? 'completed' : 'flagged',
      summary:
        chunkCount > 0
          ? `Found ${chunkCount} matching ${syllabusLabel} note${chunkCount === 1 ? '' : 's'} in the syllabus database${topics ? `: ${topics}` : ''}.`
          : `No close syllabus match was found — the tutor answered from general ${boardMeta.label} curriculum knowledge instead.`,
      details:
        chunkCount > 0
          ? `Searched ${classLabel}${streamLabel}, subject ${subjectId} via ${
              retrievalSource === 'corpus-fallback'
                ? 'local corpus fallback (Qdrant had no strong match)'
                : 'Qdrant (mastra-qdrant)'
            }.`
          : `Qdrant search returned no close match (${retrievalSource}) for ${classLabel}${streamLabel}, subject ${subjectId}.`,
    },
    {
      id: 'tutor',
      label: 'AI Tutor — wrote your answer',
      status: 'completed',
      summary: `Generated a step-by-step explanation using the ${friendlyModelName(draft.model)}.`,
      details:
        chunkCount > 0
          ? `Grounded in ${chunkCount} retrieved syllabus chunk${chunkCount === 1 ? '' : 's'} with ${draft.reasoningSteps.length} reasoning step${draft.reasoningSteps.length === 1 ? '' : 's'}.`
          : `No retrieved chunks — answered from built-in curriculum knowledge (${draft.reasoningSteps.length} reasoning steps).`,
    },
    {
      id: 'verification',
      label: 'Enkrypt AI — safety review',
      status: verification.verificationUnavailable
        ? 'flagged'
        : verification.status === 'verified'
          ? 'completed'
          : verification.status === 'blocked'
            ? 'blocked'
            : 'flagged',
      summary: verificationSummary(verification),
      details: verificationDetails(verification),
    },
    {
      id: 'final',
      label: 'Delivered to you',
      status: verification.status === 'blocked' ? 'blocked' : 'completed',
      summary:
        verification.status === 'blocked'
          ? 'This answer could not be shown because it failed the safety review.'
          : 'Your final answer appears above — including any step-by-step working and Quick Challenge.',
      details:
        verification.status === 'blocked'
          ? 'Try rephrasing your question or asking about a different part of the topic.'
          : verification.status === 'verified'
            ? 'All pipeline stages completed successfully.'
            : 'Answer delivered — see the verification badge for any advisory notes.',
    },
  ];
}
