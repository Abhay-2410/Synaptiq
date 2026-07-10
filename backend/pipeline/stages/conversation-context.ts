import type { ChatTurn } from '../types.js';

const MAX_HISTORY_TURNS = 6;
const MAX_CHARS_PER_TURN = 2_400;

/** Student refers to an earlier message in the same chat. */
export function isFollowUpRequest(text: string): boolean {
  const q = text.toLowerCase().trim();
  if (/\b(answer|solve|explain) (those|them|it|these)\b/.test(q)) return true;
  if (/\b(for|from|about) (the )?(above|previous|earlier)\b/.test(q)) return true;
  if (/\b(the )?(above|previous|earlier) (question|questions|example|examples|points?)\b/.test(q)) return true;
  if (/\bgive me (some )?examples?\b/.test(q) && /\b(above|these|those|for the)\b/.test(q)) return true;
  if (/\bmore examples?\b/.test(q) && priorReferenceHint(q)) return true;
  return false;
}

function priorReferenceHint(q: string): boolean {
  return /\b(above|that|this topic|same)\b/.test(q);
}

export function trimConversationHistory(turns: ChatTurn[] | undefined): ChatTurn[] {
  if (!turns?.length) return [];
  return turns
    .filter((t) => t.content.trim().length > 0)
    .slice(-MAX_HISTORY_TURNS)
    .map((t) => ({
      role: t.role,
      content:
        t.content.length > MAX_CHARS_PER_TURN
          ? `${t.content.slice(0, MAX_CHARS_PER_TURN)}…`
          : t.content,
    }));
}

export function formatConversationHistory(turns: ChatTurn[]): string {
  if (turns.length === 0) return '';
  return turns
    .map((t) => `${t.role === 'user' ? 'Student' : 'Tutor'}: ${t.content.trim()}`)
    .join('\n\n');
}

export function buildFollowUpInstructions(doubtText: string, turns: ChatTurn[]): string {
  const lastAssistant = [...turns].reverse().find((t) => t.role === 'assistant');
  const wantsExamples = /\bexamples?\b/i.test(doubtText);
  const wantsAnswers = /\b(answer|solve|solution|work(ed)? out)\b/i.test(doubtText);

  const lines = [
    'FOLLOW-UP REQUEST — answer ONLY what the student is asking now, using the conversation above.',
    'Do NOT introduce unrelated topics or examples that were not in the prior exchange.',
    'Do NOT open with filler like "Let\'s explore" or "To understand this, let\'s break it down".',
  ];

  if (lastAssistant) {
    lines.push(
      `The tutor's previous message is the anchor — stay on that topic and those question(s).`,
    );
  }

  if (wantsExamples || wantsAnswers) {
    lines.push(
      wantsExamples && wantsAnswers
        ? 'Provide **worked examples or sample answers** for each numbered question from the prior tutor message — one section per question, with real numbers and units where applicable.'
        : wantsExamples
          ? 'Provide **concrete worked examples** tied to each question or point from the prior tutor message — not a generic lecture on the chapter.'
          : 'Provide **direct answers** to the specific question(s) from the prior tutor message — structured, precise, and exam-ready.',
    );
    lines.push(
      'Use headings like ### Example for Question 1, ### Example for Question 2, etc., matching the numbering in the prior message.',
    );
  }

  return lines.join('\n');
}
