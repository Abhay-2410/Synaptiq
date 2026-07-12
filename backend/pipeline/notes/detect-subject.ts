import {
  SUBJECT_META,
  subjectsForClass,
  type ClassLevel,
  type StreamId,
  type SubjectKey,
} from '../curriculum/catalog.js';
import type { BoardId } from '../curriculum/boards.js';
import type { NotesStudyContext } from './types.js';

/** Keyword signals per subject — used to infer topic from OCR text. */
const SUBJECT_SIGNALS: Partial<Record<SubjectKey, RegExp[]>> = {
  physics: [
    /\bohm|voltage|current|resistance|circuit|electricity|kirchhoff|watt|joule\b/i,
    /\bforce|newton|acceleration|velocity|momentum|friction|gravity\b/i,
    /\blens|mirror|refraction|reflection|wave|frequency|amplitude\b/i,
    /\benergy|power|work done|f\s*=\s*ma|v\s*=\s*u\s*\+\s*at\b/i,
    /Ω|ohm/i,
  ],
  chemistry: [
    /\bmole|molar|avogadro|stoichiometry|reaction|equation\b/i,
    /\bacid|base|salt|ph\b|oxidation|reduction|valency\b/i,
    /\batom|molecule|element|compound|periodic|ion\b/i,
    /\bbond|covalent|ionic|electrolysis|metal|non-?metal\b/i,
  ],
  biology: [
    /\bphotosyn|photosynthesis|chloroph|chloroplast|chlorophyll\b/i,
    /\bcells?|tissues?|organs?|organisms?\b/i,
    /\bplants?|animals?\b/i,
    /\bheart|blood|digestion|excretion|reproduction|hormone\b/i,
    /\bdna|rna|genes?|chromosome|mitosis|meiosis|evolution\b/i,
  ],
  math: [
    /\bequation|polynomial|quadratic|factoris|algebra|geometry\b/i,
    /\btriangle|circle|theorem|pythagoras|trigonometry|coordinate\b/i,
    /\bprobability|statistics|mean|median|mode|derivative|integral\b/i,
    /\bsolve|prove|calculate|x\s*=|y\s*=|\d+x\b/i,
  ],
  english: [
    /\bgrammar|noun|verb|adjective|tense|clause|phrase\b/i,
    /\bcomprehension|passage|poem|stanza|metaphor|simile\b/i,
    /\bessay|letter|report|notice|debate|speech\b/i,
  ],
  social: [
    /\bnationalism|independence|constitution|democracy|federal\b/i,
    /\brevolt|colonial|gandhi|nehru|partition|republic\b/i,
    /\bresources|agriculture|industry|population|census\b/i,
  ],
  history_civics: [
    /\brevolt|empire|colonial|independence|constitution|civics\b/i,
    /\bparliament|democracy|election|fundamental rights\b/i,
  ],
  geography: [
    /\bclimate|monsoon|soil|river|plateau|mountain|latitude\b/i,
    /\bmap|relief|vegetation|mineral|agriculture|irrigation\b/i,
  ],
  history: [
    /\brevolt|empire|colonial|independence|world war|nationalism\b/i,
    /\bharappan|mughal|british|partition|gandhi\b/i,
  ],
  political_science: [
    /\bconstitution|democracy|federal|parliament|election|rights\b/i,
    /\bgovernance|coalition|party|judiciary|executive|legislature\b/i,
  ],
  economics: [
    /\bgdp|inflation|demand|supply|market|budget|fiscal\b/i,
    /\bmicro|macro|elasticity|utility|production|cost\b/i,
  ],
  accountancy: [
    /\bdebit|credit|journal|ledger|trial balance|balance sheet\b/i,
    /\bassets|liabilities|capital|depreciation|partnership\b/i,
  ],
  business: [
    /\bmanagement|marketing|finance|entrepreneur|planning|organisation\b/i,
    /\bconsumer|branding|staffing|directing|controlling\b/i,
  ],
  science: [
    /\bphysics|chemistry|biology|science\b/i,
    /\blight|sound|magnet|acid|cell|force|atom\b/i,
  ],
};

const FILENAME_SUBJECT_HINTS: Array<{ pattern: RegExp; subject: SubjectKey }> = [
  { pattern: /phys/i, subject: 'physics' },
  { pattern: /chem/i, subject: 'chemistry' },
  { pattern: /bio/i, subject: 'biology' },
  { pattern: /math|algebra|geometry/i, subject: 'math' },
  { pattern: /english|grammar/i, subject: 'english' },
  { pattern: /history|civics/i, subject: 'history_civics' },
  { pattern: /geograph|geo/i, subject: 'geography' },
  { pattern: /social|sst/i, subject: 'social' },
  { pattern: /account/i, subject: 'accountancy' },
  { pattern: /econom/i, subject: 'economics' },
  { pattern: /business|bst/i, subject: 'business' },
];

export interface SubjectDetectionResult {
  subjectId: SubjectKey;
  subjectLabel: string;
  confidence: number;
  source: 'text' | 'filename' | 'user';
  adjustedFromUser: boolean;
}

function allowedSubjects(
  boardId: BoardId,
  classLevel: ClassLevel,
  streamId?: StreamId,
): SubjectKey[] {
  if (classLevel >= 11 && streamId) {
    return subjectsForClass(classLevel, boardId, streamId);
  }
  if (classLevel >= 11) {
    return ['math', 'physics', 'chemistry', 'biology', 'english', 'accountancy', 'business', 'economics', 'history', 'political_science'];
  }
  return subjectsForClass(classLevel, boardId);
}

function scoreSubject(text: string, subject: SubjectKey): number {
  const patterns = SUBJECT_SIGNALS[subject];
  if (!patterns?.length) return 0;
  let score = 0;
  for (const re of patterns) {
    if (re.test(text)) score += 1;
  }
  return score;
}

function detectFromFilename(filename: string): SubjectKey | null {
  const base = filename.replace(/\.[^.]+$/, '');
  for (const { pattern, subject } of FILENAME_SUBJECT_HINTS) {
    if (pattern.test(base)) return subject;
  }
  return null;
}

function narrowScienceSubject(text: string): SubjectKey | null {
  // High-confidence topic shortcuts (handles OCR typos)
  if (/\bphotosyn/i.test(text)) return 'biology';
  if (/\bohm|kirchhoff|circuit|resistance|voltage|current\b/i.test(text)) return 'physics';
  if (/\bmole|stoichiometry|valency|periodic table|acid|base\b/i.test(text)) return 'chemistry';

  const scores: Array<{ key: SubjectKey; score: number }> = [
    { key: 'physics' as SubjectKey, score: scoreSubject(text, 'physics') },
    { key: 'chemistry' as SubjectKey, score: scoreSubject(text, 'chemistry') },
    { key: 'biology' as SubjectKey, score: scoreSubject(text, 'biology') },
  ].sort((a, b) => b.score - a.score);

  const best = scores[0];
  if (!best || best.score < 2) return null;
  if (scores[1] && scores[1].score >= best.score) return null;
  return best.key;
}

/**
 * Infer the most likely subject from extracted note text and filename.
 */
export function detectNotesSubject(
  extractedText: string,
  filename: string,
  userContext: NotesStudyContext,
): SubjectDetectionResult {
  const sample = extractedText.slice(0, 8000).toLowerCase();
  const allowed = allowedSubjects(userContext.boardId, userContext.classLevel, userContext.streamId);

  // Class 6–10 "Science" chip — narrow to Physics / Chemistry / Biology from note content
  if (userContext.classLevel <= 10 && userContext.subjectId === 'science') {
    const narrowed = narrowScienceSubject(sample);
    if (narrowed) {
      return {
        subjectId: narrowed,
        subjectLabel: SUBJECT_META[narrowed].label,
        confidence: Math.min(1, scoreSubject(sample, narrowed) / 6),
        source: 'text',
        adjustedFromUser: true,
      };
    }
  }

  const scores = new Map<SubjectKey, number>();

  for (const subject of Object.keys(SUBJECT_SIGNALS) as SubjectKey[]) {
    if (!allowed.includes(subject) && subject !== 'physics' && subject !== 'chemistry' && subject !== 'biology') {
      continue;
    }
    const s = scoreSubject(sample, subject);
    if (s > 0) scores.set(subject, s);
  }

  const fromFile = detectFromFilename(filename);
  if (fromFile) {
    scores.set(fromFile, (scores.get(fromFile) ?? 0) + 2);
  }

  // Junior "science" — try to narrow to physics/chemistry/biology for labeling
  if (userContext.classLevel <= 10 && (userContext.subjectId === 'science' || allowed.includes('science'))) {
    const narrowed = narrowScienceSubject(sample);
    if (narrowed) {
      scores.set(narrowed, (scores.get(narrowed) ?? 0) + 3);
    }
  }

  let bestKey = userContext.subjectId;
  let bestScore = scores.get(userContext.subjectId) ?? 0;

  for (const [key, score] of scores) {
    if (score > bestScore && (allowed.includes(key) || key === 'physics' || key === 'chemistry' || key === 'biology')) {
      bestKey = key;
      bestScore = score;
    }
  }

  const userScore = scores.get(userContext.subjectId) ?? 0;
  const adjusted =
    bestKey !== userContext.subjectId &&
    (bestScore >= Math.max(userScore + 2, 3) ||
      (userContext.classLevel <= 10 &&
        (bestKey === 'physics' || bestKey === 'chemistry' || bestKey === 'biology') &&
        bestScore >= 3 &&
        userContext.subjectId !== bestKey));

  const resolvedKey = adjusted ? bestKey : userContext.subjectId;
  const confidence = bestScore > 0 ? Math.min(1, bestScore / 8) : 0.3;

  return {
    subjectId: resolvedKey,
    subjectLabel: SUBJECT_META[resolvedKey].label,
    confidence,
    source: adjusted ? (fromFile && bestKey === fromFile ? 'filename' : 'text') : 'user',
    adjustedFromUser: adjusted,
  };
}

export function buildNotesPdfFileName(subjectLabel: string, classLevel: ClassLevel): string {
  const safe = subjectLabel
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${safe}-Class-${classLevel}-Study-Notes.pdf`;
}

export interface ResolvedNotesContext extends NotesStudyContext {
  subjectLabel: string;
  pdfFileName: string;
  subjectDetection: SubjectDetectionResult;
}

export function resolveNotesContext(
  extractedText: string,
  filename: string,
  userContext: NotesStudyContext,
): ResolvedNotesContext {
  const detection = detectNotesSubject(extractedText, filename, userContext);
  const pdfFileName = buildNotesPdfFileName(detection.subjectLabel, userContext.classLevel);

  return {
    ...userContext,
    subjectId: detection.subjectId,
    subjectLabel: detection.subjectLabel,
    pdfFileName,
    subjectDetection: detection,
  };
}
