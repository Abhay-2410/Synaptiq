import type {
  MasteryState,
  QuickCheck,
  QuickCheckEvaluationResult,
  SubjectKey,
  RetrievedChunk,
} from '../types.js';

interface MasteryRecord {
  attempts: number;
  correct: number;
}

const masteryStore = new Map<string, Map<string, MasteryRecord>>();

function mapSubjectKey(value?: string, subjectKey?: SubjectKey): SubjectKey {
  if (subjectKey) return subjectKey;
  const normalized = (value ?? '').toLowerCase();
  if (normalized.includes('science') && !normalized.includes('political')) return 'science';
  if (normalized.includes('english')) return 'english';
  if (normalized.includes('social')) return 'social';
  if (normalized.includes('phys')) return 'physics';
  if (normalized.includes('chem')) return 'chemistry';
  if (normalized.includes('bio')) return 'biology';
  if (normalized.includes('account')) return 'accountancy';
  if (normalized.includes('business')) return 'business';
  if (normalized.includes('econom')) return 'economics';
  if (normalized.includes('history')) return 'history';
  if (normalized.includes('political')) return 'political_science';
  if (normalized.includes('math')) return 'math';
  return 'math';
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function getTopic(chunks: RetrievedChunk[]): string {
  return chunks[0]?.metadata.topic ?? 'General';
}

export function getMasteryState(
  sessionId: string,
  topic: string,
  subjectId: SubjectKey,
): MasteryState {
  const session = masteryStore.get(sessionId);
  const record = session?.get(topic);
  const attempts = record?.attempts ?? 0;
  const correct = record?.correct ?? 0;
  const score = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  return { topic, subjectId, attempts, correct, score };
}

function setMasteryState(sessionId: string, topic: string, correctAttempt: boolean): MasteryRecord {
  const session = masteryStore.get(sessionId) ?? new Map<string, MasteryRecord>();
  const current = session.get(topic) ?? { attempts: 0, correct: 0 };
  const updated: MasteryRecord = {
    attempts: current.attempts + 1,
    correct: current.correct + (correctAttempt ? 1 : 0),
  };
  session.set(topic, updated);
  masteryStore.set(sessionId, session);
  return updated;
}

export function createQuickCheck(
  doubt: string,
  chunks: RetrievedChunk[],
  subjectIdOverride?: SubjectKey,
): QuickCheck {
  const topic = getTopic(chunks);
  const subjectId =
    subjectIdOverride ??
    mapSubjectKey(chunks[0]?.metadata.subject, chunks[0]?.metadata.subjectKey);
  const lowerTopic = topic.toLowerCase();
  const lowerDoubt = doubt.toLowerCase();

  if (subjectId === 'math') {
    if (lowerTopic.includes('calculus') || /derivative|integral|limit/.test(lowerDoubt)) {
      return {
        topic,
        subjectId,
        question: 'Quick check: What does a derivative measure about a function?',
        expectedKeywords: ['rate', 'change', 'slope', 'tangent'],
      };
    }

    // Topic-aware quick checks for math topics (prevents irrelevant discriminant questions).
    if (
      lowerTopic.includes('quadratic') ||
      lowerTopic.includes('discriminant') ||
      /discriminant|b\^2\s*-\s*4ac/.test(lowerDoubt)
    ) {
      return {
        topic,
        subjectId,
        question:
          'Quick check: In a quadratic equation ax^2 + bx + c = 0, what does the discriminant b^2 - 4ac tell you?',
        expectedKeywords: ['discriminant', 'roots', 'real', 'complex'],
      };
    }

    if (lowerTopic.includes('polynomial')) {
      return {
        topic,
        subjectId,
        question:
          'Quick check: What is the degree of a polynomial (and how is it identified)?',
        expectedKeywords: ['degree', 'highest', 'power'],
      };
    }

    if (lowerTopic.includes('real numbers') || lowerTopic.includes('number systems') || lowerTopic.includes('rational') || lowerTopic.includes('irrational')) {
      return {
        topic,
        subjectId,
        question: 'Quick check: What is the key difference between rational and irrational numbers?',
        expectedKeywords: ['rational', 'irrational', 'fraction', 'non-terminating'],
      };
    }

    if (lowerTopic.includes('arithmetic progression') || lowerTopic.includes('arithmetic') || lowerTopic === 'ap') {
      return {
        topic,
        subjectId,
        question:
          'Quick check: In an arithmetic progression, what does the common difference control?',
        expectedKeywords: ['common', 'difference', 'constant'],
      };
    }

    // Default: topic-based “core idea” quick check.
    const words = lowerTopic
      .split(/\s+/)
      .filter(Boolean)
      .filter((w) => !['and', 'of', 'in', 'on', 'to', 'the', 'a', 'an', 'for'].includes(w));
    const expectedKeywords = words.slice(0, 3);
    return {
      topic,
      subjectId,
      question: `Quick check: State one key idea from ${titleCase(topic)}.`,
      expectedKeywords: expectedKeywords.length > 0 ? expectedKeywords : topic.toLowerCase().split(/\s+/).slice(0, 2),
    };
  }

  if (subjectId === 'physics') {
    return {
      topic,
      subjectId,
      question:
        "Quick check: Using Newton's second law, how are force, mass, and acceleration related?",
      expectedKeywords: ['f=ma', 'force', 'mass', 'acceleration'],
    };
  }

  if (subjectId === 'biology' || subjectId === 'science') {
    if (lowerTopic.includes('germination') || /seed|germinate/.test(lowerDoubt)) {
      return {
        topic,
        subjectId,
        question: 'Quick check: Name the three main conditions a seed needs to germinate.',
        expectedKeywords: ['water', 'oxygen', 'temperature', 'warmth'],
      };
    }
    if (lowerTopic.includes('photosynthesis') || /photosynthesis|chlorophyll/.test(lowerDoubt)) {
      return {
        topic,
        subjectId,
        question:
          'Quick check: Where in the leaf cell does photosynthesis mainly occur, and which pigment traps light?',
        expectedKeywords: ['chloroplast', 'chlorophyll', 'leaf'],
      };
    }
    return {
      topic,
      subjectId,
      question: 'Quick check: Give one key difference between mitosis and meiosis in outcomes.',
      expectedKeywords: ['mitosis', 'meiosis', 'identical', 'gamete', 'haploid', 'diploid'],
    };
  }

  if (subjectId === 'chemistry') {
    return {
      topic,
      subjectId,
      question: 'Quick check: What must be balanced when writing a chemical equation?',
      expectedKeywords: ['atoms', 'mass', 'coefficient', 'conservation'],
    };
  }

  if (subjectId === 'english') {
    return {
      topic,
      subjectId,
      question: 'Quick check: What is the main idea of a paragraph often called?',
      expectedKeywords: ['topic', 'main', 'idea', 'theme', 'central'],
    };
  }

  if (subjectId === 'social' || subjectId === 'history' || subjectId === 'political_science') {
    return {
      topic,
      subjectId,
      question: `Quick check: Name one key event or concept from ${titleCase(topic)}.`,
      expectedKeywords: topic.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 3),
    };
  }

  if (subjectId === 'economics' || subjectId === 'accountancy' || subjectId === 'business') {
    return {
      topic,
      subjectId,
      question: `Quick check: State one core definition from ${titleCase(topic)}.`,
      expectedKeywords: topic.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 2),
    };
  }

  return {
    topic,
    subjectId,
    question: `Quick check: What is one core idea from ${titleCase(topic)}?`,
    expectedKeywords: topic.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 2),
  };
}

export function evaluateQuickCheck(
  sessionId: string,
  quickCheck: QuickCheck,
  userAnswer: string,
): QuickCheckEvaluationResult {
  const answer = userAnswer.toLowerCase();
  const keywordHits = quickCheck.expectedKeywords.filter((kw) => answer.includes(kw.toLowerCase()));
  const correct = keywordHits.length >= Math.min(2, quickCheck.expectedKeywords.length);

  setMasteryState(sessionId, quickCheck.topic, correct);
  const mastery = getMasteryState(sessionId, quickCheck.topic, quickCheck.subjectId);

  const feedback = correct
    ? 'Nice work — your explanation captures the key concept.'
    : `Not quite yet. Try including: ${quickCheck.expectedKeywords.slice(0, 3).join(', ')}.`;

  return { correct, feedback, mastery };
}
