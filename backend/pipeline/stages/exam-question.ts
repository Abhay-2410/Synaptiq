import type { AnswerMode } from './chunk-focus.js';
import { cleanChapterLabel, extractDiscipline } from './chunk-focus.js';
import { SUBJECT_META, type SubjectKey } from '../curriculum/catalog.js';
import type { DoubtRequest, RetrievedChunk } from '../types.js';

/** True when the student wants practice/board questions, not an explanation. */
export function isExamQuestionRequest(text: string): boolean {
  const q = text.toLowerCase();

  return (
    /\b(exam[- ]style|board[- ]style|sample|practice|model)\s+question\b/.test(q) ||
    /\bgive\s+me\s+(an?\s+)?(exam|board|practice|sample)[- ]style\b/.test(q) ||
    /\bgive\s+me\s+(a|an|\d+|two|three)\s+(practice|sample|board|exam)\s+question\b/.test(q) ||
    /\b(get|give)\s+me\s+(\d+|two|three|a few)?\s*(important\s+)?(questions?|things)?\s*(that\s+)?(could|can|might)\s+be\s+asked\b/.test(q) ||
    /\bimportant\s+questions?\s+(on|about|from|in)\b/.test(q) ||
    /\bquestions?\s+(that\s+)?(could|can|might)\s+be\s+asked\b/.test(q) ||
    /\b(likely|expected|probable|possible)\s+(exam\s+)?questions?\b/.test(q) ||
    /\bwhat\s+questions?\s+(can|could|might)\s+(be\s+)?(asked|come)\b/.test(q) ||
    /\bask\s+me\s+(a|an|\d+)\s+question\b/.test(q) ||
    /\btest\s+me\s+(on|with|about)\b/.test(q) ||
    /\bquestion\s+for\s+(practice|revision|exam)\b/.test(q) ||
    /\bi\s+want\s+(\d+|two|three|a|an)\s+(practice|exam|important)\s+question\b/.test(q) ||
    /\bset\s+(\d+|two|three|a|an)\s+question\b/.test(q) ||
    /\b\d+\s+important\b.*\b(asked|question)/.test(q) ||
    /\btwo\s+important\b.*\b(asked|question)/.test(q)
  );
}

interface QuestionSpec {
  marks: number;
  prompt: string;
  formatHint?: string;
}

function marksLabel(marks: number): string {
  return marks === 1 ? '1 mark' : `${marks} marks`;
}

function requestedQuestionCount(text: string): number {
  const q = text.toLowerCase();
  const digit = q.match(/\b(\d+)\s+(important\s+)?(questions?|things)?/);
  if (digit?.[1]) {
    const n = parseInt(digit[1], 10);
    if (n >= 1 && n <= 5) return n;
  }
  if (/\b(two|2)\b/.test(q) && /\b(question|asked|important)\b/.test(q)) return 2;
  if (/\b(three|3)\b/.test(q) && /\b(question|asked|important)\b/.test(q)) return 3;
  if (/\ba few\b/.test(q)) return 3;
  return 1;
}

function topicFromDoubtText(text: string): string | undefined {
  const q = text.toLowerCase();

  if (/\bconstitution\b/.test(q)) return 'The Indian Constitution';
  if (/\bsecular/.test(q)) return 'Secularism';
  if (/\b1857|revolt\b/.test(q)) return 'The Revolt of 1857';
  if (/\bnationalism|freedom struggle|gandhi\b/.test(q)) return 'Indian Nationalism';

  const onMatch = q.match(/\b(?:on|about|from|in)\s+(?:the\s+)?([a-z][a-z0-9\s/-]{2,40})/i);
  if (onMatch?.[1]) {
    const cleaned = onMatch[1]
      .replace(/\bclass\s+\d+\b/gi, '')
      .replace(/\b(math|mathematics|science|social|english|accountancy|economics)\b/gi, '')
      .replace(/[.?]+$/, '')
      .trim();
    if (cleaned.length > 2) {
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  if (/\bfractions?\b/.test(q)) return 'Fractions';
  if (/\bquadratic\b/.test(q)) return 'Quadratic equations';
  if (/\bphotosynthesis\b/.test(q)) return 'Photosynthesis';
  if (/\bdemocracy\b/.test(q)) return 'Democracy';
  return undefined;
}

function topicQuestionBank(
  topic: string,
  chapter: string | undefined,
  mode: AnswerMode,
  doubtText?: string,
): QuestionSpec[] {
  const blob = `${topic} ${chapter ?? ''} ${doubtText ?? ''}`.toLowerCase();

  if (mode === 'social-studies') {
    if (/constitution|preamble|fundamental right/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt:
            'What is the significance of the **Preamble** to the Indian Constitution? Mention any two ideals it proclaims.',
          formatHint: 'Name the ideals (e.g. justice, liberty, equality, fraternity) and explain briefly.',
        },
        {
          marks: 3,
          prompt:
            'Explain any **two Fundamental Rights** guaranteed by the Indian Constitution with suitable examples.',
          formatHint: 'Rights are in Articles 12–35 — pick two different rights, not just names.',
        },
        {
          marks: 4,
          prompt:
            'Describe **any three salient features** of the Indian Constitution.',
          formatHint: 'E.g. written constitution, federal structure, fundamental rights, amendment procedure.',
        },
        {
          marks: 2,
          prompt:
            'When did the Indian Constitution come into effect? What form of government does the Preamble declare?',
          formatHint: 'Date + republic/democratic keywords earn full marks.',
        },
        {
          marks: 3,
          prompt:
            'What are **Directive Principles of State Policy**? How are they different from Fundamental Rights?',
          formatHint: 'One line on each + one point of difference.',
        },
      ];
    }
    if (/secular/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt:
            'How is **Indian secularism** different from the Western model of secularism? Give two points.',
          formatHint: 'Mention State intervention and equal respect for all religions.',
        },
        {
          marks: 3,
          prompt:
            'Why is India called a **secular** country in the Preamble? Explain with one example.',
          formatHint: 'No official State religion + freedom of worship.',
        },
      ];
    }
    if (/1857|revolt|rebel/i.test(blob)) {
      return [
        {
          marks: 4,
          prompt:
            'Describe **any three causes** that led to the Revolt of 1857.',
          formatHint: 'Political, economic and military grievances with brief examples.',
        },
        {
          marks: 3,
          prompt:
            'Name **two leaders** of the Revolt of 1857 and the region associated with each.',
          formatHint: 'E.g. Rani Lakshmibai — Jhansi; Bahadur Shah Zafar — Delhi.',
        },
      ];
    }
    if (/democracy|equality|discrimination/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt:
            'Why is **equality** considered a core democratic ideal? How does the Indian Constitution protect it?',
          formatHint: 'One everyday example + one constitutional safeguard.',
        },
        {
          marks: 3,
          prompt:
            'What is meant by **universal adult franchise**? Why is it important in a democracy?',
          formatHint: 'Define + link to people choosing their representatives.',
        },
      ];
    }
    const discipline = extractDiscipline(chapter);
    if (discipline === 'Geography') {
      return [
        {
          marks: 3,
          prompt: `Write a short note on **${topic}** as studied in your Class syllabus.`,
          formatHint: 'Definition + two key facts + one map or data point.',
        },
        {
          marks: 3,
          prompt: `How does **${topic}** affect people's lives in India? Give two examples.`,
          formatHint: 'Connect concept to real places or human activities.',
        },
      ];
    }
    return [
      {
        marks: 4,
        prompt: `Analyse the significance of **${topic}**. Mention at least two key facts or events.`,
        formatHint: 'Use cause → event → consequence.',
      },
      {
        marks: 3,
        prompt: `Why is **${topic}** an important chapter for your Class exam?`,
        formatHint: 'Two syllabus-relevant points in 60–80 words.',
      },
    ];
  }

  if (mode === 'life-science' || mode === 'physical-science') {
    if (/photosynthesis/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt:
            'Explain the process of **photosynthesis**. Name the raw materials and products.',
          formatHint: 'You may draw a simple labelled diagram.',
        },
        {
          marks: 2,
          prompt:
            'Where does photosynthesis occur in a plant cell? Name the green pigment involved.',
          formatHint: 'Chloroplast + chlorophyll.',
        },
      ];
    }
    return [
      {
        marks: 3,
        prompt: `Explain **${topic}** with a suitable example from your NCERT chapter.`,
        formatHint: 'Define first, then describe the process or importance.',
      },
      {
        marks: 3,
        prompt: `Draw a labelled diagram related to **${topic}** and describe it briefly.`,
        formatHint: 'Label at least four parts in your notebook.',
      },
    ];
  }

  if (mode === 'math') {
    if (/fraction/i.test(blob)) {
      return [
        {
          marks: 2,
          prompt: 'Add: **2/3 + 5/6**. Express your answer in lowest terms.',
          formatHint: 'Find a common denominator before adding.',
        },
        {
          marks: 2,
          prompt: 'Which is greater: **3/4** or **5/6**? Show your working.',
          formatHint: 'Convert to equivalent fractions with the same denominator.',
        },
      ];
    }
    if (/quadratic/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt: 'Solve for x: **x² − 5x + 6 = 0** by factorisation.',
          formatHint: 'Write each factorised step clearly.',
        },
        {
          marks: 3,
          prompt: 'Find the roots of **x² − 9 = 0**.',
          formatHint: 'Use factorisation or the formula — show working.',
        },
      ];
    }
    return [
      {
        marks: 3,
        prompt: `Solve a standard **${topic}** problem from your textbook.`,
        formatHint: 'Show all working — marks are given for method.',
      },
      {
        marks: 2,
        prompt: `Define the key concept used in **${topic}** and solve one short numerical.`,
        formatHint: 'Definition (1 mark) + calculation (1 mark).',
      },
    ];
  }

  if (mode === 'commerce') {
    if (/accounting equation|assets.*liabilit/i.test(blob)) {
      return [
        {
          marks: 3,
          prompt:
            'State the **accounting equation**. If assets are ₹5,00,000 and liabilities are ₹2,00,000, find capital.',
          formatHint: 'Write the equation first, then substitute.',
        },
        {
          marks: 3,
          prompt:
            'A firm purchases furniture for ₹50,000 cash. Which accounts are affected? Show the accounting equation before and after.',
          formatHint: 'Assets swap — total assets unchanged; no liability change.',
        },
      ];
    }
    return [
      {
        marks: 3,
        prompt: `Define **${topic}** and explain its importance with one business example.`,
        formatHint: 'Definition + example with figures earns full marks.',
      },
      {
        marks: 4,
        prompt: `Compare **${topic}** with a related concept from the same chapter.`,
        formatHint: 'Two-column comparison or two short paragraphs.',
      },
    ];
  }

  if (mode === 'english') {
    if (/reported speech|direct speech/i.test(blob)) {
      return [
        {
          marks: 2,
          prompt:
            'Change into **reported speech**: She said, "I am preparing for my board exam."',
          formatHint: 'Watch tense change and pronoun shift.',
        },
        {
          marks: 2,
          prompt:
            'Change into **reported speech**: He said, "I have finished my homework."',
          formatHint: 'Present perfect → past perfect in reported form.',
        },
      ];
    }
    return [
      {
        marks: 3,
        prompt: `Write a short paragraph (80–100 words) demonstrating **${topic}**.`,
        formatHint: 'Clear topic sentence + supporting details.',
      },
      {
        marks: 2,
        prompt: `Identify and correct the error: a sentence related to **${topic}**.`,
        formatHint: 'State the rule you applied.',
      },
    ];
  }

  return [
    {
      marks: 3,
      prompt: `Write a short answer on **${topic}** suitable for your Class exam.`,
      formatHint: 'Aim for 80–100 words with clear points.',
    },
    {
      marks: 3,
      prompt: `Give two important points about **${topic}** that examiners often test.`,
      formatHint: 'Phrase as if answering a 3-mark question.',
    },
  ];
}

const SUBJECT_LABELS: Record<SubjectKey, string> = Object.fromEntries(
  (Object.keys(SUBJECT_META) as SubjectKey[]).map((key) => [key, SUBJECT_META[key].storageLabel]),
) as Record<SubjectKey, string>;

function subjectLabel(subjectId?: string): string {
  if (!subjectId) return 'your subject';
  return SUBJECT_LABELS[subjectId as SubjectKey] ?? subjectId.replace(/_/g, ' ');
}

export function buildExamQuestionAnswer(
  doubt: DoubtRequest,
  context: RetrievedChunk[],
  mode: AnswerMode,
): string {
  const boardId = doubt.boardId ?? 'cbse';
  const classLevel = doubt.classLevel ?? context[0]?.metadata.classLevel ?? 10;
  const topic = context[0]?.metadata.topic ?? topicFromDoubtText(doubt.text) ?? subjectLabel(doubt.subjectId);
  const chapter = context[0]?.metadata.chapter;
  const chapterLabel = cleanChapterLabel(chapter);
  const subject = subjectLabel(doubt.subjectId);
  const count = requestedQuestionCount(doubt.text);
  const bank = topicQuestionBank(topic, chapter, mode, doubt.text);
  const questions = bank.slice(0, Math.min(count, bank.length));
  const boardName = boardId === 'icse' ? 'ICSE' : 'CBSE';

  const topicLabel =
    chapterLabel && chapterLabel !== topic
      ? `**${chapterLabel}** (${topic})`
      : `**${topic}**`;

  const intro =
    questions.length === 1
      ? `Here is an **exam-style question** for **Class ${classLevel} ${subject} (${boardName})** on ${topicLabel}:`
      : `Here are **${questions.length} important exam questions** for **Class ${classLevel} ${subject} (${boardName})** on ${topicLabel}:`;

  const lines: string[] = [intro, ''];

  questions.forEach((spec, index) => {
    lines.push(`#### Question ${index + 1} · ${marksLabel(spec.marks)}`, '');
    lines.push(spec.prompt, '');
    if (spec.formatHint) {
      lines.push(`*${spec.formatHint}*`, '');
    }
  });

  lines.push(
    '',
    '*Try answering on your own first. Paste your attempt here for feedback, or ask me to explain any question step by step.*',
  );

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
