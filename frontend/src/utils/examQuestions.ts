export interface ParsedExamQuestion {
  number: number;
  marks: string;
  prompt: string;
  hint?: string;
}

export interface ParsedExamQuestionAnswer {
  intro: string;
  questions: ParsedExamQuestion[];
  footer?: string;
}

const FOOTER_RE =
  /(?:\n|^)\*?(?:Try (?:to solve|answering)|If you need help)[\s\S]*$/i;

const QUESTION_LINE_PATTERNS: RegExp[] = [
  /^#{3,4}\s+Question\s+(\d+)\s*[·•]\s*(.+)$/i,
  /^\*\*Question\s+(\d+)\s*\(([^)]+)\)\*\*$/i,
  /^\*\*Question\s*\(([^)]+)\)\*\*$/i,
  /^Question\s+(\d+)\s*[·•]\s*(.+)$/i,
  /^Question\s+(\d+)\s*[-–]\s*(.+)$/i,
];

function extractFooter(text: string): { body: string; footer?: string } {
  const match = text.match(FOOTER_RE);
  if (!match) return { body: text };
  const footer = match[0].replace(/^\n/, '').replace(/^\*|\*$/g, '').trim();
  return { body: text.slice(0, match.index).trim(), footer };
}

function parseQuestionHeading(line: string): { number: number; marks: string } | null {
  const trimmed = line.trim();
  for (const pattern of QUESTION_LINE_PATTERNS) {
    const m = trimmed.match(pattern);
    if (!m) continue;

    if (pattern === QUESTION_LINE_PATTERNS[2]) {
      return { number: 0, marks: m[1]!.trim() };
    }

    if (m[1] && m[2]) {
      return { number: parseInt(m[1], 10), marks: m[2].trim() };
    }
  }
  return null;
}

function parseQuestionBlock(number: number, marks: string, body: string): ParsedExamQuestion {
  const cleaned = body.replace(FOOTER_RE, '').trim();
  const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
  const promptLines: string[] = [];
  const hintLines: string[] = [];

  for (const line of lines) {
    if (/^\*[^*].*\*$/.test(line)) {
      hintLines.push(line.replace(/^\*|\*$/g, ''));
    } else if (!/^(try to solve|if you need help|try answering)/i.test(line)) {
      promptLines.push(line);
    }
  }

  return {
    number,
    marks: marks.trim(),
    prompt: promptLines.join('\n').trim(),
    hint: hintLines.length > 0 ? hintLines.join(' ') : undefined,
  };
}

function hasExamQuestionSignals(text: string): boolean {
  return (
    /\bexam[- ]style question/i.test(text) ||
    /\bimportant exam questions?\b/i.test(text) ||
    /^#{3,4}\s+Question\s+\d+/im.test(text) ||
    /^\*\*Question(?:\s+\d+)?\s*\(/im.test(text) ||
    /^Question\s+\d+\s*[·•]/im.test(text) ||
    (/\bQ\d\b/.test(text) && /\bmarks?\b/i.test(text))
  );
}

/** Scan line-by-line so every question uses the same card layout. */
export function parseExamQuestionAnswer(content: string): ParsedExamQuestionAnswer | null {
  const { body, footer } = extractFooter(content.trim());
  if (!body || !hasExamQuestionSignals(body)) return null;

  const lines = body.split('\n');
  const introLines: string[] = [];
  const questions: ParsedExamQuestion[] = [];
  let i = 0;
  let autoNumber = 0;

  while (i < lines.length) {
    const heading = parseQuestionHeading(lines[i]!);
    if (!heading) {
      introLines.push(lines[i]!);
      i++;
      continue;
    }

    const number = heading.number > 0 ? heading.number : ++autoNumber;
    const marks = heading.marks;
    i++;
    const bodyLines: string[] = [];

    while (i < lines.length && !parseQuestionHeading(lines[i]!)) {
      bodyLines.push(lines[i]!);
      i++;
    }

    questions.push(parseQuestionBlock(number, marks, bodyLines.join('\n')));
  }

  if (questions.length === 0) return null;

  const intro = introLines
    .join('\n')
    .replace(FOOTER_RE, '')
    .replace(/^---+$/gm, '')
    .trim();

  return { intro, questions, footer };
}
