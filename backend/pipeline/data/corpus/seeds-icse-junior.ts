import type { ChapterSeed } from './helpers.js';

/** CISCE-aligned ICSE corpus — Classes 6–10 (split History & Civics / Geography). */
export const SEEDS_ICSE_JUNIOR: ChapterSeed[] = [
  // ─── Mathematics ───
  {
    classLevel: 8,
    subjectKey: 'math',
    board: 'icse',
    chapter: 'Rational Numbers',
    topic: 'Properties of Rational Numbers',
    keywords: ['rational numbers', 'closure', 'commutative', 'associative', 'reciprocal'],
    content: [
      'A rational number can be written as p/q where p and q are integers and q ≠ 0. Rational numbers are closed under addition, subtraction and multiplication.',
      'Every non-zero rational number has a multiplicative inverse (reciprocal). ICSE papers often test closure properties with counter-examples involving division by zero.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'math',
    board: 'icse',
    chapter: 'Quadratic Equations',
    topic: 'Solving Quadratics',
    keywords: ['quadratic', 'factorisation', 'discriminant', 'roots', 'x squared'],
    content: [
      'A quadratic equation has the form ax² + bx + c = 0 (a ≠ 0). ICSE expects factorisation when possible; otherwise use the quadratic formula.',
      'The discriminant b² − 4ac determines nature of roots: positive (two distinct real), zero (equal real), negative (no real roots).',
    ],
  },
  // ─── Science ───
  {
    classLevel: 8,
    subjectKey: 'science',
    board: 'icse',
    chapter: 'Force and Pressure',
    topic: 'Pressure in Fluids',
    keywords: ['pressure', 'force', 'area', 'pascal', 'atmospheric pressure'],
    content: [
      'Pressure = force / area (P = F/A). SI unit is pascal (Pa). Liquids and gases exert pressure equally in all directions at a point.',
      'Atmospheric pressure at sea level is about 101,325 Pa (1 atm). ICSE numericals often use cm² — convert to m² before calculating.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'science',
    board: 'icse',
    chapter: 'Electricity',
    topic: "Ohm's Law and Resistance",
    keywords: ['ohms law', 'resistance', 'current', 'voltage', 'series', 'parallel'],
    content: [
      "Ohm's law: V = IR for conductors at constant temperature. Resistance depends on material, length and cross-section (R = ρL/A).",
      'In series circuits current is same; in parallel voltage is same across branches. ICSE often combines circuit diagrams with heat effects (H = I²Rt).',
    ],
  },
  // ─── English ───
  {
    classLevel: 8,
    subjectKey: 'english',
    board: 'icse',
    chapter: 'Grammar — Clauses',
    topic: 'Principal and Subordinate Clauses',
    keywords: ['clause', 'subordinate', 'principal', 'adverb clause', 'noun clause'],
    content: [
      'A clause contains a subject and predicate. A principal (main) clause makes complete sense; a subordinate clause depends on the main clause.',
      'ICSE writing tasks reward clear complex sentences — identify clause type before punctuating (commas with adverb clauses, no comma with restrictive clauses).',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'english',
    board: 'icse',
    chapter: 'Writing Skills',
    topic: 'Formal Letter and Report',
    keywords: ['formal letter', 'report', 'format', 'complaint', 'editor'],
    content: [
      'Formal letters need sender address, date, receiver address, subject line, salutation, body paragraphs, complimentary close and signature.',
      'Reports use title, by-line, introduction, findings/body with sub-headings, conclusion. ICSE marking awards format marks separately from content.',
    ],
  },
  // ─── History & Civics ───
  {
    classLevel: 8,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'The Indian Constitution',
    topic: 'Features and Values of the Constitution',
    keywords: ['Constitution', 'Preamble', 'fundamental rights', 'secular', 'democratic republic'],
    content: [
      'The Indian Constitution came into effect on 26 January 1950. The Preamble declares India a sovereign, socialist, secular, democratic republic committed to justice, liberty, equality and fraternity.',
      'Fundamental Rights (Articles 12–35) protect life, equality, freedom of speech and religion. Directive Principles guide State policy; Fundamental Duties were added by the 42nd Amendment.',
    ],
  },
  {
    classLevel: 8,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'The Union Legislature',
    topic: 'Parliament and Law-making',
    keywords: ['Parliament', 'Lok Sabha', 'Rajya Sabha', 'bill', 'President'],
    content: [
      'The Union Legislature is Parliament, consisting of the President, Lok Sabha (House of the People) and Rajya Sabha (Council of States).',
      'A bill becomes law after passing both Houses and receiving Presidential assent. Money bills originate only in Lok Sabha; Rajya Sabha has limited powers over them.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'Nationalism in India',
    topic: 'The Freedom Struggle in the 20th Century',
    keywords: ['nationalism', 'Gandhi', 'Non-Cooperation', 'Civil Disobedience', 'Quit India', 'freedom struggle'],
    content: [
      'Indian nationalism in the 20th century united diverse groups against British rule. The First World War and economic hardship widened discontent after 1918.',
      'Gandhi led mass movements: Non-Cooperation (1920), Civil Disobedience including Dandi March (1930), and Quit India (1942). Peasants, workers and women participated widely.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'The First War of Independence 1857',
    topic: 'Causes and Consequences of 1857',
    keywords: ['1857', 'revolt', 'sepoy', 'Mangal Pandey', 'Bahadur Shah', 'East India Company'],
    content: [
      'The revolt of 1857 began with sepoy grievances (cartridge issue) at Meerut and spread to Delhi, Kanpur, Lucknow and Jhansi. Leaders included Bahadur Shah Zafar, Nana Saheb and Rani Lakshmibai.',
      'Though suppressed, the revolt ended Company rule; the British Crown took direct control in 1858. ICSE answers should link political annexations, economic exploitation and social interference as causes.',
    ],
  },
  {
    classLevel: 9,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'The Medieval World',
    topic: 'The Delhi Sultanate',
    keywords: ['Delhi Sultanate', 'Qutb-ud-din Aibak', 'Alauddin Khilji', 'Muhammad bin Tughlaq'],
    content: [
      'The Delhi Sultanate (1206–1526) was founded after Muhammad Ghori\'s victories. Early rulers like Qutb-ud-din Aibak built the Qutb Minar complex.',
      'Alauddin Khilji introduced market reforms and repelled Mongol invasions. Muhammad bin Tughlaq\'s token currency experiment failed — a favourite ICSE evaluation question.',
    ],
  },
  // ─── Geography ───
  {
    classLevel: 8,
    subjectKey: 'geography',
    board: 'icse',
    chapter: 'Resources',
    topic: 'Classification and Conservation',
    keywords: ['resource', 'renewable', 'non-renewable', 'conservation', 'sustainable development'],
    content: [
      'Resources are classified as natural or human-made; renewable (solar, wind, forests) vs non-renewable (coal, petroleum). Utility and technology determine whether something is a resource.',
      'Sustainable development meets present needs without compromising future generations. ICSE map work may ask location of coal fields and petroleum refineries.',
    ],
  },
  {
    classLevel: 8,
    subjectKey: 'geography',
    board: 'icse',
    chapter: 'Agriculture',
    topic: 'Types of Farming in India',
    keywords: ['agriculture', 'subsistence', 'commercial', 'plantation', 'green revolution', 'rice', 'wheat'],
    content: [
      'Farming types include subsistence (family needs), commercial (market sale) and plantation (tea, coffee, rubber on estates). India has diverse cropping patterns due to climate and soil.',
      'Green Revolution increased food grain output via HYV seeds and irrigation. ICSE distinguishes between rabi and kharif crops with sowing/harvest seasons.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'geography',
    board: 'icse',
    chapter: 'Climate of India',
    topic: 'Monsoon and Seasonal Variation',
    keywords: ['monsoon', 'climate', 'southwest monsoon', 'retreating monsoon', 'rainfall'],
    content: [
      'India has tropical monsoon climate. Southwest monsoon (June–September) brings most rainfall; northeast monsoon affects Tamil Nadu coast in winter.',
      'Western Ghats receive heavy orographic rainfall; leeward Deccan lies in rain shadow. ICSE map-point questions often test wind direction and rainy months.',
    ],
  },
  {
    classLevel: 10,
    subjectKey: 'geography',
    board: 'icse',
    chapter: 'Manufacturing Industries',
    topic: 'Location Factors and Major Industries',
    keywords: ['industry', 'iron steel', 'textile', 'IT', 'Bengaluru', 'Jamshedpur'],
    content: [
      'Industries locate near raw materials, markets, labour and transport. Iron and steel at Jamshedpur (iron ore, coal); cotton textiles in Maharashtra and Gujarat.',
      'Information technology hubs developed in Bengaluru, Hyderabad and Pune due to skilled labour and connectivity. Pollution control is a key ICSE civics-geography link.',
    ],
  },
  {
    classLevel: 6,
    subjectKey: 'history_civics',
    board: 'icse',
    chapter: 'The Constitution of India',
    topic: 'Basic Ideas of Democracy',
    keywords: ['democracy', 'Constitution', 'equality', 'election', 'rights'],
    content: [
      'Democracy means people choose their leaders through elections and enjoy equal rights before law. The Constitution is the supreme law defining how India is governed.',
      'ICSE junior civics introduces fundamental rights and duties in simple language — connect classroom examples (school elections) to national democracy.',
    ],
  },
  {
    classLevel: 6,
    subjectKey: 'geography',
    board: 'icse',
    chapter: 'The Earth and the Solar System',
    topic: 'Latitudes, Longitudes and Maps',
    keywords: ['latitude', 'longitude', 'equator', 'hemisphere', 'map', 'scale'],
    content: [
      'Latitudes run east-west; longitudes run north-south. The equator (0°) divides hemispheres; Prime Meridian (0°) passes through Greenwich.',
      'Map scale shows ratio between map distance and ground distance. ICSE beginners practise finding locations using coordinates and compass directions.',
    ],
  },
];
