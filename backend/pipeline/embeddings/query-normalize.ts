/** Common student misspellings → canonical CBSE/NCERT terms */
const TYPO_MAP: Record<string, string> = {
  trignometry: 'trigonometry',
  trignometric: 'trigonometric',
  trigno: 'trigonometry',
  pythagorus: 'pythagoras',
  pythagorean: 'pythagoras',
  photosysthesis: 'photosynthesis',
  photosynthisis: 'photosynthesis',
  photosynthis: 'photosynthesis',
  polynominal: 'polynomial',
  polynominals: 'polynomials',
  quadatic: 'quadratic',
  quadratc: 'quadratic',
  differenciation: 'differentiation',
  differentation: 'differentiation',
  intigration: 'integration',
  intergration: 'integration',
  logrithm: 'logarithm',
  logaritm: 'logarithm',
  algebriac: 'algebraic',
  algebric: 'algebraic',
  geomatry: 'geometry',
  geomatric: 'geometric',
  coordiante: 'coordinate',
  coordiantes: 'coordinates',
  parellel: 'parallel',
  perpindicular: 'perpendicular',
  circumerence: 'circumference',
  diaognal: 'diagonal',
  probablity: 'probability',
  probablities: 'probabilities',
  statitics: 'statistics',
  statstics: 'statistics',
  mensuration: 'mensuration',
  mensuraton: 'mensuration',
  refraction: 'refraction',
  refracion: 'refraction',
  electromagnet: 'electromagnetism',
  electromagnatism: 'electromagnetism',
  thermodynamics: 'thermodynamics',
  thermodyamics: 'thermodynamics',
  mitosis: 'mitosis',
  miosis: 'meiosis',
  meosis: 'meiosis',
  evapouration: 'evaporation',
  evaporation: 'evaporation',
  condenstation: 'condensation',
  sublimation: 'sublimation',
  democracy: 'democracy',
  democrcy: 'democracy',
  constitution: 'constitution',
  constituton: 'constitution',
  globalisation: 'globalization',
};

const FILLER_RE =
  /^(?:what is|what are|what's|whats|define|definition of|explain(?:\s+the)?|tell me about|can you explain|how does|how do(?:\s+i)?(?:\s+to)?\s+solve|how do|describe|meaning of|give me|i want to know about|help me with|please solve)\s+/i;

/**
 * Normalize a student doubt for retrieval matching.
 * Keeps the original wording for display; use this only for search.
 */
export function normalizeQuery(text: string): string {
  let q = text.trim().replace(/\s+/g, ' ');
  q = q.replace(FILLER_RE, '').replace(/\?+$/, '').trim();
  q = q.replace(/^(?:the|a|an)\s+/i, '').trim();

  const words = q.split(/\s+/).map((word) => {
    const bare = word.toLowerCase().replace(/[^a-z0-9-]/g, '');
    return TYPO_MAP[bare] ?? word;
  });

  return words.join(' ').trim() || text.trim();
}

const STOPWORDS = new Set([
  'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
  'does', 'do', 'did', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'these', 'those',
  'about', 'into', 'your', 'you', 'can', 'could', 'would', 'should',
  'explain', 'describe', 'tell', 'give', 'work', 'works', 'working', 'mean', 'means',
]);

export function tokenizeForMatch(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}
