import type { AnswerMode } from './chunk-focus.js';
import { cleanChapterLabel, extractDiscipline } from './chunk-focus.js';

export type AnswerIntent = 'define' | 'solve' | 'compare' | 'explain' | 'general';

export interface KeyPointItem {
  label: string;
  explanation: string;
}

export interface StructuredAnswerParts {
  topic: string;
  subtitle?: string;
  overview: string;
  keyItems: KeyPointItem[];
  footer?: string;
  /** Shown in the answer for math when raw working follows in the panel */
  mathWorkingHint?: boolean;
}

export function formatStructuredAnswer(parts: StructuredAnswerParts): string {
  const lines: string[] = [`**${parts.topic}**`];

  if (parts.subtitle) lines.push(`*${parts.subtitle}*`);
  lines.push('', '### Overview', '', parts.overview.trim(), '', '### Key points explained', '');

  parts.keyItems.forEach((item, index) => {
    lines.push(`${index + 1}. **${item.label}**`);
    lines.push(`   ${item.explanation.trim()}`);
    lines.push('');
  });

  if (parts.mathWorkingHint) {
    lines.push('### Step-by-step working');
    lines.push('');
    lines.push('_See the worked calculation below — each line shows the equation and what we do next._');
    lines.push('');
  }

  if (parts.footer) lines.push(parts.footer.trim());

  return lines.join('\n').trim();
}

/** Turn NCERT snippet paragraphs into one labelled key-point row per idea. */
export function toKeyPointItems(texts: string[]): KeyPointItem[] {
  const items: KeyPointItem[] = [];

  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    items.push(...parseChunkTextToKeyPoints(trimmed));
  }

  return dedupeKeyItems(items).slice(0, 10);
}

function parseChunkTextToKeyPoints(text: string): KeyPointItem[] {
  const segments = splitDefinitionSegments(text);
  if (segments.length > 0) return segments;
  return [makeKeyPointFromParagraph(text)];
}

/**
 * Split compact NCERT lines such as:
 * "Sole proprietorship: easy formation, full control. Partnership: agreement, shared profit."
 */
function splitDefinitionSegments(paragraph: string): KeyPointItem[] {
  const trimmed = paragraph.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(
    /\.\s+(?=(?:[A-Z][A-Za-z0-9'()/&\- ]{1,44}:|[A-Z]{2,6}\b))/,
  );
  const items: KeyPointItem[] = [];

  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    if (!part.endsWith('.')) part += '.';

    const colonIdx = part.indexOf(':');
    if (colonIdx > 0 && colonIdx < 55) {
      const label = part.slice(0, colonIdx).trim();
      const body = part.slice(colonIdx + 1).trim().replace(/\.$/, '');
      items.push({ label, explanation: expandDefinitionExplanation(label, body) });
      continue;
    }

    items.push(parseSentenceWithoutColon(part));
  }

  return items;
}

function parseSentenceWithoutColon(sentence: string): KeyPointItem {
  const trimmed = sentence.replace(/\.$/, '').trim();
  const acronym = trimmed.match(/^([A-Z]{2,6})\s+(.+)$/);
  if (acronym) {
    const label = acronym[1]!;
    const rest = acronym[2]!.trim();
    if (label === 'HUF' && /^governed by/i.test(rest)) {
      return {
        label,
        explanation:
          '**HUF** (Hindu Undivided Family) is a business form governed by Hindu law, where the eldest member (karta) manages family business and property.',
      };
    }
    return { label, explanation: expandDefinitionExplanation(label, rest) };
  }
  return makeKeyPointFromParagraph(trimmed + '.');
}

function labelIntro(label: string): string | null {
  switch (label.toLowerCase()) {
    case 'sole proprietorship':
      return 'A **sole proprietorship** is a business owned and run by a single individual.';
    case 'partnership':
      return 'A **partnership** is formed when two or more persons agree to carry on a business together and share profits or losses.';
    case 'cooperative':
      return 'A **cooperative** is a business organisation owned, controlled, and used by its members for mutual benefit.';
    default:
      return null;
  }
}

function expandDefinitionExplanation(label: string, body: string): string {
  const cleaned = body.replace(/[.;]+$/, '').trim();
  if (!cleaned) {
    return `**${label}** is an important term in this chapter — see your NCERT textbook for the full definition.`;
  }

  if (cleaned.includes(';')) {
    const clauses = cleaned.split(/\s*;\s*/).filter(Boolean);
    const sentences: string[] = [];

    const first = clauses[0]?.trim() ?? '';
    if (first.includes(',') && /^separate legal entity/i.test(first)) {
      sentences.push(
        'It is a **separate legal entity** from its owners, with **limited liability** and **perpetual succession**.',
      );
    } else if (first.includes(',')) {
      const traits = first.split(/\s*,\s*/).map((t) => t.trim()).filter(Boolean);
      sentences.push(`Its main features are ${traits.join(', ')}.`);
    } else if (first) {
      sentences.push(first.endsWith('.') ? first : `${first.charAt(0).toUpperCase()}${first.slice(1)}.`);
    }

    for (const clause of clauses.slice(1)) {
      const c = clause.trim();
      if (/^complex formation/i.test(c)) {
        sentences.push('Its formation process is relatively complex compared to simpler forms like sole proprietorship.');
      } else if (/^democratic control/i.test(c)) {
        sentences.push('It follows democratic control in decision-making.');
      } else {
        sentences.push(c.endsWith('.') ? c : `${c.charAt(0).toUpperCase()}${c.slice(1)}.`);
      }
    }

    return `**${label}** — ${sentences.join(' ')}`;
  }

  const hasVerb = /\b(is|are|means|involves|refers|governed|has|have|includes|allows|requires)\b/i.test(
    cleaned,
  );

  if (!hasVerb && cleaned.includes(',')) {
    const traits = cleaned.split(/\s*,\s*/).map((t) => t.trim()).filter(Boolean);
    if (traits.length >= 2) {
      const last = traits.pop()!;
      const list = traits.length > 0 ? `${traits.join(', ')}, and ${last}` : last;
      const intro = labelIntro(label);
      const featureLine = `Key features include ${list}.`;
      return intro ? `${intro} ${featureLine}` : `A **${label.toLowerCase()}** has the following features: ${list}.`;
    }
  }

  if (/^(is|are|means|involves|governed|has|have)\b/i.test(cleaned)) {
    return `**${label}** ${cleaned}${cleaned.endsWith('.') ? '' : '.'}`;
  }

  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
  return `**${label}** refers to ${lower}${cleaned.endsWith('.') ? '' : '.'}`;
}

function makeKeyPointFromParagraph(paragraph: string): KeyPointItem {
  const colonIdx = paragraph.indexOf(':');
  if (colonIdx > 0 && colonIdx < 55) {
    const label = paragraph.slice(0, colonIdx).trim();
    const body = paragraph.slice(colonIdx + 1).trim();
    return { label, explanation: expandDefinitionExplanation(label, body) };
  }

  const firstSentence =
    paragraph.split(/(?<=[.!?])\s+/).find((s) => s.trim().length > 8) ?? paragraph;
  const clean = firstSentence.replace(/[.!?]+$/, '').trim();
  const label =
    clean.length > 55 ? `${clean.slice(0, 52).replace(/\s+\S*$/, '')}…` : clean;

  const explanation =
    paragraph.trim().length > clean.length + 10
      ? paragraph.trim()
      : `${clean.charAt(0).toUpperCase()}${clean.slice(1)}${clean.endsWith('.') ? '' : '.'}.`;

  return { label, explanation };
}

function dedupeKeyItems(items: KeyPointItem[]): KeyPointItem[] {
  const seen = new Set<string>();
  const out: KeyPointItem[] = [];
  for (const item of items) {
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function buildOverviewFromContext(options: {
  topic: string;
  doubt: string;
  mode: AnswerMode;
  chapter?: string;
  classLevel?: number;
  intent?: AnswerIntent;
  keyItemCount?: number;
}): string {
  const { topic, doubt, mode, chapter, classLevel, intent = 'general', keyItemCount = 0 } =
    options;
  const discipline = extractDiscipline(chapter);
  const chapterLabel = cleanChapterLabel(chapter);
  const classHint = classLevel ? `Class ${classLevel} NCERT` : 'your syllabus';
  const question = doubt.replace(/\?+$/, '').trim();
  const qLower = question.toLowerCase();

  if (mode === 'commerce') {
    const scope = chapterLabel || topic;
    if (intent === 'compare' || /\b(difference|compare|vs|versus|distinguish)\b/.test(qLower)) {
      return (
        `**${topic}** (${classHint}, Business Studies — ${scope}) compares how different business forms work in practice. ` +
        `When you answer “${question}”, examiners expect you to contrast **ownership, liability, capital, and control** — not just list names. ` +
        `The ${keyItemCount || 'numbered'} points below give a **clear definition of each form** so you can compare them confidently.`
      );
    }
    if (/\b(what are|forms of|types of|kinds of)\b/.test(qLower)) {
      return (
        `**${topic}** is a foundational topic in ${classHint} Business Studies (${scope}). ` +
        `A business can be organised in several legal forms — each with different rules for **who owns it**, **how much risk the owners bear**, and **how decisions are made**. ` +
        `To answer “${question}”, state each form with a **proper definition and its main features**, as explained below.`
      );
    }
    return (
      `**${topic}** (${classHint}, ${scope}) is about how businesses are set up, run, and regulated. ` +
      `Your question — “${question}” — needs a **definitive, exam-ready answer** with clear definitions, not shorthand notes. ` +
      `Each key point below explains one idea in full sentences, aligned with your NCERT chapter.`
    );
  }

  if (mode === 'social-studies') {
    const scope = discipline && chapterLabel ? `${discipline} — ${chapterLabel}` : topic;
    if (intent === 'compare') {
      return (
        `**${topic}** (${classHint}, ${scope}) is best understood by **comparing** how ideas, events, or institutions differ. ` +
        `For “${question}”, write what each side means, then contrast causes, features, or impact. ` +
        `The points below give definitive explanations for each part of the comparison.`
      );
    }
    return (
      `**${topic}** is part of ${scope} in ${classHint}. ` +
      `To answer “${question}”, connect **causes, key events or ideas, and consequences** — not isolated dates or phrases. ` +
      `The overview sets the context; each numbered point below gives a **clear, descriptive explanation** you can use in your answer.`
    );
  }

  if (mode === 'life-science') {
    return (
      `**${topic}** (${classHint}) is a core concept in life processes and organisms. ` +
      `To answer “${question}”, link **structure → function → importance for the living system**. ` +
      `Each key point below defines one part of the process in proper scientific language, not bullet fragments.`
    );
  }

  if (mode === 'physical-science') {
    return (
      `**${topic}** (${classHint}) involves physical principles, laws, or numerical relationships. ` +
      `To answer “${question}”, state the **concept clearly**, name the **law or formula** where needed, and explain **what each term means**. ` +
      `The key points below give definitive definitions and relationships from your NCERT material.`
    );
  }

  if (mode === 'math') {
    return (
      `**${topic}** (${classHint}) is what your question targets. ` +
      `To answer “${question}”, first grasp the **definition and method**, then apply it step by step. ` +
      `The key points explain the concept in full; worked calculation steps follow when the problem is numerical.`
    );
  }

  if (mode === 'english') {
    return (
      `**${topic}** (${classHint}) relates to language, literature, or writing skills. ` +
      `For “${question}”, give a **clear explanation with examples** where helpful — definitions should be complete sentences. ` +
      `Each point below expands one idea so you can write a proper paragraph in exams.`
    );
  }

  if (intent === 'define' || /\b(what is|what are|define|definition)\b/.test(qLower)) {
    return (
      `**${topic}** (${classHint}) is what your question asks about. ` +
      `A complete answer needs a **proper definition** plus the main features or steps examiners expect — not a compressed list. ` +
      `Each numbered point below explains one part in descriptive, definitive language.`
    );
  }

  return (
    `**${topic}** (${classHint}) addresses your question: “${question}”. ` +
    `Read the overview for context, then use each key point as a **full explanation** — written as complete sentences you can adapt in exams.`
  );
}

export function quadraticSolveKeyPoints(b: number, c: number): KeyPointItem[] {
  return [
    {
      label: 'Standard form',
      explanation:
        'Write the equation as ax² + bx + c = 0 with all terms on one side and zero on the other.',
    },
    {
      label: 'Choose the method',
      explanation:
        'When the quadratic factorises easily, use **factoring**. Otherwise use the quadratic formula.',
    },
    {
      label: 'Find the factor pair',
      explanation: `Find two numbers that **multiply to ${c}** and **add to ${b}** — these split the middle term.`,
    },
    {
      label: 'Zero-product rule',
      explanation:
        'After factoring, set each bracket equal to zero to find the values of x.',
    },
  ];
}

export function mathConceptKeyPoints(topic: string): KeyPointItem[] {
  const lower = topic.toLowerCase();
  if (lower.includes('trigon')) {
    return [
      {
        label: 'Right-triangle ratios',
        explanation:
          'In a right triangle, **sin θ** = opposite/hypotenuse, **cos θ** = adjacent/hypotenuse, and **tan θ** = opposite/adjacent.',
      },
      {
        label: 'Identity to remember',
        explanation:
          '**sin²θ + cos²θ = 1** is the most used trigonometric identity for simplifying expressions.',
      },
      {
        label: 'Standard angles',
        explanation:
          'Memorise exact values at **0°, 30°, 45°, 60°, and 90°** — they appear in almost every board paper.',
      },
    ];
  }
  if (lower.includes('polynomial')) {
    return [
      {
        label: 'Degree of a polynomial',
        explanation:
          'The **degree** is the highest power of the variable that has a non-zero coefficient.',
      },
      {
        label: 'Zeroes and factors',
        explanation:
          'If **(x − a)** is a factor of a polynomial, then **x = a** is a zero (root) of that polynomial.',
      },
    ];
  }
  if (lower.includes('quadratic')) {
    return [
      {
        label: 'Standard form',
        explanation:
          'A **quadratic equation** has the form **ax² + bx + c = 0**, where **a ≠ 0**.',
      },
      {
        label: 'Discriminant',
        explanation:
          'The discriminant **Δ = b² − 4ac** tells whether roots are real and distinct, real and equal, or not real.',
      },
      {
        label: 'Quadratic formula',
        explanation:
          'When factorisation is difficult, use **x = (−b ± √Δ) / 2a** to find the roots directly.',
      },
    ];
  }
  return [];
}
