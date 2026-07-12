/** Strip internal / developer-facing copy before showing answers to students. */
export function formatStudentAnswer(
  content: string,
  options?: { hasStepByStep?: boolean; hasRetrievedMaterial?: boolean; hasQuickCheck?: boolean },
): string {
  let text = content.trim();
  if (!text) return text;

  if (options?.hasStepByStep || options?.hasRetrievedMaterial) {
    text = text.replace(/\*\*Your doubt:\*\*[^\n]*\n*/gi, '');
    text = text.replace(/No matching course material found\.[^\n]*/gi, '');
    text = text.replace(/Nothing in the \*\*[^*]+\*\* NCERT deck matched[^\n]*/gi, '');
    text = text.replace(/\*\*Tip:\*\*[\s\S]*?(?=\n\n|$)/gi, '');
    text = text.replace(/If you retry with clearer wording[^\n]*/gi, '');
    // Legacy: strip duplicated step-by-step block when shown in the panel below
    text = text.replace(/\n### Step-by-step working[\s\S]*$/i, '').trim();
  }

  if (options?.hasQuickCheck) {
    text = text.replace(/\*Quick check:\*[^*]+\*/gi, '');
    text = text.replace(/\*Quick check:[^*]+\*/gi, '');
    text = text.replace(/(?:^|\n)\*?Quick check:\*?\s*[^\n]+/gi, '');
  }

  text = text.replace(/Enkrypt note:[^\n]*/gi, '');
  text = text.replace(/\n{3,}/g, '\n\n').trim();

  return text;
}

export function answerLooksEmpty(content: string): boolean {
  const cleaned = formatStudentAnswer(content, { hasStepByStep: true });
  return cleaned.replace(/[*#\s]/g, '').length < 20;
}
