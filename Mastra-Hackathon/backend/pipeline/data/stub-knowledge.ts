import type { RetrievedChunk } from '../types.js';

export interface KnowledgeEntry {
  keywords: string[];
  chunks: Omit<RetrievedChunk, 'score'>[];
}

/** Seed corpus for stub retrieval until Qdrant is wired (Step 4). */
export const STUB_KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ['quadratic', 'x^2', 'x²', 'discriminant', 'factor', 'roots'],
    chunks: [
      {
        id: 'math-quadratic-1',
        content:
          'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. The highest power of the variable is 2.',
        metadata: { subject: 'Mathematics', topic: 'Quadratic Equations', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'math-quadratic-2',
        content:
          'Quadratic equations can be solved by factoring, completing the square, or the quadratic formula: x = (-b ± √(b² - 4ac)) / 2a.',
        metadata: { subject: 'Mathematics', topic: 'Quadratic Equations', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'math-quadratic-3',
        content:
          'The discriminant b² - 4ac determines root nature: positive → two distinct real roots, zero → one repeated root, negative → complex roots.',
        metadata: { subject: 'Mathematics', topic: 'Quadratic Equations', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: ['binary search', 'binary', 'sorted array', 'log n', 'divide and conquer', 'search algorithm'],
    chunks: [
      {
        id: 'cs-binary-1',
        content:
          'Binary search finds a target in a sorted array by repeatedly halving the search interval. Compare the target with the middle element; if unequal, discard the half that cannot contain the target.',
        metadata: { subject: 'Computer Science', topic: 'Binary Search', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'cs-binary-2',
        content:
          'Binary search requires a sorted input and runs in O(log n) time because each step eliminates half the remaining elements.',
        metadata: { subject: 'Computer Science', topic: 'Binary Search', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'cs-binary-3',
        content:
          'Example: searching for 8 in [2, 5, 8, 12, 16] — check index 2 (value 8); found in one comparison.',
        metadata: { subject: 'Computer Science', topic: 'Binary Search', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: ['mitosis', 'meiosis', 'cell division', 'chromosome', 'gamete', 'diploid', 'haploid'],
    chunks: [
      {
        id: 'bio-cell-1',
        content:
          'Mitosis produces two genetically identical diploid daughter cells for growth and repair. One division, same chromosome number as parent.',
        metadata: { subject: 'Biology', topic: 'Cell Division', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-cell-2',
        content:
          'Meiosis produces four genetically unique haploid gametes through two divisions (meiosis I and II). It introduces genetic variation via crossing over and independent assortment.',
        metadata: { subject: 'Biology', topic: 'Cell Division', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-cell-3',
        content:
          'Key difference: mitosis → 2 identical cells (2n); meiosis → 4 different gametes (n). Mitosis is for body cells; meiosis is for reproduction.',
        metadata: { subject: 'Biology', topic: 'Cell Division', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: ['newton', 'force', 'f=ma', 'acceleration', 'inertia', 'motion', 'second law'],
    chunks: [
      {
        id: 'physics-newton-1',
        content:
          "Newton's second law: the net force on an object equals mass times acceleration (F = ma). Force and acceleration are vectors in the same direction.",
        metadata: { subject: 'Physics', topic: "Newton's Laws", source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'physics-newton-2',
        content:
          'Example: a 2 kg object accelerated at 3 m/s² experiences a net force of F = 2 × 3 = 6 N.',
        metadata: { subject: 'Physics', topic: "Newton's Laws", source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'physics-newton-3',
        content:
          "Newton's first law (inertia): an object stays at rest or in uniform motion unless acted on by a net external force.",
        metadata: { subject: 'Physics', topic: "Newton's Laws", source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: [
      'photosynthesis',
      'chlorophyll',
      'glucose',
      'carbon dioxide',
      'light reaction',
      'calvin',
      'stomata',
      'leaf',
      'autotroph',
    ],
    chunks: [
      {
        id: 'bio-photo-1',
        content:
          'Photosynthesis is how green plants (and some bacteria/algae) make their own food. Using sunlight, they convert carbon dioxide from air and water from the soil into glucose (sugar) and release oxygen as a by-product.',
        metadata: { subject: 'Biology', topic: 'Photosynthesis', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-photo-2',
        content:
          'It happens mainly in leaf chloroplasts. Chlorophyll (the green pigment) traps light energy. Guard cells open stomata so CO₂ can enter the leaf; water arrives through the xylem.',
        metadata: { subject: 'Biology', topic: 'Photosynthesis', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-photo-3',
        content:
          'Two stages: (1) Light-dependent reactions in thylakoid membranes split water, make ATP + NADPH, and release O₂. (2) Calvin cycle in the stroma uses ATP + NADPH to fix CO₂ into glucose.',
        metadata: { subject: 'Biology', topic: 'Photosynthesis', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-photo-4',
        content:
          'Word equation: carbon dioxide + water → glucose + oxygen (in presence of sunlight and chlorophyll). Chemical form: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Glucose fuels plant growth; oxygen supports aerobic life on Earth.',
        metadata: { subject: 'Biology', topic: 'Photosynthesis', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-photo-5',
        content:
          'Why it matters biologically: plants are producers in food chains; stored starch comes from glucose; without photosynthesis, nearly all ecosystems would collapse.',
        metadata: { subject: 'Biology', topic: 'Photosynthesis', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: [
      'seed',
      'germinate',
      'germination',
      'sprout',
      'embryo',
      'radicle',
      'plumule',
      'cotyledon',
    ],
    chunks: [
      {
        id: 'bio-germ-1',
        content:
          'Seed germination is the process by which a dormant seed resumes growth and develops into a seedling when conditions are favorable (water, oxygen, suitable temperature).',
        metadata: { subject: 'Biology', topic: 'Seed Germination', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-germ-2',
        content:
          'Steps: (1) Imbibition — seed absorbs water and swells. (2) Activation of enzymes that digest stored food. (3) Radicle emerges first as the primary root. (4) Plumule grows upward to form the shoot.',
        metadata: { subject: 'Biology', topic: 'Seed Germination', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'bio-germ-3',
        content:
          'Water softens the seed coat, oxygen supports respiration that provides energy, and warmth speeds enzyme activity. Without these, germination is delayed or fails.',
        metadata: { subject: 'Biology', topic: 'Seed Germination', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
  {
    keywords: ['calculus', 'derivative', 'integral', 'limit', 'differentiation', 'slope'],
    chunks: [
      {
        id: 'math-calc-1',
        content:
          'A derivative measures the instantaneous rate of change of a function. Geometrically, it is the slope of the tangent line at a point.',
        metadata: { subject: 'Mathematics', topic: 'Calculus', source: 'stub-seed', classLevel: 11 },
      },
      {
        id: 'math-calc-2',
        content:
          'Common rules: d/dx(xⁿ) = nxⁿ⁻¹, d/dx(sin x) = cos x, d/dx(eˣ) = eˣ. The integral is the reverse operation (antiderivative).',
        metadata: { subject: 'Mathematics', topic: 'Calculus', source: 'stub-seed', classLevel: 11 },
      },
    ],
  },
  {
    keywords: ['chemical equation', 'balance', 'mole', 'stoichiometry', 'reaction', 'limiting reagent'],
    chunks: [
      {
        id: 'chem-1',
        content:
          'Balancing chemical equations ensures equal atom counts on both sides. Adjust coefficients (not subscripts) to conserve mass.',
        metadata: { subject: 'Chemistry', topic: 'Stoichiometry', source: 'stub-seed', classLevel: 10 },
      },
      {
        id: 'chem-2',
        content:
          'The limiting reagent is the reactant consumed first; it determines the maximum product yield. Compare mole ratios from balanced equations.',
        metadata: { subject: 'Chemistry', topic: 'Stoichiometry', source: 'stub-seed', classLevel: 10 },
      },
    ],
  },
];

export function scoreEntry(query: string, keywords: string[]): number {
  const lower = query.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) score += kw.includes(' ') ? 3 : 1;
  }
  return score;
}
