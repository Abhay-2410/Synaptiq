import type { KnowledgeEntry } from './stub-knowledge.js';

/**
 * Stage 1 NCERT seeding (demo-quality, offline stub):
 * - Class 9–10 Mathematics (core chapters)
 * - Science topics are already covered by existing stub knowledge (Physics/Bio)
 *
 * Note: This is structured as "vector-like" keyword buckets; retrieval picks the
 * best-matching entry by keywords, then surfaces the entry's chunks.
 */
export const NCERT_STAGE1_CLASS9_10_MATH: KnowledgeEntry[] = [
  {
    keywords: ['real numbers', 'irrational', 'rational', 'surds', 'sqrt', 'π'],
    chunks: [
      {
        id: 'c9-10-math-real-1',
        content:
          'Class 9–10 Real Numbers: Rational numbers can be written as p/q. Irrational numbers cannot (examples: √2, √3, π). Together they form the set of real numbers.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Real Numbers',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-10-math-real-2',
        content:
          'Decimal idea: terminating/recurring decimals are rational; non-terminating non-recurring decimals are irrational.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Real Numbers',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['polynomial', 'degree', 'zero of polynomial', 'factor theorem', 'remainder theorem'],
    chunks: [
      {
        id: 'c9-math-poly-1',
        content:
          'Polynomials: A polynomial in x has the form a₀ + a₁x + … + aₙxⁿ. Degree is the highest power with a non-zero coefficient. A zero (root) of p(x) is a value α for which p(α)=0.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Polynomials',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-math-poly-2',
        content:
          'Remainder/Factor idea: If you divide p(x) by (x−a), the remainder is p(a). Therefore (x−a) is a factor of p(x) iff p(a)=0.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Polynomials',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['linear equation', 'two variables', 'graph', 'ax+by+c', 'straight line'],
    chunks: [
      {
        id: 'c9-math-linear-1',
        content:
          'Linear Equations in Two Variables: An equation of the form ax + by + c = 0 (with a and b not both zero) represents a straight line on the coordinate plane.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Linear Equations in Two Variables',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-math-linear-2',
        content:
          'Solution means an ordered pair (x,y) that satisfies the equation. A line has infinitely many solutions (all points on the line).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Linear Equations in Two Variables',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['lines and angles', 'parallel lines', 'transversal', 'alternate', 'corresponding', 'co-interior'],
    chunks: [
      {
        id: 'c9-math-la-1',
        content:
          'When a transversal cuts two parallel lines: corresponding angles are equal; alternate interior angles are equal; and co-interior (consecutive interior) angles sum to 180°.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Lines and Angles',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-math-la-2',
        content:
          'Vertically opposite angles are equal. Also, a linear pair of adjacent angles adds up to 180°.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Lines and Angles',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['triangles', 'congruence', 'sas', 'asa', 'sss', 'aap', 'rhs', 'cpct'],
    chunks: [
      {
        id: 'c9-math-tri-1',
        content:
          'Congruence of Triangles: Two triangles are congruent if their size and shape are the same. Criteria include SSS, SAS, ASA, AAS and RHS (right triangle congruence).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Congruence of Triangles',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-math-tri-2',
        content:
          'CPCT: Corresponding Parts of Congruent Triangles are equal.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Congruence of Triangles',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['heron formula', 'area', 'triangle', 'semi-perimeter', 's(s-a)(s-b)(s-c)'],
    chunks: [
      {
        id: 'c9-math-heron-1',
        content:
          'Heron’s Formula: For a triangle with sides a,b,c, semi-perimeter s=(a+b+c)/2. Area = √(s(s−a)(s−b)(s−c)).',
        metadata: {
          subject: 'Mathematics',
          topic: "Heron's Formula",
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['surface area', 'volume', 'cuboid', 'cube', 'cylinder', 'cone', 'sphere', 'mensuration'],
    chunks: [
      {
        id: 'c9-math-mens-1',
        content:
          'Mensuration basics (key formulas): Cuboid volume l×b×h, Cube volume a³, Cylinder volume πr²h, Cone volume (1/3)πr²h, Sphere volume (4/3)πr³.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Surface Areas and Volumes',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-mens-2',
        content:
          'Surface area/combined solids: Many class problems combine solids (e.g., frustum/hemisphere). Convert units consistently before substituting.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Surface Areas and Volumes',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['mean', 'median', 'mode', 'statistics', 'bar graph', 'histogram'],
    chunks: [
      {
        id: 'c9-math-stats-1',
        content:
          'Statistics: Mean = (sum of observations)/n. Median is the middle value when data is ordered. Mode is the most frequent value.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Statistics',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c9-math-stats-2',
        content:
          'Representations: grouped data is often shown using frequency tables and visual tools like bar graphs and histograms.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Statistics',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['probability', 'experimental', 'favourable outcomes', 'trials'],
    chunks: [
      {
        id: 'c9-math-prob-1',
        content:
          'Probability (experimental): P(E) ≈ (number of trials where E occurs)/(total trials). Probability lies between 0 and 1.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Probability',
          classLevel: 9,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['pair of linear equations', 'simultaneous', 'substitution', 'elimination', 'consistent', 'inconsistent'],
    chunks: [
      {
        id: 'c10-math-pl-1',
        content:
          'Pair of Linear Equations in Two Variables: a₁x+b₁y+c₁=0 and a₂x+b₂y+c₂=0. If lines intersect at one point, there is a unique solution; if they coincide, infinitely many; if they are parallel, no solution.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Pair of Linear Equations in Two Variables',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-pl-2',
        content:
          'Solving methods: graphical, substitution, and elimination (choose based on what makes calculations simplest).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Pair of Linear Equations in Two Variables',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['quadratic equations', 'discriminant', 'roots', 'factorisation', 'completing the square', 'quadratic formula'],
    chunks: [
      {
        id: 'c10-math-quad-1',
        content:
          'Quadratic Equations: For ax²+bx+c=0 (a≠0), roots can be found by factorisation, completing the square, or using the quadratic formula.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Quadratic Equations',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-quad-2',
        content:
          'Discriminant Δ=b²−4ac: Δ>0 → two distinct real roots; Δ=0 → repeated real root; Δ<0 → no real roots (complex roots).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Quadratic Equations',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['arithmetic progression', 'nth term', 'common difference', 'sum of n terms', 'AP'],
    chunks: [
      {
        id: 'c10-math-ap-1',
        content:
          'Arithmetic Progression (AP): Terms differ by a constant common difference d. nth term: aₙ = a + (n−1)d.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Arithmetic Progressions',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-ap-2',
        content:
          'Sum: Sₙ = n/2 × (2a + (n−1)d) (also written as n/2 × (a + aₙ)).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Arithmetic Progressions',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['similar triangles', 'aa similarity', 'basic proportionality theorem', 'thales'],
    chunks: [
      {
        id: 'c10-math-sim-1',
        content:
          'Similar Triangles: If corresponding angles are equal, corresponding sides are proportional. Similarity keeps the same shape but can change size.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Similar Triangles',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-sim-2',
        content:
          'Basic Proportionality Theorem (Thales): A line parallel to one side divides the other two sides proportionally.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Similar Triangles',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['coordinate geometry', 'distance formula', 'midpoint', 'section formula', 'area of triangle coordinates'],
    chunks: [
      {
        id: 'c10-math-coord-1',
        content:
          'Coordinate Geometry essentials: Distance between (x₁,y₁) and (x₂,y₂) is √[(x₂−x₁)²+(y₂−y₁)²]. Midpoint is ((x₁+x₂)/2,(y₁+y₂)/2).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Coordinate Geometry',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['trigonometry', 'sin', 'cos', 'tan', 'identities', 'ratios'],
    chunks: [
      {
        id: 'c10-math-trig-1',
        content:
          'Trigonometric ratios (right triangles): sinθ = opposite/hypotenuse, cosθ = adjacent/hypotenuse, tanθ = opposite/adjacent.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Introduction to Trigonometry',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
      {
        id: 'c10-math-trig-2',
        content:
          'Common identities: sin²θ+cos²θ=1. Also, 1+tan²θ=sec²θ (and 1+cot²θ=csc²θ).',
        metadata: {
          subject: 'Mathematics',
          topic: 'Trigonometry Identities',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
  {
    keywords: ['circles', 'tangent', 'radius', 'two tangents', 'theorem'],
    chunks: [
      {
        id: 'c10-math-circle-1',
        content:
          'Tangent to a circle: A tangent touches the circle at exactly one point. The radius to the point of contact is perpendicular to the tangent.',
        metadata: {
          subject: 'Mathematics',
          topic: 'Circles',
          classLevel: 10,
          source: 'ncert-stage1',
        },
      },
    ],
  },
];

