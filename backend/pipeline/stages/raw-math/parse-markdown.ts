import type { RawMathStep } from './quadratic.js';

export function parseRawMathMarkdown(markdown: string): { title: string; steps: RawMathStep[] } {
  const titleMatch = markdown.match(/^###\s+(.+)$/m);
  const title = titleMatch?.[1]?.trim() ?? 'Step-by-step working';

  const steps: RawMathStep[] = [];
  const stepRegex = /\*\*(\d+)\.\*\*\s*(?:`([^`]+)`|(\$[\s\S]+?\$))\s*\n\*([^*]+)\*/g;
  let match: RegExpExecArray | null;

  while ((match = stepRegex.exec(markdown)) !== null) {
    steps.push({
      equation: (match[2] ?? match[3] ?? '').trim(),
      explanation: match[4].trim(),
    });
  }

  return { title, steps };
}
