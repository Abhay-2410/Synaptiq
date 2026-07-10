/**
 * Handcrafted starter doubts — keyed as `${board}-${class}-${subject}`.
 * Written like real student messages, not generic AI placeholders.
 */
import type { BoardId, ClassLevel, StreamId, SubjectKey } from './curriculum';

type PromptTriple = readonly [string, string, string];

export const EXAMPLE_PROMPTS: Record<string, PromptTriple> = {
  // ═══ CBSE · Class 6 ═══
  'cbse-6-math': [
    'How do I compare 3/4 and 5/6 — which fraction is bigger?',
    'A rectangle is 12 cm long and 8 cm wide. How do I find its perimeter?',
    'What is the place value of 7 in 4,73,256?',
  ],
  'cbse-6-science': [
    'Why do we need different food groups — what does each one do?',
    'How does a pinhole camera form an image?',
    'What is the difference between magnetic and non-magnetic materials?',
  ],
  'cbse-6-english': [
    'When do we use "a" and when do we use "an" before a word?',
    'How should I start a story for my Class 6 writing task?',
    'Change to reported speech: Ravi said, "I am going to the park."',
  ],
  'cbse-6-social': [
    'What is the difference between a map and a globe?',
    'Why do we celebrate Republic Day on 26 January?',
    'What work does a Gram Panchayat do in a village?',
  ],

  // ═══ CBSE · Class 7 ═══
  'cbse-7-math': [
    'I added (+3) + (−5) and got confused — what is the correct answer?',
    'How do I solve 2x + 7 = 15 step by step?',
    'Two angles of a triangle are 50° and 60° — how do I find the third?',
  ],
  'cbse-7-science': [
    'Why does curd set faster in summer than in winter?',
    'What is the difference between acids, bases and neutral substances?',
    'How does heat transfer happen in solids — conduction?',
  ],
  'cbse-7-english': [
    'What is the difference between active and passive voice?',
    'How do I write a good informal letter to a friend?',
    'Where do we use commas in a long sentence?',
  ],
  'cbse-7-social': [
    'What was the Mansabdari system in the Mughal Empire?',
    'Why is the Himalayas called a young fold mountain range?',
    'What is the role of the judiciary in India?',
  ],

  // ═══ CBSE · Class 8 ═══
  'cbse-8-math': [
    'How do I solve 3x − 7 = 14? I keep getting the sign wrong.',
    'What is the area of a trapezium if the parallel sides are 10 cm and 6 cm?',
    'Can you show how to find the square root of 784 by prime factorisation?',
  ],
  'cbse-8-science': [
    'Why do we wear seat belts — how does inertia explain it?',
    'What is the difference between friction and pressure?',
    'How do bats use sound to find their way in the dark?',
  ],
  'cbse-8-english': [
    'What is a subordinate clause and how do I punctuate it?',
    'How do I write a notice for a school science fair?',
    'Change to indirect speech: She said, "I have finished my homework."',
  ],
  'cbse-8-social': [
    'What are the salient features of the Indian Constitution?',
    'Why did the Revolt of 1857 break out — main causes?',
    'What is the difference between weather and climate?',
  ],

  // ═══ CBSE · Class 9 ═══
  'cbse-9-math': [
    'How do I factorise x² + 5x + 6?',
    'Find the distance between points A(2, 3) and B(5, 7).',
    'A triangle has sides 5 cm, 12 cm and 13 cm — can I use Heron\'s formula here?',
  ],
  'cbse-9-science': [
    'Why do we feel lighter at the top of a building — is it gravitation?',
    'What is the difference between work and energy?',
    'How is sound produced and how does it travel through air?',
  ],
  'cbse-9-english': [
    'How do I write an analytical paragraph from a chart or graph?',
    'What is the format of a formal letter in CBSE?',
    'When do we use simple past and present perfect — I mix them up.',
  ],
  'cbse-9-social': [
    'What were the main causes of the French Revolution?',
    'Explain the election process in India in simple steps.',
    'Why is population called a resource and also a problem?',
  ],

  // ═══ CBSE · Class 10 ═══
  'cbse-10-math': [
    'How do I solve x² − 5x + 6 = 0 by factorisation?',
    'In an AP the first term is 3 and common difference is 5 — find the 10th term.',
    'If sin θ = 3/5, how do I find cos θ without a calculator?',
  ],
  'cbse-10-science': [
    'Why does a ray of light bend when it enters glass from air?',
    'How do I balance this equation: Fe + H₂O → Fe₃O₄ + H₂?',
    'Draw and explain a series vs parallel circuit — which is safer at home?',
  ],
  'cbse-10-english': [
    'What is the word limit and format for an analytical paragraph?',
    'How do I write a letter to the editor about water pollution?',
    'Change to reported speech: He said, "I will help you tomorrow."',
  ],
  'cbse-10-social': [
    'Explain nationalism in India in the 20th century.',
    'What are primary, secondary and tertiary sectors with Indian examples?',
    'Why is power sharing important in a democracy like Belgium or India?',
  ],

  // ═══ ICSE · Class 6 ═══
  'icse-6-math': [
    'How do I find the LCM of 12 and 18 using prime factorisation?',
    'What is a natural number, whole number and integer — simple difference?',
    'A square field has side 25 m. What is its area and perimeter?',
  ],
  'icse-6-science': [
    'What are the main parts of a plant and what does each do?',
    'Why does a compass needle always point north?',
    'How do we classify animals into vertebrates and invertebrates?',
  ],
  'icse-6-english': [
    'What is the difference between a phrase and a clause?',
    'How do I write a short paragraph describing my school?',
    'When do we use capital letters in English — quick rules?',
  ],
  'icse-6-history_civics': [
    'What is the meaning of the Preamble to our Constitution?',
    'Who were the Harappans and where did they live?',
    'What is the difference between a democracy and a monarchy?',
  ],
  'icse-6-geography': [
    'What are the four main directions and how do we use a compass?',
    'Why is the Earth round but maps look flat?',
    'What is the difference between a hill and a mountain?',
  ],

  // ═══ ICSE · Class 7 ═══
  'icse-7-math': [
    'How do I add and subtract integers on a number line?',
    'What is an algebraic expression — how is it different from an equation?',
    'Find the area of a parallelogram with base 8 cm and height 5 cm.',
  ],
  'icse-7-science': [
    'What is nutrition — why do organisms need different types of food?',
    'How does a thermometer measure temperature?',
    'What happens when an acid reacts with a base?',
  ],
  'icse-7-english': [
    'How do I identify the subject and predicate in a sentence?',
    'What is direct and indirect speech — one example please.',
    'How should I plan a story before writing it?',
  ],
  'icse-7-history_civics': [
    'What was the Delhi Sultanate — who were the main rulers?',
    'What are Fundamental Rights and why do we need them?',
    'What is the role of the President of India?',
  ],
  'icse-7-geography': [
    'What are the major landforms — plains, plateaus and mountains?',
    'Why do coastal areas have a moderate climate?',
    'What is the difference between rotation and revolution of the Earth?',
  ],

  // ═══ ICSE · Class 8 ═══
  'icse-8-math': [
    'What are rational numbers — is 0 a rational number?',
    'How do I solve 2(x − 3) = 10 without making sign errors?',
    'A cuboid is 6 cm × 4 cm × 3 cm — what is its volume?',
  ],
  'icse-8-science': [
    'Pressure = force / area — can you solve a numerical with cm² units?',
    'What is the difference between speed and velocity?',
    'How do friction and lubrication affect machines?',
  ],
  'icse-8-english': [
    'What is a principal clause vs a subordinate clause?',
    'How do I write a formal letter of complaint?',
    'What is active vs passive voice — rewrite one sentence for me.',
  ],
  'icse-8-history_civics': [
    'Explain the key features of the Indian Constitution.',
    'What are the powers of Parliament in law-making?',
    'What caused the Revolt of 1857 — short answer for 5 marks.',
  ],
  'icse-8-geography': [
    'What is the difference between renewable and non-renewable resources?',
    'Name the types of farming in India with one example each.',
    'Why is the monsoon important for Indian agriculture?',
  ],

  // ═══ ICSE · Class 9 ═══
  'icse-9-math': [
    'How do I expand (x + 3)(x − 2)?',
    'Plot the point (−3, 4) on a coordinate plane — which quadrant?',
    'In a right triangle, if legs are 6 cm and 8 cm, find the hypotenuse.',
  ],
  'icse-9-science': [
    'State Newton\'s three laws with a daily-life example each.',
    'What is the law of conservation of energy?',
    'How does the human ear detect sound?',
  ],
  'icse-9-english': [
    'How do I write a report on a school event — format?',
    'What is a relative clause and where does the comma go?',
    'Summarise a passage in 80 words — what do examiners look for?',
  ],
  'icse-9-history_civics': [
    'What were the main ideas of the French Revolution?',
    'How does the Election Commission ensure free and fair elections?',
    'What is federalism — how does India practise it?',
  ],
  'icse-9-geography': [
    'What are the factors affecting the climate of India?',
    'Distinguish between alluvial and black soil — where found?',
    'Why is the Deccan Plateau important geographically?',
  ],

  // ═══ ICSE · Class 10 ═══
  'icse-10-math': [
    'Prove that √3 is irrational.',
    'Solve x² − 5x + 6 = 0 and verify the roots.',
    'The 5th term of an AP is 18 and d = 3 — find the first term.',
  ],
  'icse-10-science': [
    'State Ohm\'s law and solve: R = 10 Ω, V = 5 V — find I.',
    'What is refraction — why does a pencil look bent in water?',
    'Balance: C + O₂ → CO₂ and explain what is being oxidised.',
  ],
  'icse-10-english': [
    'Format of a formal letter to the editor — with word limit.',
    'How do I write a report after a tree plantation drive?',
    'Change to indirect speech: She said, "I have never been to Delhi."',
  ],
  'icse-10-history_civics': [
    'Explain nationalism in India in the 20th century.',
    'What were the causes and consequences of the Revolt of 1857?',
    'What is the role of the Supreme Court as guardian of the Constitution?',
  ],
  'icse-10-geography': [
    'Explain the mechanism of the Indian monsoon.',
    'Why do industries locate near raw materials or ports?',
    'What is the difference between conventional and non-conventional energy?',
  ],

  // ═══ CBSE · Class 11 (senior) ═══
  'cbse-11-math': [
    'What is a set — how do I write A ∪ B and A ∩ B?',
    'Prove that sin²θ + cos²θ = 1 using a right triangle.',
    'How do I find the domain and range of f(x) = √(x − 2)?',
  ],
  'cbse-11-physics': [
    'Derive the three equations of motion from v = u + at.',
    'What is the difference between scalar and vector quantities?',
    'Why is work done zero when you carry a bag horizontally?',
  ],
  'cbse-11-chemistry': [
    'What is the Aufbau principle — how do I fill orbitals?',
    'Balance: KMnO₄ + H₂SO₄ + FeSO₄ → ... (redox hint please).',
    'State Boyle\'s law with a graph — what stays constant?',
  ],
  'cbse-11-biology': [
    'What are the five kingdoms of classification — one example each?',
    'Draw and label a typical plant cell vs animal cell.',
    'What is photosynthesis — write the balanced equation.',
  ],
  'cbse-11-accountancy': [
    'What is the accounting equation — show with a transaction example.',
    'Difference between capital expenditure and revenue expenditure?',
    'How do I record credit purchases in the purchases book?',
  ],
  'cbse-11-business': [
    'What is the difference between business, profession and employment?',
    'Explain sole proprietorship — two advantages and two limitations.',
    'What are business ethics — why do they matter?',
  ],
  'cbse-11-economics': [
    'What is scarcity — why is it the root of economic problems?',
    'Distinguish between microeconomics and macroeconomics.',
    'What is a production possibility curve — why is it downward sloping?',
  ],
  'cbse-11-history': [
    'What sources do historians use to study Harappan civilisation?',
    'Why is the 1857 revolt called the First War of Independence by some?',
    'What were the main features of the Indian National Congress in 1885?',
  ],
  'cbse-11-political_science': [
    'What is political theory — why do we need it?',
    'Explain liberty vs licence with an example.',
    'What is equality — formal vs substantive equality?',
  ],
  'cbse-11-english': [
    'How do I write a notice for a school debate competition?',
    'What is the format of an article for the school magazine?',
    'How do I analyse a poem — what should my answer include?',
  ],

  // ═══ CBSE · Class 12 ═══
  'cbse-12-math': [
    'Find dy/dx if y = x³ sin x (product rule).',
    'Evaluate ∫₀¹ (2x + 1) dx step by step.',
    'A bag has 4 red and 6 blue balls — P(drawing red) without replacement?',
  ],
  'cbse-12-physics': [
    'State Gauss\'s law and use it for a point charge.',
    'What is the photoelectric effect — explain Einstein\'s equation.',
    'Draw the I-V characteristic of a p-n junction diode.',
  ],
  'cbse-12-chemistry': [
    'Why does rate of reaction increase with temperature — Arrhenius idea?',
    'What is a buffer solution — give one example?',
    'Distinguish between SN1 and SN2 mechanisms.',
  ],
  'cbse-12-biology': [
    'Explain DNA replication — which enzyme does what?',
    'What is natural selection — give an example from industrial melanism.',
    'How does the human heart pump blood — one cardiac cycle overview.',
  ],
  'cbse-12-accountancy': [
    'What is goodwill — when do we need to calculate it?',
    'How do I prepare a Cash Flow Statement from indirect method?',
    'Partnership: X and Y share 3:2 — how to admit a new partner Z?',
  ],
  'cbse-12-business': [
    'What is the difference between management and administration?',
    'Explain the functions of marketing — product, price, place, promotion.',
    'What is financial management — objectives of a firm?',
  ],
  'cbse-12-economics': [
    'Explain the law of demand — why does the demand curve slope downward?',
    'What is GDP — how is it different from GNP?',
    'What are the main challenges to Indian agriculture today?',
  ],
  'cbse-12-history': [
    'What were Gandhi\'s methods in the freedom struggle — non-cooperation to Quit India?',
    'How did the Cold War shape post-1945 world politics?',
    'What was the Partition of India — main political developments?',
  ],
  'cbse-12-political_science': [
    'What is the difference between coalition government and majority government?',
    'Explain India\'s foreign policy principles since independence.',
    'What are pressure groups — how are they different from political parties?',
  ],
  'cbse-12-english': [
    'How do I write a speech on environmental awareness — structure?',
    'What is the word limit for a CBSE Class 12 note-making task?',
    'How do I attempt the reading comprehension section efficiently?',
  ],

  // ═══ ICSE · Class 11 (senior — CISCE-aligned) ═══
  'icse-11-math': [
    'If A = {1, 2, 3} and B = {2, 3, 4}, list all elements of A × B.',
    'Prove by induction: 1 + 2 + … + n = n(n + 1)/2.',
    'Find the principal value of sin⁻¹(1/2).',
  ],
  'icse-11-physics': [
    'A car accelerates from rest to 20 m/s in 5 s — find acceleration and distance.',
    'State Newton\'s laws and give one example where the third law is obvious.',
    'What is kinetic and potential energy — conservation in a pendulum?',
  ],
  'icse-11-chemistry': [
    'Write the electronic configuration of Fe (Z = 26).',
    'What is hybridisation in CH₄ — sp³ explanation?',
    'Define mole — how many molecules in 18 g of water?',
  ],
  'icse-11-biology': [
    'What is binomial nomenclature — write the scientific name format.',
    'Describe the structure of a nephron briefly.',
    'What is mitosis — when does it occur in the human body?',
  ],
  'icse-11-accountancy': [
    'Journal entry: bought goods worth ₹5,000 on credit from Ram & Sons.',
    'What is depreciation — straight line vs written down value?',
    'Trial balance does not tally — what are the first checks?',
  ],
  'icse-11-business': [
    'What is a joint stock company — advantages over partnership?',
    'Explain the steps in planning as a management function.',
    'What is social responsibility of business — two examples.',
  ],
  'icse-11-economics': [
    'What is opportunity cost — give a student\'s example.',
    'Why is the demand curve downward sloping — income and substitution effect?',
    'What is inflation — how does it affect savers and borrowers?',
  ],
  'icse-11-history': [
    'What was the Rowlatt Act and why did Indians protest?',
    'Describe the features of the Indus Valley Civilisation.',
    'What was the Khilafat Movement — who led it?',
  ],
  'icse-11-political_science': [
    'What is the difference between fundamental rights and directive principles?',
    'Explain the structure of the Indian Parliament.',
    'What is judicial review — why is the Supreme Court called guardian?',
  ],
  'icse-11-english': [
    'How do I write a notice for an inter-house quiz?',
    'What is the format of a formal email to a principal?',
    'How do I summarise a passage without copying phrases?',
  ],

  // ═══ ICSE · Class 12 ═══
  'icse-12-math': [
    'Find ∫ x eˣ dx using integration by parts.',
    'If A is a 2×2 matrix, what is |A| and when is A⁻¹ defined?',
    'A die is thrown twice — probability of getting a sum of 7.',
  ],
  'icse-12-physics': [
    'State Lenz\'s law — how does it follow from conservation of energy?',
    'What is de Broglie wavelength — formula and one application?',
    'Explain amplitude modulation vs frequency modulation simply.',
  ],
  'icse-12-chemistry': [
    'What is the order of a reaction — how to find it from rate law?',
    'Explain the preparation and properties of ethanol.',
    'What is isomerism — structural vs stereoisomerism?',
  ],
  'icse-12-biology': [
    'What is a test cross — why did Mendel use it?',
    'Explain the process of transcription in a eukaryotic cell.',
    'What is biodiversity — why should we conserve hotspots?',
  ],
  'icse-12-accountancy': [
    'How do I calculate sacrificing ratio when a partner retires?',
    'What is a cash flow statement — operating activities section?',
    'Difference between shares and debentures for a company?',
  ],
  'icse-12-business': [
    'What is staffing — steps in the selection process?',
    'Explain controlling as a function of management.',
    'What is marketing mix — 4 Ps with examples.',
  ],
  'icse-12-economics': [
    'What is balance of payments — current vs capital account?',
    'Explain the role of RBI in controlling money supply.',
    'What is sustainable development — trade-off with growth?',
  ],
  'icse-12-history': [
    'What was the Non-Aligned Movement — why did India join?',
    'Explain the causes of the First World War in brief.',
    'What were the main outcomes of the French Revolution?',
  ],
  'icse-12-political_science': [
    'What is globalisation — impact on Indian economy and culture?',
    'Explain the role of the UN Security Council.',
    'What is regionalism in Indian politics — one example.',
  ],
  'icse-12-english': [
    'How do I write a report on a blood donation camp?',
    'What is the format of a proposal — school project context?',
    'How do I attempt grammar transformation questions quickly?',
  ],
};

/** Stream-tuned overrides for Class 11–12 where wording differs by stream. */
const STREAM_PROMPTS: Record<string, PromptTriple> = {
  'cbse-11-economics-commerce': [
    'What is a production possibility curve — opportunity cost from it?',
    'Why does demand fall when price rises — law of demand?',
    'What is a firm\'s cost — fixed vs variable costs?',
  ],
  'cbse-12-economics-commerce': [
    'Explain the law of demand with a numerical schedule.',
    'What is price elasticity of demand — elastic vs inelastic?',
    'How does the government budget affect aggregate demand?',
  ],
  'cbse-11-economics-humanities': [
    'What is Indian economic development since 1991 — liberalisation?',
    'Distinguish between economic growth and economic development.',
    'What is poverty — absolute vs relative poverty?',
  ],
  'cbse-12-economics-humanities': [
    'What are the main challenges to Indian agriculture today?',
    'Explain employment trends in India — formal vs informal sector.',
    'What is human development index — what does it measure?',
  ],
  'icse-11-economics-commerce': [
    'What is demand — factors that shift the demand curve?',
    'Explain cost concepts: TC, AC, MC with a simple table.',
    'What is perfect competition — features in short?',
  ],
  'icse-12-economics-commerce': [
    'What is national income — GDP at factor cost vs market price?',
    'Explain fiscal deficit and why it matters.',
    'What is monetary policy — repo rate effect on loans?',
  ],
  'icse-11-economics-humanities': [
    'What is sustainable development — three pillars?',
    'Why is education called human capital formation?',
    'What are the main sectors of the Indian economy?',
  ],
  'icse-12-economics-humanities': [
    'What is globalisation — winners and losers in India?',
    'Explain rural development programmes — one example each.',
    'What is environment as a challenge to development?',
  ],
  'cbse-11-english-pcm': [
    'How do I write a notice for a science exhibition?',
    'Format of a formal letter applying for a scholarship.',
    'Reading comprehension — how do I find the central idea fast?',
  ],
  'cbse-11-english-pcb': [
    'How do I write a report on a health awareness camp?',
    'What is note-making from a passage — heading rules?',
    'Change to reported speech: The doctor said, "Take this medicine twice daily."',
  ],
  'cbse-11-english-commerce': [
    'How do I write a notice for a commerce fest?',
    'Format of a letter to the bank manager for an education loan.',
    'What is the format of an advertisement for a coaching class?',
  ],
  'cbse-11-english-humanities': [
    'How do I analyse a poem for the board exam?',
    'What is the format of an article on a social issue?',
    'How do I write a debate speech — for and against structure?',
  ],
  'cbse-12-english-pcm': [
    'How do I write a speech on the importance of mathematics?',
    'Note-making from a science passage — 60-word summary.',
    'What is the format of a poster on road safety?',
  ],
  'cbse-12-english-pcb': [
    'How do I write a report on a tree plantation drive?',
    'Reading comprehension — inference vs factual questions?',
    'Change to indirect speech: She said, "The experiment failed yesterday."',
  ],
  'cbse-12-english-commerce': [
    'How do I write a formal letter to the editor about unemployment?',
    'Format of a notice for an accounts revision class.',
    'What is the word limit for a Class 12 article?',
  ],
  'cbse-12-english-humanities': [
    'How do I write a long answer on a literary character?',
    'What is the format of a speech for the morning assembly?',
    'How do I compare two poems in an exam answer?',
  ],
  'icse-11-english-pcm': [
    'How do I write a notice for a science quiz competition?',
    'Format of a formal letter to the principal for leave.',
    'What is note-making — how many headings for a 200-word passage?',
  ],
  'icse-11-english-pcb': [
    'How do I write a report on a health check-up camp?',
    'Change to reported speech: The nurse said, "Rest for two days."',
    'What is the format of an email to a teacher about a project?',
  ],
  'icse-11-english-commerce': [
    'How do I write a notice for a commerce seminar?',
    'Format of a letter to the bank for opening a student account.',
    'What is the format of an advertisement for a tuition class?',
  ],
  'icse-11-english-humanities': [
    'How do I write a debate on social media and teenagers?',
    'What is the format of an article on gender equality?',
    'How do I analyse a poem — what points fetch marks?',
  ],
  'icse-12-english-pcm': [
    'How do I write a speech on the value of scientific temper?',
    'Note-making from a passage — word limit for the summary?',
    'What is the format of a poster on save electricity?',
  ],
  'icse-12-english-pcb': [
    'How do I write a report on a blood donation camp?',
    'Reading comprehension — how do I answer inference questions?',
    'Change to indirect speech: He said, "The cells were damaged."',
  ],
  'icse-12-english-commerce': [
    'How do I write a formal letter to the editor about price rise?',
    'Format of a notice for an accounts revision test.',
    'What is the word limit for a Class 12 report writing?',
  ],
  'icse-12-english-humanities': [
    'How do I write a long answer comparing two historical sources?',
    'What is the format of a speech for Republic Day assembly?',
    'How do I attempt grammar transformation without losing marks?',
  ],
};

function promptKey(
  board: BoardId,
  classLevel: ClassLevel,
  subject: SubjectKey,
  stream?: StreamId | null,
): string {
  return `${board}-${classLevel}-${subject}${stream ? `-${stream}` : ''}`;
}

export function promptsFor(
  board: BoardId,
  classLevel: ClassLevel,
  subject: SubjectKey,
  stream?: StreamId | null,
): string[] {
  if (classLevel >= 11 && stream) {
    const streamKey = promptKey(board, classLevel, subject, stream);
    if (STREAM_PROMPTS[streamKey]) {
      return [...STREAM_PROMPTS[streamKey]];
    }
  }

  const exact = EXAMPLE_PROMPTS[promptKey(board, classLevel, subject)];
  if (exact) return [...exact];

  // Same class/subject on the other board (senior subjects overlap heavily)
  const otherBoard: BoardId = board === 'icse' ? 'cbse' : 'icse';
  const crossBoard = EXAMPLE_PROMPTS[promptKey(otherBoard, classLevel, subject)];
  if (crossBoard) return [...crossBoard];

  // CBSE social ↔ ICSE split subjects (closest match)
  if (board === 'icse' && subject === 'history_civics') {
    const social = EXAMPLE_PROMPTS[promptKey('cbse', classLevel, 'social')];
    if (social) return [...social];
  }
  if (board === 'cbse' && subject === 'social' && classLevel <= 10) {
    const civics = EXAMPLE_PROMPTS[promptKey('icse', classLevel, 'history_civics')];
    if (civics) return [...civics];
  }

  return naturalFallback(board, classLevel, subject);
}

function naturalFallback(board: BoardId, classLevel: ClassLevel, subject: SubjectKey): string[] {
  const boardTag = board === 'icse' ? 'ICSE' : 'CBSE';
  const fallbacks: Partial<Record<SubjectKey, PromptTriple>> = {
    math: [
      `I'm stuck on a Class ${classLevel} algebra problem — can you walk me through one example?`,
      `How do I avoid silly mistakes in ${boardTag} Class ${classLevel} math numericals?`,
      `Give me one important 3-mark question from our Class ${classLevel} math syllabus.`,
    ],
    science: [
      `Can you explain today's Class ${classLevel} science topic with a simple diagram idea?`,
      `I read the chapter but didn't understand — can you explain in plain words?`,
      `What is one numerical from Class ${classLevel} science that often comes in exams?`,
    ],
    english: [
      `I need help with a Class ${classLevel} grammar question from my workbook.`,
      `What is the correct format for the writing section in ${boardTag} Class ${classLevel}?`,
      `Can you correct this sentence and tell me the rule: "He don't like maths."`,
    ],
    social: [
      `Can you explain the main chapter from Class ${classLevel} Social Science simply?`,
      `What are the important dates and events I should remember for Class ${classLevel}?`,
      `Give me a 5-mark question from Class ${classLevel} Social that could come in the exam.`,
    ],
    history_civics: [
      `Explain the main History & Civics chapter for ICSE Class ${classLevel}.`,
      `What is the difference between the two topics I keep mixing up in Civics?`,
      `Give me one important question from Class ${classLevel} History & Civics.`,
    ],
    geography: [
      `Can you explain the map-work topic for ICSE Class ${classLevel} Geography?`,
      `What is the difference between the two types of rainfall we studied?`,
      `Give me a short answer question from Class ${classLevel} Geography.`,
    ],
    physics: [
      `Derive or explain the main formula from our Class ${classLevel} Physics chapter.`,
      `I can memorise the equation but don't understand it — can you explain physically?`,
      `Solve one typical Class ${classLevel} Physics numerical step by step.`,
    ],
    chemistry: [
      `How do I balance a chemical equation from Class ${classLevel} Chemistry?`,
      `What is the reaction mechanism we studied — explain in simple steps.`,
      `One important Class ${classLevel} Chemistry definition that examiners love.`,
    ],
    biology: [
      `Can you draw and explain the diagram from our Class ${classLevel} Biology chapter?`,
      `What is the difference between the two terms I keep confusing in Biology?`,
      `Give me a 3-mark question from Class ${classLevel} Biology with answer points.`,
    ],
    accountancy: [
      `How do I pass a journal entry for a transaction in Class ${classLevel} Accounts?`,
      `My trial balance doesn't tally — what should I check first?`,
      `Explain one important concept from Class ${classLevel} Accountancy with an example.`,
    ],
    business: [
      `What is the difference between the two management concepts in Class ${classLevel}?`,
      `Can you explain a Business Studies case with a real company example?`,
      `Give me one 4-mark question from Class ${classLevel} Business Studies.`,
    ],
    economics: [
      `Explain the law or curve from Class ${classLevel} Economics with a diagram idea.`,
      `I don't understand the numerical part — can you solve one example?`,
      `What is one current-affairs link to our Class ${classLevel} Economics chapter?`,
    ],
    history: [
      `Summarise the main events of the Class ${classLevel} History chapter we studied.`,
      `Why is this event important — answer in 5 points for the exam.`,
      `Compare two leaders or events from Class ${classLevel} History.`,
    ],
    political_science: [
      `Explain the constitutional provision from Class ${classLevel} Pol Science.`,
      `What is the difference between the two political concepts in our chapter?`,
      `Give me a 6-mark answer outline for Class ${classLevel} Political Science.`,
    ],
  };

  return [...(fallbacks[subject] ?? fallbacks.math!)];
}
