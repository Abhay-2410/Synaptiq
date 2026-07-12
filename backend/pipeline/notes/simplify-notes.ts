import { tutorAgent } from '../../agents/index.js';
import { getLlmProvider, isLlmProviderConfigured } from '../../agents/llm-provider.js';
import { SUBJECT_META } from '../curriculum/catalog.js';
import { studentBoardPhrase } from '../curriculum/boards.js';
import { resolveAnswerMode } from '../stages/chunk-focus.js';
import { tutorModeInstructions } from '../stages/tutor-synthesis.js';
import { withTimeout } from '../lib/with-timeout.js';
import { logStageEnd, logStageStart } from '../lib/pipeline-log.js';
import type { DoubtRequest } from '../types.js';
import type { ExtractionQuality } from './types.js';
import type { ResolvedNotesContext } from './detect-subject.js';
import { fetchNotesSyllabusContext } from './syllabus-enrich.js';
import { isClearlyGarbled } from './quality.js';

const SIMPLIFY_TIMEOUT_MS = Number(process.env.NOTES_SIMPLIFY_TIMEOUT_MS) || 45_000;

const NOTES_INSTRUCTION = `You are improving a student's handwritten or typed class notes for exam revision.

Your job has THREE parts — do all of them:

1. **Preserve & clarify** — Rewrite the student's notes in clear, class-appropriate language. Keep EVERY real fact, formula, and definition from their upload. Fix obvious OCR typos only.

2. **Enrich where thin** — If key definitions, formulas, units, or exam-critical points are missing or barely mentioned, ADD them briefly from accurate CBSE/ICSE syllabus knowledge. Mark additions with a subtle tag like *(added for your revision)* at the end of that bullet or sentence.

3. **Examples** — Add 1–2 short worked examples or real-world illustrations when the topic benefits (especially math/science). If the student's notes already have examples, improve them rather than duplicating.

Use this markdown structure:

### [Main topic title]

[Clear organized explanation — short paragraphs and bullets]

### Key points

- 5–8 exam-ready bullet takeaways (mix of what was in the notes + any critical additions)

### Examples

- [1–2 concise examples with working if numerical; skip this section only if truly not applicable]

### Quick recap

- 2–3 one-line memory hooks for last-minute revision

If OCR text is garbled, say so honestly at the top — do not invent content you cannot see.`;

function buildNotesPrompt(
  extractedText: string,
  context: ResolvedNotesContext,
  extractionQuality: ExtractionQuality,
  syllabusBlock: string,
): string {
  const doubt: DoubtRequest = {
    text: extractedText.slice(0, 12_000),
    boardId: context.boardId,
    subjectId: context.subjectId,
    classLevel: context.classLevel,
    stream: context.streamId,
  };

  const mode = resolveAnswerMode(doubt, []);
  const modeBlock = tutorModeInstructions(mode, context.classLevel, 'explain');
  const subjectLabel = context.subjectLabel ?? SUBJECT_META[context.subjectId].label;

  const blocks: string[] = [
    NOTES_INSTRUCTION,
    '',
    extractionQuality === 'poor'
      ? 'WARNING: OCR quality is poor — be cautious, note uncertainty, and only clarify what you can read.'
      : '',
    '',
    `Student: ${studentBoardPhrase(context.boardId, context.classLevel)}`,
    `Subject: ${subjectLabel} (${context.subjectId})`,
    `Answer mode: ${mode}`,
    '',
    '--- Extracted notes (raw OCR / PDF text) ---',
    extractedText.slice(0, 12_000),
    '--- End extracted notes ---',
    '',
  ];

  if (syllabusBlock) {
    blocks.push(
      '--- Syllabus reference (use to fill gaps — do NOT copy verbatim) ---',
      syllabusBlock,
      '--- End syllabus reference ---',
      '',
    );
  }

  blocks.push(modeBlock, '', 'Output ONLY the simplified notes inside [[ANSWER]] ... [[REASONING_STEPS]] with a brief reasoning trail.');

  return blocks.filter(Boolean).join('\n');
}

function parseAnswer(raw: string): string {
  const match = raw.match(/\[\[ANSWER\]\]\s*([\s\S]*?)\s*\[\[REASONING_STEPS\]\]/);
  return match?.[1]?.trim() || raw.trim();
}

export async function simplifyNotesText(
  extractedText: string,
  context: ResolvedNotesContext,
  extractionQuality: ExtractionQuality,
): Promise<{ markdown: string; model: string; warnings: string[] }> {
  const warnings: string[] = [];

  if (context.subjectDetection.adjustedFromUser) {
    warnings.push(
      `We detected these notes are about ${context.subjectLabel} — your PDF is labelled accordingly.`,
    );
  }

  if (extractionQuality === 'failed' || isClearlyGarbled(extractedText)) {
    throw new Error(
      'We could not read your notes clearly. Please retake the photo in good light, hold the camera steady, and upload again.',
    );
  }

  if (extractionQuality === 'poor') {
    warnings.push(
      'Some parts of your notes were hard to read — the simplification may be incomplete. Try a clearer photo if anything looks wrong.',
    );
  }

  if (!isLlmProviderConfigured() || process.env.TUTOR_USE_LLM === 'false') {
    return {
      markdown: `### ${context.subjectLabel} notes\n\n${extractedText}\n\n*LLM unavailable — showing extracted text only. Set GROQ_API_KEY for full simplification.*`,
      model: 'extract-only',
      warnings,
    };
  }

  logStageStart('notes-enrich', 'syllabus context for gap-filling');
  const syllabusBlock = await fetchNotesSyllabusContext(extractedText, context);
  logStageEnd('notes-enrich', syllabusBlock ? 'syllabus chunks loaded' : 'no syllabus match');

  const prompt = buildNotesPrompt(extractedText, context, extractionQuality, syllabusBlock);
  logStageStart('notes-simplify', `provider=${getLlmProvider()} subject=${context.subjectLabel}`);

  const result = await withTimeout(
    tutorAgent.generate(prompt),
    SIMPLIFY_TIMEOUT_MS,
    'Notes simplification',
  );

  if (!result.text?.trim()) {
    throw new Error('Tutor agent returned an empty simplification.');
  }

  const markdown = parseAnswer(result.text);
  logStageEnd('notes-simplify', `len=${markdown.length}`);

  return {
    markdown,
    model: String(result.response?.modelId ?? 'mastra-tutor'),
    warnings,
  };
}
