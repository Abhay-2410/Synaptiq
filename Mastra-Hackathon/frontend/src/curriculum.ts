/** CBSE curriculum catalog — mirrored from backend for frontend UI */

export type ClassLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type StreamId = 'pcm' | 'pcb' | 'commerce' | 'humanities';

export type SubjectKey =
  | 'math'
  | 'science'
  | 'english'
  | 'social'
  | 'physics'
  | 'chemistry'
  | 'biology'
  | 'accountancy'
  | 'business'
  | 'economics'
  | 'history'
  | 'political_science';

/** @deprecated use SubjectKey */
export type SubjectId = SubjectKey;

export interface SubjectMeta {
  key: SubjectKey;
  label: string;
  color: string;
  tilt: number;
}

export const SUBJECT_META: Record<SubjectKey, SubjectMeta> = {
  math: { key: 'math', label: 'Math', color: '#E8D66B', tilt: -2 },
  science: { key: 'science', label: 'Science', color: '#6FBF9E', tilt: -1 },
  english: { key: 'english', label: 'English', color: '#C4A484', tilt: 1.5 },
  social: { key: 'social', label: 'Social', color: '#E8A87C', tilt: -1.5 },
  physics: { key: 'physics', label: 'Physics', color: '#F2795B', tilt: 2 },
  chemistry: { key: 'chemistry', label: 'Chemistry', color: '#9B8EC4', tilt: 1 },
  biology: { key: 'biology', label: 'Biology', color: '#6FBF9E', tilt: -1.5 },
  accountancy: { key: 'accountancy', label: 'Accounts', color: '#7FA8C9', tilt: 2 },
  business: { key: 'business', label: 'Business', color: '#D4A574', tilt: -2 },
  economics: { key: 'economics', label: 'Economics', color: '#E8D66B', tilt: 1.8 },
  history: { key: 'history', label: 'History', color: '#C4866A', tilt: -2.5 },
  political_science: {
    key: 'political_science',
    label: 'Political Science',
    color: '#7FA8C9',
    tilt: 2.2,
  },
};

export const STREAM_META: Record<StreamId, { label: string; subjects: SubjectKey[] }> = {
  pcm: { label: 'Science (PCM)', subjects: ['math', 'physics', 'chemistry', 'english'] },
  pcb: { label: 'Science (PCB)', subjects: ['biology', 'physics', 'chemistry', 'english'] },
  commerce: {
    label: 'Commerce',
    subjects: ['accountancy', 'business', 'economics', 'english'],
  },
  humanities: {
    label: 'Humanities',
    subjects: ['history', 'political_science', 'economics', 'english'],
  },
};

export function subjectsForClass(classLevel: ClassLevel, stream?: StreamId | null): SubjectKey[] {
  if (classLevel <= 10) return ['math', 'science', 'english', 'social'];
  if (!stream) return [];
  return STREAM_META[stream].subjects;
}

/** Every NCERT subject available for Class 11–12 (all streams). */
export const ALL_CLASS_11_12_SUBJECTS: SubjectKey[] = [
  'math',
  'physics',
  'chemistry',
  'biology',
  'accountancy',
  'business',
  'economics',
  'history',
  'political_science',
  'english',
];

export const SUBJECT_GROUPS: { label: string; keys: SubjectKey[] }[] = [
  { label: 'Sciences', keys: ['math', 'physics', 'chemistry', 'biology'] },
  { label: 'Commerce', keys: ['accountancy', 'business', 'economics'] },
  { label: 'Humanities', keys: ['history', 'political_science'] },
  { label: 'Language', keys: ['english'] },
];

export function allSubjectsForClass(classLevel: ClassLevel): SubjectKey[] {
  if (classLevel <= 10) return subjectsForClass(classLevel);
  return ALL_CLASS_11_12_SUBJECTS;
}

export function needsStream(classLevel: ClassLevel): boolean {
  return classLevel >= 11;
}

export function getSubjectMeta(key: SubjectKey): SubjectMeta {
  return SUBJECT_META[key];
}

/** Class + subject aware example doubt cards */
export const EXAMPLE_PROMPTS: Record<string, string[]> = {
  '6-math': ['What is place value in the Indian number system?', 'How do we find LCM of two numbers?'],
  '6-science': ['What are the components of food?', 'How do plants make their food?'],
  '6-english': ['What is a noun? Give examples.', 'How do we write a formal letter?'],
  '6-social': ['What are latitudes and longitudes?', 'Name the major domains of the Earth.'],
  '7-math': ['What are rational numbers?', 'Explain simple equations with an example.'],
  '7-science': ['What is heat and how is it transferred?', 'Explain nutrition in animals.'],
  '7-english': ['What is active and passive voice?', 'How to write a story with a clear plot?'],
  '7-social': ['What was the Delhi Sultanate?', 'Explain the water cycle.'],
  '8-math': ['What is a linear equation in one variable?', 'Explain factorisation of polynomials.'],
  '8-science': ['What is force and pressure?', 'Explain friction with examples.'],
  '8-english': ['What are clauses in a sentence?', 'Explain figures of speech — simile vs metaphor.'],
  '8-social': ['What caused the French Revolution?', 'Explain the Indian Constitution preamble.'],
  '9-math': ['What are irrational numbers?', 'How do we solve a pair of linear equations?'],
  '9-science': ['What is the structure of an atom?', "Explain Newton's laws of motion."],
  '9-english': ['What are tenses? Explain past perfect.', 'How to write a formal letter?'],
  '9-social': ['What was the French Revolution?', 'Explain drainage systems of India.'],
  '10-math': ['How do I solve x² − 5x + 6 = 0?', 'What is an arithmetic progression?'],
  '10-science': ['What are life processes in living organisms?', 'Explain light reflection and refraction.'],
  '10-english': ['What is reported speech?', 'How to analyse an unseen passage?'],
  '10-social': ['Explain nationalism in India in the 20th century.', 'What are the sectors of the Indian economy?'],
  '11-math': ['What are sets and subsets?', 'Explain limits and derivatives.'],
  '11-physics': ['What is projectile motion?', 'Explain laws of thermodynamics.'],
  '11-chemistry': ['What is chemical bonding?', 'Explain the mole concept.'],
  '11-biology': ['What is cell structure?', 'Explain photosynthesis in plants.'],
  '11-english': ['What is literary analysis?', 'How to write a debate speech?'],
  '11-accountancy': ['What is the accounting equation?', 'Explain journal entries.'],
  '11-business': ['What are forms of business organisation?', 'Explain management principles.'],
  '11-economics': ['What is GDP?', 'Explain poverty and inequality in India.'],
  '11-history': ['What caused World War I?', 'Explain the Russian Revolution.'],
  '11-political_science': ['What is political theory?', 'Explain liberty and equality.'],
  '12-math': ['What are definite integrals?', 'Explain matrices and determinants.'],
  '12-physics': ['Explain electrostatic potential.', 'What is electromagnetic induction?'],
  '12-chemistry': ['What is electrochemistry?', 'Explain coordination compounds.'],
  '12-biology': ['How does DNA replication work?', 'Explain human reproduction.'],
  '12-english': ['Analyse a poem — theme and imagery.', 'How to write a formal article?'],
  '12-accountancy': ['What is partnership accounting?', 'Explain cash flow statement.'],
  '12-business': ['What is marketing management?', 'Explain financial markets.'],
  '12-economics': ['Explain national income accounting.', 'What is macroeconomic equilibrium?'],
  '12-history': ['Explain partition of India.', 'What was the Cold War?'],
  '12-political_science': ['What is globalisation?', 'Explain challenges to democracy in India.'],
};

export function promptsFor(classLevel: ClassLevel, subject: SubjectKey): string[] {
  const key = `${classLevel}-${subject}`;
  return (
    EXAMPLE_PROMPTS[key] ?? [
      `Explain a key concept from Class ${classLevel} ${SUBJECT_META[subject].label}.`,
      `What should I know about a major chapter in Class ${classLevel} ${SUBJECT_META[subject].label}?`,
      `Help me understand an important topic in Class ${classLevel} ${SUBJECT_META[subject].label}.`,
    ]
  );
}

export const CHIP_TILTS = [-2.5, 1.8, -1.2, 2.8, -2, 1.5];
