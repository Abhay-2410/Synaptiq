export interface ParsedMathStep {
  equation: string;
  explanation: string;
}

export function parseRawMathMarkdown(markdown: string): { title: string; steps: ParsedMathStep[] } {
  const titleMatch = markdown.match(/^###\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? 'Solution';

  const steps: ParsedMathStep[] = [];
  const stepRegex = /\*\*\d+\.\*\*\s*(?:`([^`]+)`|(\$[\s\S]+?\$))\s*\n\*([^*]+)\*/g;
  let match: RegExpExecArray | null;

  while ((match = stepRegex.exec(markdown)) !== null) {
    steps.push({
      equation: (match[1] ?? match[2] ?? '').trim(),
      explanation: match[3].trim(),
    });
  }

  return { title, steps };
}
