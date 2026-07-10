import { randomUUID } from 'node:crypto';
import type { ClassLevel, QuickCheck, SubjectKey, RetrievedChunk } from '../types.js';
import { SUBJECT_META } from '../curriculum/catalog.js';
import { stripChunkDisplayText } from './chunk-focus.js';
import { extractQuickCheckQuestion, topicFromDoubt } from './tutor-knowledge.js';

export interface QuestionDraft {
  question: string;
  expectedAnswer: string;
  evaluationRubric?: string;
  difficulty: 'recall' | 'apply' | 'reason';
}

function subjectLabel(subjectId: SubjectKey): string {
  return SUBJECT_META[subjectId]?.label ?? 'this subject';
}

function topicContext(topic: string, doubt: string, corpus: string): string {
  return `${topic} ${doubt} ${corpus}`.toLowerCase();
}

function classBand(classLevel?: ClassLevel): 'junior' | 'middle' | 'senior' {
  if (!classLevel || classLevel <= 8) return 'junior';
  if (classLevel <= 10) return 'middle';
  return 'senior';
}

function factsFromChunks(chunks: RetrievedChunk[]): string {
  return chunks.map((c) => stripChunkDisplayText(c.content)).join(' ');
}

function getTopic(chunks: RetrievedChunk[], doubt: string): string {
  return chunks[0]?.metadata.topic ?? topicFromDoubt(doubt);
}

function toQuickChecks(topic: string, subjectId: SubjectKey, classLevel: ClassLevel | undefined, drafts: QuestionDraft[]): QuickCheck[] {
  return drafts.slice(0, 4).map((d, index) => ({
    id: randomUUID(),
    index,
    topic,
    subjectId,
    classLevel,
    question: d.question.match(/^Quick check:/i) ? d.question : `Quick check: ${d.question}`,
    expectedAnswer: d.expectedAnswer,
    evaluationRubric: d.evaluationRubric,
    difficulty: d.difficulty,
  }));
}

function quadraticQuestions(
  topic: string,
  subjectId: SubjectKey,
  classLevel: ClassLevel | undefined,
  doubt: string,
): QuestionDraft[] {
  const band = classBand(classLevel);
  const solvedExample = /x\^2\s*[-−]\s*5x\s*\+\s*6|x²\s*[-−]\s*5x\s*\+\s*6/i.test(doubt);

  const q1: QuestionDraft =
    band === 'junior'
      ? {
          question: 'What does the discriminant b² − 4ac tell us about a quadratic equation?',
          expectedAnswer:
            'Accept: whether roots are real or not, two roots / one root / no real roots, or if solutions exist.',
          evaluationRubric: 'Conceptual answer about root nature counts.',
          difficulty: 'recall',
        }
      : {
          question: 'What does the discriminant b² − 4ac tell you about the roots of ax² + bx + c = 0?',
          expectedAnswer:
            'Accept: D > 0 two distinct real roots, D = 0 equal real roots, D < 0 no real roots / complex roots, nature of roots.',
          evaluationRubric: 'Numerical or sign-based explanation of discriminant counts.',
          difficulty: 'recall',
        };

  const q2: QuestionDraft = solvedExample
    ? {
        question: 'Factor x² − 5x + 6 completely.',
        expectedAnswer: 'Accept: (x − 2)(x − 3) or (x − 3)(x − 2).',
        evaluationRubric: 'Correct factorisation with both linear factors.',
        difficulty: 'apply',
      }
    : {
        question: 'How do you start factorising a quadratic like x² + bx + c when a = 1?',
        expectedAnswer:
          'Accept: find two numbers that multiply to c and add to b, split the middle term, factor by grouping.',
        evaluationRubric: 'Method description or worked start counts.',
        difficulty: 'apply',
      };

  const q3: QuestionDraft =
    band === 'senior'
      ? {
          question: 'If the discriminant of a quadratic is negative, what can you say about its roots?',
          expectedAnswer:
            'Accept: no real roots, complex / imaginary roots, roots are not real numbers.',
          evaluationRubric: 'Must connect negative discriminant to non-real roots.',
          difficulty: 'reason',
        }
      : {
          question: 'After factorising (x − 2)(x − 3) = 0, how do you find the values of x?',
          expectedAnswer:
            'Accept: zero-product property, set each factor to zero, x = 2 or x = 3.',
          evaluationRubric: 'Must mention setting factors to zero or naming both roots.',
          difficulty: 'apply',
        };

  const q4: QuestionDraft = {
    question:
      band === 'junior'
        ? 'What are the solutions to x² − 5x + 6 = 0?'
        : 'Solve x² − 7x + 12 = 0 by factorisation.',
    expectedAnswer:
      band === 'junior'
        ? 'Accept: x = 2 and x = 3 (or both roots).'
        : 'Accept: (x − 3)(x − 4) = 0, x = 3 or x = 4.',
    evaluationRubric: 'Both correct roots required for full credit; method may be stated briefly.',
    difficulty: 'apply',
  };

  return [q1, q2, q3, q4];
}

function historyFreedomQuestions(
  topic: string,
  classLevel: ClassLevel | undefined,
): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What peaceful method did Gandhi use to stand up to unfair British laws?'
          : 'What is satyagraha, in Gandhi\'s own approach to protest?',
      expectedAnswer:
        'Accept: satyagraha, non-violent resistance, truth-force, peaceful protest against injustice.',
      evaluationRubric: 'Conceptual relevance only — not chapter title keywords.',
      difficulty: 'recall',
    },
    {
      question:
        band === 'middle'
          ? 'Name one Gandhian mass movement from the 1920s–1940s.'
          : 'Name one major Gandhian mass movement and the decade it was launched.',
      expectedAnswer:
        'Accept: Non-Cooperation Movement (1920), Civil Disobedience Movement (1930), Quit India Movement (1942), Dandi March, Khilafat-linked protest.',
      evaluationRubric: 'Movement name with approximate period counts; satyagraha alone is insufficient here.',
      difficulty: 'recall',
    },
    {
      question:
        band === 'senior'
          ? 'Why did Gandhi launch the Civil Disobedience Movement in 1930?'
          : 'What was one main reason Gandhi called for the Non-Cooperation Movement?',
      expectedAnswer:
        'Accept: protest against British rule, salt law / tax, demand for swaraj, injustice of colonial policies, unify Indians against British authority.',
      evaluationRubric: 'Cause linked to a freedom-struggle campaign — not generic nationalism phrases.',
      difficulty: 'reason',
    },
    {
      question: 'How did mass movements like Quit India (1942) put pressure on British rule?',
      expectedAnswer:
        'Accept: widespread protests, civil disobedience, boycotts, challenged British authority, mobilised masses, made rule harder to sustain.',
      evaluationRubric: 'Effect or consequence of mass action on colonial rule.',
      difficulty: 'reason',
    },
  ];
}

function englishQuestions(
  topic: string,
  doubt: string,
  classLevel: ClassLevel | undefined,
): QuestionDraft[] {
  const band = classBand(classLevel);
  const lower = doubt.toLowerCase();

  if (/reported speech|indirect speech|direct speech/.test(lower)) {
    return [
      {
        question: 'Change to reported speech: He said, "I am happy."',
        expectedAnswer:
          'Accept: He said that he was happy — correct tense backshift and pronoun change.',
        evaluationRubric: 'Judge reported speech conversion, not keyword overlap.',
        difficulty: 'apply',
      },
      {
        question: 'Change to reported speech: She said, "I will finish the work tomorrow."',
        expectedAnswer:
          'Accept: She said that she would finish the work the next day — will→would, tomorrow→next day.',
        evaluationRubric: 'Tense and time-word shift required.',
        difficulty: 'apply',
      },
      {
        question: 'When converting direct speech to reported speech, what usually happens to the tense?',
        expectedAnswer:
          'Accept: tense shifts back (backshift), present→past, will→would, simple rule of sequence of tenses.',
        evaluationRubric: 'Conceptual grammar rule.',
        difficulty: 'recall',
      },
      {
        question: 'Why do we remove quotation marks in reported speech?',
        expectedAnswer:
          'Accept: speech is integrated into the narrator\'s sentence, not quoted directly, reporting clause takes over.',
        evaluationRubric: 'Purpose of reported speech formatting.',
        difficulty: 'reason',
      },
    ];
  }

  if (/topic sentence|supporting detail|main idea/.test(lower)) {
    return [
      {
        question: 'What is the job of a topic sentence in a paragraph?',
        expectedAnswer:
          'Accept: states the main idea, introduces what the paragraph is about.',
        evaluationRubric: 'Conceptual English writing terminology.',
        difficulty: 'recall',
      },
      {
        question: 'How is a supporting detail different from a topic sentence?',
        expectedAnswer:
          'Accept: supporting details give examples, evidence, or explanations; topic sentence states the main idea.',
        evaluationRubric: 'Contrast between main idea and support.',
        difficulty: 'apply',
      },
      {
        question: 'Which sentence is likely the topic sentence: one with a broad claim or one with a specific example?',
        expectedAnswer: 'Accept: the broad claim / general statement introduces the paragraph\'s focus.',
        evaluationRubric: 'Reasoning about paragraph structure.',
        difficulty: 'reason',
      },
      {
        question: 'Name one type of supporting detail a writer might use after a topic sentence.',
        expectedAnswer: 'Accept: example, statistic, quote, explanation, evidence, description.',
        evaluationRubric: 'Any valid supporting detail type.',
        difficulty: 'recall',
      },
    ];
  }

  return [
    {
      question: `In one sentence, what is the main idea behind "${topicFromDoubt(doubt)}"?`,
      expectedAnswer: `A correct, concise explanation of ${topicFromDoubt(doubt)} as taught in the lesson.`,
      evaluationRubric: 'Judge conceptual correctness from the lesson just explained.',
      difficulty: 'recall',
    },
    {
      question:
        band === 'junior'
          ? 'Give one example that could support the main idea of this topic.'
          : 'How would you explain this topic to a classmate who missed the lesson?',
      expectedAnswer: 'A substantively correct explanation or example from the lesson — not topic title words alone.',
      evaluationRubric: 'Accept reasonable phrasing variation.',
      difficulty: 'apply',
    },
    {
      question: 'What is one common mistake students make with this topic?',
      expectedAnswer: `A plausible misconception related to ${topic} that the lesson addressed.`,
      evaluationRubric: 'Reasonable subject-related misconception.',
      difficulty: 'reason',
    },
    {
      question: 'Which exam skill does this topic mainly test — comprehension, grammar, or writing structure?',
      expectedAnswer: 'Accept any skill that genuinely fits the topic explained.',
      evaluationRubric: 'Must connect to English exam skills.',
      difficulty: 'reason',
    },
  ];
}

function photosynthesisQuestions(classLevel: ClassLevel | undefined): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What do plants make during photosynthesis?'
          : 'What are the main products of photosynthesis?',
      expectedAnswer: 'Accept: glucose/food/sugar, oxygen, starch — energy-rich food and O₂ released.',
      evaluationRubric: 'At least one correct product.',
      difficulty: 'recall',
    },
    {
      question: 'Where in the plant cell does photosynthesis occur?',
      expectedAnswer: 'Accept: chloroplast, chlorophyll, green parts of leaf.',
      evaluationRubric: 'Chloroplast or chlorophyll required.',
      difficulty: 'recall',
    },
    {
      question: 'What gas do plants take in for photosynthesis, and what gas do they release?',
      expectedAnswer: 'Accept: take in CO₂ / carbon dioxide, release O₂ / oxygen.',
      evaluationRubric: 'Both gases correctly identified.',
      difficulty: 'apply',
    },
    {
      question: 'Why is sunlight necessary for photosynthesis?',
      expectedAnswer:
        'Accept: provides energy to convert CO₂ and water into glucose, light energy drives the reaction.',
      evaluationRubric: 'Energy role of light.',
      difficulty: 'reason',
    },
  ];
}

function physicsQuestions(classLevel: ClassLevel | undefined): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'senior'
          ? "State Newton's second law and what each symbol represents."
          : "How are force, mass, and acceleration related in Newton's second law?",
      expectedAnswer:
        'Accept: F=ma, force equals mass times acceleration, F in newtons, m in kg, a in m/s².',
      evaluationRubric: 'Accept equation or words; must capture F-m-a relationship.',
      difficulty: 'recall',
    },
    {
      question: 'A 4 kg object accelerates at 3 m/s². What is the net force on it?',
      expectedAnswer: 'Accept: F = ma = 12 N, 12 newtons.',
      evaluationRubric: 'Correct numerical answer with unit.',
      difficulty: 'apply',
    },
    {
      question: 'If you double the mass but keep the same force, what happens to acceleration?',
      expectedAnswer: 'Accept: acceleration halves, becomes half, inversely proportional to mass.',
      evaluationRubric: 'Inverse relationship between m and a when F is constant.',
      difficulty: 'reason',
    },
    {
      question: 'What is the SI unit of force?',
      expectedAnswer: 'Accept: newton, N.',
      evaluationRubric: 'Unit name or symbol.',
      difficulty: 'recall',
    },
  ];
}

function chemistryQuestions(classLevel: ClassLevel | undefined): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'Why must we balance a chemical equation?'
          : 'What law requires atoms to be balanced in a chemical equation?',
      expectedAnswer:
        'Accept: conservation of mass, atoms are neither created nor destroyed, same number of each atom on both sides.',
      evaluationRubric: 'Conservation of mass/atoms concept.',
      difficulty: 'recall',
    },
    {
      question: 'When balancing H₂ + O₂ → H₂O, why do we write 2H₂O instead of H₂O?',
      expectedAnswer:
        'Accept: to balance oxygen atoms, need two water molecules so O atoms match on both sides.',
      evaluationRubric: 'Coefficient reasoning for atom balance.',
      difficulty: 'apply',
    },
    {
      question: 'What is a coefficient in a balanced equation, and what must NOT be changed?',
      expectedAnswer:
        'Accept: coefficient is the number before a formula; subscripts inside formulas must not change.',
      evaluationRubric: 'Distinguish coefficients from subscripts.',
      difficulty: 'reason',
    },
    {
      question: 'How many oxygen atoms are in 2H₂O?',
      expectedAnswer: 'Accept: 2 oxygen atoms (one O per molecule × 2 molecules).',
      evaluationRubric: 'Counting atoms from coefficient.',
      difficulty: 'apply',
    },
  ];
}

function resolvePhysicsQuestions(ctx: string, classLevel?: ClassLevel): QuestionDraft[] {
  if (/electrostatic|coulomb|electric charge|electric field|gauss/i.test(ctx)) {
    return [
      {
        question: 'What is the SI unit of electric charge?',
        expectedAnswer: 'Accept: coulomb, C.',
        difficulty: 'recall',
      },
      {
        question: 'Like charges ______ each other; unlike charges ______.',
        expectedAnswer: 'Accept: repel, attract.',
        difficulty: 'recall',
      },
      {
        question: 'What does Coulomb\'s law describe?',
        expectedAnswer: 'Accept: force between two point charges, inversely proportional to square of distance.',
        difficulty: 'apply',
      },
      {
        question: 'Why is the electric field inside a hollow conductor zero in electrostatic equilibrium?',
        expectedAnswer: 'Accept: charges reside on surface, field cancels inside, electrostatic shielding.',
        difficulty: 'reason',
      },
    ];
  }
  if (/ohm|resistance|current|circuit|kirchhoff|electricity/i.test(ctx)) {
    return [
      {
        question: 'State Ohm\'s law relating voltage, current, and resistance.',
        expectedAnswer: 'Accept: V = IR, voltage equals current times resistance.',
        difficulty: 'recall',
      },
      {
        question: 'What is the SI unit of resistance?',
        expectedAnswer: 'Accept: ohm, Ω.',
        difficulty: 'recall',
      },
      {
        question: 'In a series circuit, how does current compare through each component?',
        expectedAnswer: 'Accept: same current everywhere in series.',
        difficulty: 'apply',
      },
      {
        question: 'Why do we use resistors in circuits?',
        expectedAnswer: 'Accept: limit current, divide voltage, protect components, control flow.',
        difficulty: 'reason',
      },
    ];
  }
  if (/optic|lens|mirror|refraction|reflection|snell/i.test(ctx)) {
    return [
      {
        question: 'What is the difference between reflection and refraction?',
        expectedAnswer: 'Accept: reflection bounces light; refraction bends light when entering a new medium.',
        difficulty: 'recall',
      },
      {
        question: 'What type of image does a plane mirror form?',
        expectedAnswer: 'Accept: virtual, erect, same size, laterally inverted.',
        difficulty: 'apply',
      },
      {
        question: 'When light goes from air to glass, does it bend toward or away from the normal?',
        expectedAnswer: 'Accept: toward the normal (slower medium).',
        difficulty: 'apply',
      },
      {
        question: 'Why does a convex lens converge parallel rays?',
        expectedAnswer: 'Accept: refracts rays inward, thicker at centre, focuses light to a point.',
        difficulty: 'reason',
      },
    ];
  }
  if (/thermo|heat|temperature|specific heat|latent heat/i.test(ctx)) {
    return [
      {
        question: 'What is the difference between heat and temperature?',
        expectedAnswer: 'Accept: temperature measures average kinetic energy; heat is energy transferred due to temperature difference.',
        difficulty: 'recall',
      },
      {
        question: 'What happens to molecular motion when temperature increases?',
        expectedAnswer: 'Accept: molecules move faster / more kinetic energy.',
        difficulty: 'apply',
      },
      {
        question: 'Define specific heat capacity.',
        expectedAnswer: 'Accept: heat needed to raise 1 kg of substance by 1°C.',
        difficulty: 'recall',
      },
      {
        question: 'During a phase change at constant temperature, where does the heat energy go?',
        expectedAnswer: 'Accept: latent heat breaks or forms intermolecular bonds, not temperature rise.',
        difficulty: 'reason',
      },
    ];
  }
  return physicsQuestions(classLevel);
}

function resolveChemistryQuestions(ctx: string, classLevel?: ClassLevel): QuestionDraft[] {
  if (/acid|base|ph|neutrali|salt/i.test(ctx)) {
    return [
      {
        question: 'What ions do acids release in aqueous solution?',
        expectedAnswer: 'Accept: H⁺ / hydronium ions.',
        difficulty: 'recall',
      },
      {
        question: 'What ions do bases release in aqueous solution?',
        expectedAnswer: 'Accept: OH⁻ / hydroxide ions.',
        difficulty: 'recall',
      },
      {
        question: 'What is formed when an acid reacts with a base?',
        expectedAnswer: 'Accept: salt and water, neutralisation product.',
        difficulty: 'apply',
      },
      {
        question: 'Why is pH 7 considered neutral?',
        expectedAnswer: 'Accept: equal H⁺ and OH⁻ concentrations, neither acidic nor basic.',
        difficulty: 'reason',
      },
    ];
  }
  if (/electroly|galvanic|cell|electrode|redox/i.test(ctx)) {
    return [
      {
        question: 'What is oxidation in terms of electrons?',
        expectedAnswer: 'Accept: loss of electrons, increase in oxidation number.',
        difficulty: 'recall',
      },
      {
        question: 'What is reduction in terms of electrons?',
        expectedAnswer: 'Accept: gain of electrons, decrease in oxidation number.',
        difficulty: 'recall',
      },
      {
        question: 'In a galvanic cell, where does oxidation occur?',
        expectedAnswer: 'Accept: at the anode.',
        difficulty: 'apply',
      },
      {
        question: 'Why is a salt bridge used in a galvanic cell?',
        expectedAnswer: 'Accept: completes circuit, maintains charge balance, allows ion flow.',
        difficulty: 'reason',
      },
    ];
  }
  if (/mole|molar|avogadro|stoichiometry/i.test(ctx)) {
    return [
      {
        question: 'How many particles are in one mole of a substance?',
        expectedAnswer: 'Accept: Avogadro number, 6.022 × 10²³.',
        difficulty: 'recall',
      },
      {
        question: 'What is molar mass?',
        expectedAnswer: 'Accept: mass of one mole, g/mol.',
        difficulty: 'recall',
      },
      {
        question: 'How do you convert grams to moles?',
        expectedAnswer: 'Accept: divide mass by molar mass, n = m/M.',
        difficulty: 'apply',
      },
      {
        question: 'Why are mole ratios important in balancing equations?',
        expectedAnswer: 'Accept: coefficients give mole ratios for stoichiometric calculations.',
        difficulty: 'reason',
      },
    ];
  }
  return chemistryQuestions(classLevel);
}

function accountancyQuestions(topic: string, classLevel?: ClassLevel): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What is the accounting equation?'
          : 'State the accounting equation and what each side represents.',
      expectedAnswer: 'Accept: Assets = Liabilities + Capital / Assets = Liabilities + Owner\'s Equity.',
      difficulty: 'recall',
    },
    {
      question: 'Which side of an account increases with a debit — assets or liabilities?',
      expectedAnswer: 'Accept: assets and expenses increase with debit; liabilities and capital with credit.',
      difficulty: 'apply',
    },
    {
      question: 'What is the purpose of a journal entry?',
      expectedAnswer: 'Accept: record transactions chronologically with debits and credits before posting to ledger.',
      difficulty: 'recall',
    },
    {
      question: `Why is a trial balance prepared for "${topic}" accounts?`,
      expectedAnswer: 'Accept: verify debit-credit equality, detect arithmetic errors before financial statements.',
      difficulty: 'reason',
    },
  ];
}

function businessQuestions(topic: string, classLevel?: ClassLevel): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What is management?'
          : 'Define management and name one function of management.',
      expectedAnswer: 'Accept: planning, organising, staffing, directing, controlling — getting work done through people.',
      difficulty: 'recall',
    },
    {
      question: 'What is the difference between marketing and selling?',
      expectedAnswer: 'Accept: marketing is customer-oriented whole process; selling focuses on transferring product for revenue.',
      difficulty: 'apply',
    },
    {
      question: 'What is a business environment?',
      expectedAnswer: 'Accept: internal and external forces affecting business — economic, social, legal, technological.',
      difficulty: 'recall',
    },
    {
      question: `Give one real-world example related to "${topic}".`,
      expectedAnswer: 'A substantively correct business example from the lesson — not topic title words alone.',
      difficulty: 'reason',
    },
  ];
}

function economicsQuestions(topic: string, classLevel?: ClassLevel): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What happens to quantity demanded when price rises, other things equal?'
          : 'State the law of demand.',
      expectedAnswer: 'Accept: quantity demanded falls when price rises, inverse relationship, ceteris paribus.',
      difficulty: 'recall',
    },
    {
      question: 'What is the difference between microeconomics and macroeconomics?',
      expectedAnswer: 'Accept: micro — individual/firm markets; macro — economy-wide GDP, inflation, unemployment.',
      difficulty: 'apply',
    },
    {
      question: 'What is opportunity cost?',
      expectedAnswer: 'Accept: value of next best alternative forgone when making a choice.',
      difficulty: 'recall',
    },
    {
      question: `How might "${topic}" connect to Indian economic policy or daily life?`,
      expectedAnswer: 'A correct link between the lesson concept and real economy or policy.',
      difficulty: 'reason',
    },
  ];
}

function biologyGeneralQuestions(classLevel?: ClassLevel): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What is one key difference between plant and animal cells?'
          : 'What is one key difference between mitosis and meiosis?',
      expectedAnswer:
        'Accept: cell wall/chloroplast for plant vs animal; mitosis identical cells vs meiosis gametes/haploid.',
      difficulty: 'recall',
    },
    {
      question: 'What is the function of DNA in a cell?',
      expectedAnswer: 'Accept: stores genetic information, instructions for proteins, heredity.',
      difficulty: 'recall',
    },
    {
      question: 'What is the difference between an organ and a tissue?',
      expectedAnswer: 'Accept: tissue is group of similar cells; organ is tissues working together for a function.',
      difficulty: 'apply',
    },
    {
      question: 'Why is variation important for a species?',
      expectedAnswer: 'Accept: adaptation, survival under changing environment, natural selection.',
      difficulty: 'reason',
    },
  ];
}

function scienceJuniorQuestions(topic: string, classLevel?: ClassLevel): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What is one change of state of matter?'
          : 'What is the difference between a physical and chemical change?',
      expectedAnswer:
        'Accept: melting/freezing/evaporation; physical — no new substance, chemical — new substance formed.',
      difficulty: 'recall',
    },
    {
      question: 'What force pulls objects toward Earth?',
      expectedAnswer: 'Accept: gravity, gravitational force.',
      difficulty: 'recall',
    },
    {
      question: `Name one key idea from "${topic}" in your science lesson.`,
      expectedAnswer: `A correct science concept from the lesson — not chapter title words alone.`,
      difficulty: 'apply',
    },
    {
      question: 'Why do we use control variables in an experiment?',
      expectedAnswer: 'Accept: fair test, only one factor changes, reliable results.',
      difficulty: 'reason',
    },
  ];
}

function genericSubjectQuestions(
  topic: string,
  subjectId: SubjectKey,
  classLevel: ClassLevel | undefined,
): QuestionDraft[] {
  const band = classBand(classLevel);
  return [
    {
      question:
        band === 'junior'
          ? 'What is one important idea you learned from this topic?'
          : `In one sentence, what is the core concept of "${topic}"?`,
      expectedAnswer: `A substantively correct concept from the lesson about "${topic}" — not words from the chapter title.`,
      evaluationRubric: 'Accept reasonable synonyms; reject topic-title keyword repetition only.',
      difficulty: 'recall',
    },
    {
      question:
        band === 'middle'
          ? 'How would you explain this topic to a friend in your own words?'
          : `Give one cause-and-effect or key relationship from this ${subjectLabel(subjectId)} lesson.`,
      expectedAnswer: `A correct explanation or relationship drawn from the lesson content.`,
      evaluationRubric: 'Substance over keyword matching.',
      difficulty: 'apply',
    },
    {
      question: 'What is one detail from this lesson that is easy to confuse or forget?',
      expectedAnswer: `A specific fact, term, or distinction from the topic "${topic}".`,
      evaluationRubric: 'Must be plausibly related to the subject matter.',
      difficulty: 'reason',
    },
    {
      question:
        band === 'senior'
          ? 'How might this topic appear in a CBSE exam question?'
          : 'Why does this topic matter for your syllabus?',
      expectedAnswer: 'A reasonable exam-style application or syllabus relevance for the topic.',
      evaluationRubric: 'Connects topic to learning goals or exam context.',
      difficulty: 'reason',
    },
  ];
}

function embeddedQuestionSet(
  embedded: string,
  topic: string,
  subjectId: SubjectKey,
  classLevel: ClassLevel | undefined,
  doubt: string,
): QuestionDraft[] | null {
  const lower = (doubt + embedded).toLowerCase();
  const base = embedded.match(/^Quick check:/i) ? embedded : `Quick check: ${embedded}`;

  if (/reported speech|indirect speech/.test(lower)) {
    return englishQuestions(topic, doubt, classLevel);
  }
  if (/photosynthesis|chloroplast/.test(lower)) {
    return photosynthesisQuestions(classLevel);
  }
  if (/topic sentence|supporting detail/.test(lower)) {
    return englishQuestions(topic, doubt, classLevel);
  }

  return [
    {
      question: base.replace(/^Quick check:\s*/i, ''),
      expectedAnswer: `A substantively correct answer aligned with the explanation about ${topicFromDoubt(doubt)}.`,
      evaluationRubric: 'Judge against the concept taught in the tutor answer.',
      difficulty: 'recall',
    },
    ...genericSubjectQuestions(topic, subjectId, classLevel).slice(1),
  ];
}

/**
 * Build 3–4 varied quick-check questions scoped to the doubt topic and class.
 */
export function buildQuickCheckQuestions(
  doubt: string,
  tutorAnswer: string,
  chunks: RetrievedChunk[],
  subjectId: SubjectKey,
  classLevel?: ClassLevel,
): QuickCheck[] {
  const topic = getTopic(chunks, doubt);
  const band = classBand(classLevel);
  const lowerTopic = topic.toLowerCase();
  const lowerDoubt = doubt.toLowerCase();
  const corpus = factsFromChunks(chunks).toLowerCase();

  const ctx = topicContext(topic, doubt, corpus);

  const embedded = extractQuickCheckQuestion(tutorAnswer);
  if (embedded) {
    const set = embeddedQuestionSet(embedded, topic, subjectId, classLevel, doubt);
    if (set) return toQuickChecks(topic, subjectId, classLevel, set);
  }

  // Math — quadratics
  if (
    subjectId === 'math' &&
    (lowerTopic.includes('quadratic') ||
      lowerTopic.includes('discriminant') ||
      /discriminant|b\^2\s*-\s*4ac|x\^2|x²/.test(lowerDoubt))
  ) {
    return toQuickChecks(topic, subjectId, classLevel, quadraticQuestions(topic, subjectId, classLevel, doubt));
  }

  // History / Social — freedom struggle
  if (
    (subjectId === 'social' || subjectId === 'history' || subjectId === 'political_science') &&
    /freedom struggle|nationalism|mass movement|satyagraha|non-cooperation|civil disobedience|quit india|gandhi/i.test(
      lowerTopic + lowerDoubt + corpus,
    )
  ) {
    return toQuickChecks(topic, subjectId, classLevel, historyFreedomQuestions(topic, classLevel));
  }

  // Federalism
  if (
    (subjectId === 'social' || subjectId === 'political_science') &&
    /federalism|federal/i.test(lowerTopic + lowerDoubt)
  ) {
    return toQuickChecks(topic, subjectId, classLevel, [
      {
        question:
          band === 'junior'
            ? 'In a federal system, who makes laws for the whole country and who makes laws for states?'
            : 'What is federalism, and how is power divided in India?',
        expectedAnswer:
          'Accept: division of power between centre and states, two levels of government, union/state/concurrent lists.',
        evaluationRubric: 'Conceptual explanation counts.',
        difficulty: 'recall',
      },
      {
        question: 'Name one subject that is mainly on the Union List in India.',
        expectedAnswer: 'Accept: defence, foreign affairs, currency, railways — central subjects.',
        evaluationRubric: 'Valid Union List example.',
        difficulty: 'recall',
      },
      {
        question: 'Why did India adopt a federal structure instead of a unitary one?',
        expectedAnswer:
          'Accept: diversity of states, local self-government, accommodate regional needs, large country.',
        evaluationRubric: 'Federalism rationale.',
        difficulty: 'reason',
      },
      {
        question: 'How is federalism different from giving all power to the central government?',
        expectedAnswer:
          'Accept: states have their own powers, shared sovereignty, division of legislative authority.',
        evaluationRubric: 'Contrast with unitary system.',
        difficulty: 'reason',
      },
    ]);
  }

  // Geography / resources (social science)
  if (
    subjectId === 'social' &&
    /geography|climate|resources|agriculture|soil|water|population/i.test(ctx)
  ) {
    return toQuickChecks(topic, subjectId, classLevel, [
      {
        question: 'What is the difference between weather and climate?',
        expectedAnswer: 'Accept: weather is short-term conditions; climate is long-term average pattern.',
        difficulty: 'recall',
      },
      {
        question: 'Name one renewable natural resource.',
        expectedAnswer: 'Accept: solar, wind, water, forests, tidal — replenishable.',
        difficulty: 'recall',
      },
      {
        question: 'Why is sustainable use of resources important?',
        expectedAnswer: 'Accept: future generations, prevent depletion, environmental balance.',
        difficulty: 'reason',
      },
      {
        question: 'How can soil erosion be reduced?',
        expectedAnswer: 'Accept: afforestation, terracing, contour ploughing, shelter belts.',
        difficulty: 'apply',
      },
    ]);
  }

  // Constitution / democracy (political science / civics)
  if (
    (subjectId === 'political_science' || subjectId === 'social') &&
    /constitution|democracy|parliament|fundamental rights|separation of power/i.test(ctx)
  ) {
    return toQuickChecks(topic, subjectId, classLevel, [
      {
        question: 'What are Fundamental Rights in the Indian Constitution?',
        expectedAnswer: 'Accept: basic rights guaranteed to citizens — equality, freedom, religion, etc.',
        difficulty: 'recall',
      },
      {
        question: 'Name the three organs of government in a democracy.',
        expectedAnswer: 'Accept: legislature, executive, judiciary.',
        difficulty: 'recall',
      },
      {
        question: 'Why is separation of powers important?',
        expectedAnswer: 'Accept: prevents abuse of power, checks and balances, accountability.',
        difficulty: 'reason',
      },
      {
        question: 'What is the role of the judiciary in a democracy?',
        expectedAnswer: 'Accept: interpret laws, protect rights, judicial review, settle disputes.',
        difficulty: 'apply',
      },
    ]);
  }

  if (subjectId === 'english') {
    return toQuickChecks(topic, subjectId, classLevel, englishQuestions(topic, doubt, classLevel));
  }

  if (subjectId === 'accountancy') {
    return toQuickChecks(topic, subjectId, classLevel, accountancyQuestions(topic, classLevel));
  }

  if (subjectId === 'business') {
    return toQuickChecks(topic, subjectId, classLevel, businessQuestions(topic, classLevel));
  }

  if (subjectId === 'economics') {
    return toQuickChecks(topic, subjectId, classLevel, economicsQuestions(topic, classLevel));
  }

  if (subjectId === 'physics') {
    return toQuickChecks(topic, subjectId, classLevel, resolvePhysicsQuestions(ctx, classLevel));
  }

  if (subjectId === 'chemistry') {
    return toQuickChecks(topic, subjectId, classLevel, resolveChemistryQuestions(ctx, classLevel));
  }

  if (subjectId === 'biology') {
    if (/photosynthesis|chlorophyll/i.test(ctx)) {
      return toQuickChecks(topic, subjectId, classLevel, photosynthesisQuestions(classLevel));
    }
    return toQuickChecks(topic, subjectId, classLevel, biologyGeneralQuestions(classLevel));
  }

  if (subjectId === 'science') {
    if (/photosynthesis|chlorophyll/i.test(ctx)) {
      return toQuickChecks(topic, subjectId, classLevel, photosynthesisQuestions(classLevel));
    }
    if (/force|motion|newton|gravity|energy/i.test(ctx)) {
      return toQuickChecks(topic, subjectId, classLevel, resolvePhysicsQuestions(ctx, classLevel));
    }
    return toQuickChecks(topic, subjectId, classLevel, scienceJuniorQuestions(topic, classLevel));
  }

  if (subjectId === 'math' && lowerTopic.includes('polynomial')) {
    return toQuickChecks(topic, subjectId, classLevel, [
      {
        question: 'How do you find the degree of a polynomial?',
        expectedAnswer: 'Accept: highest power of the variable with non-zero coefficient.',
        difficulty: 'recall',
      },
      {
        question: 'What is the degree of 5x³ − 2x + 7?',
        expectedAnswer: 'Accept: 3, degree 3, cubic.',
        difficulty: 'apply',
      },
      {
        question: 'Can a polynomial have more than one term with the same degree?',
        expectedAnswer: 'Accept: yes, like 3x² + 5x²; they combine — still one highest degree.',
        difficulty: 'reason',
      },
      {
        question: 'What is the leading coefficient of 4x² + x − 1?',
        expectedAnswer: 'Accept: 4, the coefficient of the highest-degree term.',
        difficulty: 'apply',
      },
    ]);
  }

  return toQuickChecks(topic, subjectId, classLevel, genericSubjectQuestions(topic, subjectId, classLevel));
}
