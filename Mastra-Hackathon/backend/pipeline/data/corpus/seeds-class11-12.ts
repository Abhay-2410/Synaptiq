import type { ChapterSeed } from './helpers.js';

type C = 11 | 12;

function mk(
  classLevel: C,
  subjectKey: ChapterSeed['subjectKey'],
  chapter: string,
  topic: string,
  keywords: string[],
  content: string[],
): ChapterSeed {
  return { classLevel, subjectKey, chapter, topic, keywords, content };
}

// ─── Class 11 Mathematics (NCERT) ───────────────────────────────────────────

const MATH_11: ChapterSeed[] = [
  mk(11, 'math', 'Sets', 'Sets and their Representations', ['sets', 'roster', 'set-builder', 'empty set', 'subset'], [
    'A set is a well-defined collection of distinct objects. Sets can be represented in roster form {1, 2, 3} or set-builder form {x : x is a natural number less than 4}. The empty set ∅ contains no elements.',
    'Subsets: A is a subset of B if every element of A belongs to B, written A ⊆ B. A proper subset satisfies A ⊆ B and A ≠ B. Power set P(A) is the set of all subsets of A; if |A| = n then |P(A)| = 2ⁿ.',
  ]),
  mk(11, 'math', 'Relations and Functions', 'Relations', ['relations', 'domain', 'codomain', 'range', 'cartesian product'], [
    'A relation R from set A to set B is a subset of A × B. Domain is the set of first elements; range is the set of second elements appearing in ordered pairs of R.',
    'A function f: A → B is a relation where every element of A is associated with exactly one element of B. Vertical line test on graphs: each x maps to at most one y.',
  ]),
  mk(11, 'math', 'Relations and Functions', 'Types of Functions', ['one-one', 'onto', 'bijective', 'injective', 'surjective'], [
    'Injective (one-one): distinct inputs give distinct outputs. Surjective (onto): every element of codomain has a preimage. Bijective functions are both injective and surjective.',
    'Composition of functions: (f ∘ g)(x) = f(g(x)). Identity function I(x) = x. Inverse function f⁻¹ exists only for bijections.',
  ]),
  mk(11, 'math', 'Trigonometric Functions', 'Angles and Radian Measure', ['trigonometry', 'radian', 'degree', 'unit circle'], [
    'One radian is the angle subtended at the centre of a circle by an arc equal in length to the radius. 180° = π radians. Conversion: radians = degrees × π/180.',
    'In the unit circle, coordinates of a point at angle θ are (cos θ, sin θ). Signs of trigonometric ratios in quadrants follow ASTC (All, Sin, Tan, Cos positive in I, II, III, IV respectively).',
  ]),
  mk(11, 'math', 'Trigonometric Functions', 'Trigonometric Identities', ['sin', 'cos', 'tan', 'identities', 'period'], [
    'Fundamental identities: sin²θ + cos²θ = 1; 1 + tan²θ = sec²θ; 1 + cot²θ = cosec²θ. sin(−θ) = −sin θ; cos(−θ) = cos θ.',
    'Periodicity: sin and cos have period 2π; tan has period π. General solutions: sin θ = sin α ⇒ θ = nπ + (−1)ⁿα; cos θ = cos α ⇒ θ = 2nπ ± α.',
  ]),
  mk(11, 'math', 'Complex Numbers', 'Algebra of Complex Numbers', ['complex numbers', 'i', 'modulus', 'argument', 'conjugate'], [
    'Complex number z = a + ib where i² = −1. Modulus |z| = √(a² + b²). Conjugate z̄ = a − ib; z·z̄ = |z|². Argand plane represents z as point (a, b).',
    'Polar form: z = r(cos θ + i sin θ) = re^(iθ) where r = |z| and θ = arg(z). De Moivre\'s theorem: (cos θ + i sin θ)ⁿ = cos nθ + i sin nθ.',
  ]),
  mk(11, 'math', 'Linear Inequalities', 'Linear Inequalities in One Variable', ['inequalities', 'solution set', 'number line'], [
    'Linear inequality ax + b < 0 (or ≤, >, ≥) is solved like equations but reversing the inequality sign when multiplying or dividing by a negative number.',
    'Solution set is represented on a number line. Open circle for strict inequality; closed circle for ≤ or ≥. Intersection and union combine solution sets of compound inequalities.',
  ]),
  mk(11, 'math', 'Permutations and Combinations', 'Fundamental Principle of Counting', ['permutation', 'combination', 'factorial', 'nPr', 'nCr'], [
    'If an event can occur in m ways and a second in n ways, both can occur in m × n ways (multiplication principle). n! = n × (n−1) × … × 1; 0! = 1.',
    'Permutation ⁿPᵣ = n!/(n−r)! counts ordered arrangements. Combination ⁿCᵣ = n!/[r!(n−r)!] counts unordered selections. ⁿCᵣ = ⁿCₙ₋ᵣ.',
  ]),
  mk(11, 'math', 'Binomial Theorem', 'Binomial Expansion', ['binomial theorem', 'pascal triangle', 'general term'], [
    'For positive integer n: (a + b)ⁿ = Σ ₖ₌₀ⁿ ⁿCₖ aⁿ⁻ᵏ bᵏ. Coefficients appear in Pascal\'s triangle where each entry is sum of two above it.',
    'General term Tₖ₊₁ = ⁿCₖ aⁿ⁻ᵏ bᵏ. Middle term(s): one term if n even at (n/2 + 1)th position; two terms if n odd at (n+1)/2 and (n+3)/2 positions.',
  ]),
  mk(11, 'math', 'Sequences and Series', 'Arithmetic and Geometric Progressions', ['AP', 'GP', 'sum', 'nth term', 'arithmetic progression'], [
    'AP: nth term aₙ = a + (n−1)d; sum Sₙ = n/2 [2a + (n−1)d] = n/2 (a + l). GP: nth term aₙ = arⁿ⁻¹; sum Sₙ = a(rⁿ−1)/(r−1) for r ≠ 1.',
    'Arithmetic mean of a and b is (a+b)/2. Geometric mean is √(ab). Sum of infinite GP S = a/(1−r) when |r| < 1.',
  ]),
  mk(11, 'math', 'Straight Lines', 'Slope and Equations of Lines', ['straight lines', 'slope', 'point-slope', 'intercept form'], [
    'Slope m = tan θ = (y₂−y₁)/(x₂−x₁). Point-slope form: y − y₁ = m(x − x₁). Slope-intercept: y = mx + c. Two-point form uses two given points.',
    'Intercept form: x/a + y/b = 1. Normal form: x cos α + y sin α = p. Distance from point (x₁,y₁) to line ax + by + c = 0 is |ax₁ + by₁ + c|/√(a²+b²).',
  ]),
  mk(11, 'math', 'Conic Sections', 'Parabola, Ellipse, Hyperbola', ['conic sections', 'parabola', 'ellipse', 'hyperbola', 'eccentricity'], [
    'Parabola y² = 4ax has focus (a, 0) and directrix x = −a. Ellipse x²/a² + y²/b² = 1 (a > b) has foci at (±c, 0) where c² = a² − b²; eccentricity e = c/a < 1.',
    'Hyperbola x²/a² − y²/b² = 1 has foci at (±c, 0), c² = a² + b², e > 1. Latus rectum lengths: parabola 4a; ellipse 2b²/a; hyperbola 2b²/a.',
  ]),
  mk(11, 'math', 'Introduction to Three Dimensional Geometry', 'Coordinates in 3D', ['3D geometry', 'distance formula', 'direction cosines'], [
    'Point in space: P(x, y, z). Distance between P₁(x₁,y₁,z₁) and P₂(x₂,y₂,z₂) is √[(x₂−x₁)² + (y₂−y₁)² + (z₂−z₁)²].',
    'Direction cosines l, m, n of a line satisfy l² + m² + n² = 1. Direction ratios (a, b, c) are proportional to direction cosines: l = a/√(a²+b²+c²), etc.',
  ]),
  mk(11, 'math', 'Limits and Derivatives', 'Limits and Continuity', ['limits', 'derivatives', 'continuity', 'first principle'], [
    'limₓ→ₐ f(x) = L means f(x) approaches L as x approaches a. Standard limits: lim sin x/x = 1; lim (1+x)ⁿ = 1. limₓ→₀ (eˣ−1)/x = 1.',
    'Derivative f\'(x) = limₕ→₀ [f(x+h) − f(x)]/h. Rules: (xⁿ)\' = nxⁿ⁻¹; (uv)\' = u\'v + uv\'; (u/v)\' = (u\'v − uv\')/v². Geometric meaning: slope of tangent.',
  ]),
  mk(11, 'math', 'Statistics', 'Measures of Dispersion', ['statistics', 'mean deviation', 'variance', 'standard deviation'], [
    'Mean deviation about mean: MD = Σ|xᵢ − x̄|/n. Variance σ² = Σ(xᵢ − μ)²/n (population) or s² = Σ(xᵢ − x̄)²/(n−1) (sample).',
    'Standard deviation σ = √variance. Coefficient of variation CV = (σ/μ) × 100% compares variability across datasets with different means.',
  ]),
  mk(11, 'math', 'Probability', 'Axiomatic Approach to Probability', ['probability', 'sample space', 'event', 'conditional probability'], [
    'Sample space S is the set of all outcomes. P(E) = n(E)/n(S) for equally likely outcomes. Axioms: 0 ≤ P(E) ≤ 1; P(S) = 1; P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
    'Complement: P(E\') = 1 − P(E). For independent events A and B: P(A ∩ B) = P(A)·P(B). Bayes\' theorem relates conditional probabilities P(A|B) = P(B|A)P(A)/P(B).',
  ]),
];

// ─── Class 12 Mathematics (NCERT) ─────────────────────────────────────────

const MATH_12: ChapterSeed[] = [
  mk(12, 'math', 'Relations and Functions', 'Types of Relations', ['equivalence relation', 'reflexive', 'symmetric', 'transitive'], [
    'Reflexive: (a,a) ∈ R for all a. Symmetric: (a,b) ∈ R ⇒ (b,a) ∈ R. Transitive: (a,b),(b,c) ∈ R ⇒ (a,c) ∈ R. Equivalence relations satisfy all three and partition the set into equivalence classes.',
    'Empty relation is symmetric and transitive but not reflexive (unless A = ∅). Universal relation on A is an equivalence relation.',
  ]),
  mk(12, 'math', 'Inverse Trigonometric Functions', 'Principal Values and Properties', ['inverse trig', 'arcsin', 'arccos', 'arctan', 'principal value'], [
    'Principal value branches: sin⁻¹x ∈ [−π/2, π/2]; cos⁻¹x ∈ [0, π]; tan⁻¹x ∈ (−π/2, π/2). Domain of sin⁻¹ and cos⁻¹ is [−1, 1]; tan⁻¹ is ℝ.',
    'Key properties: sin⁻¹x + cos⁻¹x = π/2; tan⁻¹x + cot⁻¹x = π/2 (x > 0). sin⁻¹(−x) = −sin⁻¹x; cos⁻¹(−x) = π − cos⁻¹x.',
  ]),
  mk(12, 'math', 'Matrices', 'Matrix Algebra', ['matrices', 'determinant', 'transpose', 'matrix multiplication'], [
    'Matrix A = [aᵢⱼ]ₘₓₙ has m rows and n columns. Addition and scalar multiplication are element-wise. Product AB defined when columns of A equal rows of B; (AB)ᵢⱼ = Σₖ aᵢₖbₖⱼ.',
    'Transpose Aᵀ swaps rows and columns. (AB)ᵀ = BᵀAᵀ. Identity matrix I satisfies AI = IA = A. A matrix is symmetric if A = Aᵀ.',
  ]),
  mk(12, 'math', 'Determinants', 'Properties and Applications', ['determinants', 'cofactor', 'adjoint', 'inverse matrix'], [
    'Determinant |A| of 2×2 matrix [[a,b],[c,d]] is ad − bc. For 3×3, expand along any row/column using cofactors. |AB| = |A||B|.',
    'Adjoint adj(A) is transpose of cofactor matrix. A⁻¹ = adj(A)/|A| when |A| ≠ 0. System AX = B: unique solution x = A⁻¹B if |A| ≠ 0; no solution or infinitely many if |A| = 0.',
  ]),
  mk(12, 'math', 'Continuity and Differentiability', 'Continuity and Differentiation Rules', ['continuity', 'differentiability', 'chain rule', 'implicit differentiation'], [
    'f is continuous at x = a if limₓ→ₐ f(x) = f(a). Differentiability implies continuity. Standard derivatives: (sin x)\' = cos x; (eˣ)\' = eˣ; (ln x)\' = 1/x.',
    'Chain rule: (f ∘ g)\'(x) = f\'(g(x))·g\'(x). Product rule: (uv)\' = u\'v + uv\'. Quotient rule: (u/v)\' = (u\'v − uv\')/v². Logarithmic differentiation handles products of variable powers.',
  ]),
  mk(12, 'math', 'Applications of Derivatives', 'Rate of Change and Optimisation', ['applications of derivatives', 'maxima', 'minima', 'increasing decreasing'], [
    'f\'(x) > 0 ⇒ f increasing; f\'(x) < 0 ⇒ f decreasing. Critical points satisfy f\'(x) = 0 or f\' undefined. Second derivative test: f\'\'(c) > 0 ⇒ local minimum; f\'\'(c) < 0 ⇒ local maximum.',
    'Tangent equation at (x₁,y₁): y − y₁ = f\'(x₁)(x − x₁). Normal is perpendicular to tangent. Rolle\'s theorem and Mean Value Theorem underpin existence of tangents parallel to secants.',
  ]),
  mk(12, 'math', 'Integrals', 'Indefinite and Definite Integrals', ['integration', 'antiderivative', 'definite integral', 'fundamental theorem'], [
    '∫f(x)dx = F(x) + C where F\'(x) = f(x). Standard integrals: ∫xⁿ dx = xⁿ⁺¹/(n+1); ∫eˣ dx = eˣ; ∫1/x dx = ln|x|. Substitution and integration by parts: ∫u dv = uv − ∫v du.',
    'Definite integral ∫ₐᵇ f(x)dx = F(b) − F(a). Fundamental theorem links differentiation and integration. ∫ₐᵇ f(x)dx represents signed area under curve y = f(x).',
  ]),
  mk(12, 'math', 'Applications of Integrals', 'Area Under Curves', ['area under curve', 'area between curves', 'applications of integrals'], [
    'Area bounded by y = f(x), x-axis, x = a and x = b is ∫ₐᵇ |f(x)|dx. Between two curves y = f(x) and y = g(x): ∫ₐᵇ |f(x) − g(x)|dx.',
    'For curves x = φ(y), area is ∫ᶜᵈ x dy. Symmetry can simplify integration over symmetric regions.',
  ]),
  mk(12, 'math', 'Differential Equations', 'Formation and Solution Methods', ['differential equations', 'order', 'degree', 'variable separable'], [
    'Order is highest derivative; degree is power of highest derivative when polynomial in derivatives. General solution contains arbitrary constants; particular solution satisfies given conditions.',
    'Variable separable: dy/dx = f(x)g(y) ⇒ ∫dy/g(y) = ∫f(x)dx. Homogeneous equations dy/dx = f(y/x) solved by substitution y = vx. Linear first-order: dy/dx + Py = Q; integrating factor e^(∫P dx).',
  ]),
  mk(12, 'math', 'Vector Algebra', 'Vectors and Scalar Triple Product', ['vectors', 'dot product', 'cross product', 'scalar triple product'], [
    'Vector a⃗ = a₁î + a₂ĵ + a₃k̂. Magnitude |a⃗| = √(a₁² + a₂² + a₃²). Dot product a⃗·b⃗ = |a||b|cos θ = a₁b₁ + a₂b₂ + a₃b₃. a⃗·b⃗ = 0 ⟺ perpendicular.',
    'Cross product a⃗ × b⃗ is perpendicular to both; |a⃗ × b⃗| = |a||b|sin θ. Scalar triple product a⃗·(b⃗ × c⃗) gives volume of parallelepiped. [a⃗ b⃗ c⃗] = 0 ⟹ coplanar vectors.',
  ]),
  mk(12, 'math', 'Three Dimensional Geometry', 'Lines and Planes in 3D', ['3D geometry', 'line equation', 'plane equation', 'angle between planes'], [
    'Vector equation of line: r⃗ = a⃗ + λb⃗ where a⃗ is position vector of point and b⃗ is direction vector. Cartesian form: (x−x₁)/a = (y−y₁)/b = (z−z₁)/c.',
    'Plane equation: r⃗·n⃗ = d or ax + by + cz + d = 0 where n⃗ = (a,b,c) is normal. Distance from point to plane |ax₁ + by₁ + cz₁ + d|/√(a²+b²+c²). Angle between planes from dot product of normals.',
  ]),
  mk(12, 'math', 'Linear Programming', 'Graphical Method', ['linear programming', 'feasible region', 'objective function', 'corner point'], [
    'Maximise or minimise Z = ax + by subject to linear constraints and x, y ≥ 0. Feasible region is intersection of half-planes; optimal value occurs at a corner point of bounded region.',
    'Corner point method: evaluate Z at each vertex of feasible polygon. Unbounded feasible region may lack optimal solution unless objective is bounded in feasible direction.',
  ]),
  mk(12, 'math', 'Probability', 'Conditional Probability and Distributions', ['conditional probability', 'bayes theorem', 'random variable', 'binomial distribution'], [
    'P(A|B) = P(A ∩ B)/P(B). Total probability: P(A) = Σ P(A|Bᵢ)P(Bᵢ). Bayes\' theorem updates prior probabilities with evidence.',
    'Random variable X assigns numerical value to outcomes. Binomial distribution B(n,p): P(X = r) = ⁿCᵣ pʳ(1−p)ⁿ⁻ʳ; mean = np, variance = np(1−p).',
  ]),
];

// ─── Class 11 Physics (NCERT) ───────────────────────────────────────────────

const PHYSICS_11: ChapterSeed[] = [
  mk(11, 'physics', 'Physical World', 'Scope and Excitement of Physics', ['physical world', 'fundamental forces', 'scope of physics'], [
    'Physics studies matter, energy, and their interactions through observation, experimentation, and mathematical modelling. It connects phenomena from subatomic scales to cosmology.',
    'Four fundamental forces: gravitational (weakest, infinite range), electromagnetic, strong nuclear (short range), and weak nuclear. Conservation laws—energy, momentum, charge—are pillars of physical reasoning.',
  ]),
  mk(11, 'physics', 'Units and Measurements', 'SI Units and Errors', ['SI units', 'dimensional analysis', 'significant figures', 'errors'], [
    'Seven base SI units: metre, kilogram, second, ampere, kelvin, mole, candela. Derived units combine base units (e.g. N = kg·m/s²). Dimensional formula uses M, L, T, A, K, mol, cd.',
    'Significant figures reflect measurement precision. Absolute error Δa = |aₘₑₐₛ − aₜᵣᵤₑ|; relative error = Δa/a. Propagation: for z = x ± y, Δz = Δx + Δy; for z = xy, Δz/z ≈ Δx/x + Δy/y.',
  ]),
  mk(11, 'physics', 'Motion in a Straight Line', 'Kinematics in One Dimension', ['kinematics', 'velocity', 'acceleration', 'equations of motion'], [
    'Displacement is change in position (vector); distance is path length (scalar). Average velocity v̄ = Δx/Δt; instantaneous velocity v = dx/dt. Acceleration a = dv/dt.',
    'For uniform acceleration: v = u + at; s = ut + ½at²; v² = u² + 2as. Free fall: a = g ≈ 9.8 m/s² downward. Position-time graph slope gives velocity; velocity-time graph slope gives acceleration, area gives displacement.',
  ]),
  mk(11, 'physics', 'Motion in a Plane', 'Projectile and Circular Motion', ['projectile motion', 'relative velocity', 'uniform circular motion'], [
    'Projectile motion: horizontal velocity constant; vertical motion under gravity. Range R = u²sin2θ/g; maximum height H = u²sin²θ/(2g); time of flight T = 2u sinθ/g.',
    'Uniform circular motion: speed constant but velocity changes direction. Centripetal acceleration a = v²/r directed toward centre. Angular velocity ω = v/r; period T = 2π/ω.',
  ]),
  mk(11, 'physics', 'Laws of Motion', "Newton's Laws and Friction", ['newton laws', 'inertia', 'friction', 'impulse'], [
    'First law (inertia): body remains at rest or uniform motion unless net external force acts. Second law: F⃗_net = m a⃗. Third law: action-reaction pairs act on different bodies, equal magnitude, opposite direction.',
    'Static friction fₛ ≤ μₛN; kinetic friction fₖ = μₖN. Impulse J = FΔt = Δp. Momentum p⃗ = m v⃗ is conserved in isolated system.',
  ]),
  mk(11, 'physics', 'Work, Energy and Power', 'Work-Energy Theorem', ['work', 'kinetic energy', 'potential energy', 'power', 'conservation of energy'], [
    'Work W = F⃗·d⃗ = Fd cos θ. Kinetic energy KE = ½mv². Potential energy U = mgh (near Earth). Work-energy theorem: W_net = ΔKE.',
    'Conservative forces: work independent of path; mechanical energy E = KE + U conserved. Power P = dW/dt = F⃗·v⃗. Average power = total work/time.',
  ]),
  mk(11, 'physics', 'System of Particles and Rotational Motion', 'Centre of Mass and Rotation', ['centre of mass', 'torque', 'angular momentum', 'moment of inertia'], [
    'Centre of mass: r⃗_cm = Σmᵢr⃗ᵢ/Σmᵢ. Torque τ⃗ = r⃗ × F⃗. Angular momentum L⃗ = r⃗ × p⃗ = Iω for rigid body. τ = dL/dt.',
    'Moment of inertia I = Σmr² depends on axis. Parallel axis theorem: I = I_cm + Md². Rotational KE = ½Iω². Rolling without slipping: v = Rω.',
  ]),
  mk(11, 'physics', 'Gravitation', "Newton's Law and Kepler's Laws", ['gravitation', 'kepler laws', 'orbital velocity', 'escape velocity'], [
    'Universal gravitation F = Gm₁m₂/r². Gravitational field g = GM/r² near surface. Kepler\'s laws: orbits are ellipses with Sun at focus; equal areas in equal times; T² ∝ r³.',
    'Orbital velocity v₀ = √(GM/r). Escape velocity vₑ = √(2GM/R) ≈ 11.2 km/s from Earth. Geostationary orbit period 24 h at ~36,000 km altitude.',
  ]),
  mk(11, 'physics', 'Mechanical Properties of Solids', 'Elasticity and Stress-Strain', ['elasticity', 'stress', 'strain', 'young modulus'], [
    'Stress = force/area (Pa): tensile, compressive, shear. Strain = fractional deformation (dimensionless). Hooke\'s law: stress ∝ strain within elastic limit.',
    'Young\'s modulus Y = tensile stress/tensile strain. Bulk modulus B = −ΔP/(ΔV/V). Shear modulus G relates shear stress to shear strain. Elastic potential energy = ½ × stress × strain × volume.',
  ]),
  mk(11, 'physics', 'Mechanical Properties of Fluids', 'Pressure and Bernoulli', ['fluids', 'pressure', 'pascal law', 'bernoulli principle', 'viscosity'], [
    'Pressure P = F/A. Pascal\'s law: pressure transmitted undiminished in enclosed fluid. Hydrostatic pressure P = P₀ + ρgh. Archimedes\' principle: buoyant force equals weight of displaced fluid.',
    'Bernoulli equation: P + ½ρv² + ρgh = constant along streamline. Viscosity causes drag; Stokes\' law F = 6πηrv for sphere in viscous fluid at low Reynolds number.',
  ]),
  mk(11, 'physics', 'Thermal Properties of Matter', 'Heat Transfer and Expansion', ['thermal expansion', 'specific heat', 'latent heat', 'heat transfer'], [
    'Linear expansion ΔL = αLΔT; volume expansion ΔV = βVΔT, β ≈ 3α. Heat Q = mcΔT for temperature change without phase change.',
    'Latent heat Q = mL during melting/vaporisation. Conduction: heat through solids; convection: bulk fluid motion; radiation: electromagnetic waves, no medium needed.',
  ]),
  mk(11, 'physics', 'Thermodynamics', 'Laws of Thermodynamics', ['thermodynamics', 'first law', 'second law', 'heat engine', 'carnot'], [
    'Zeroth law defines thermal equilibrium and temperature. First law: ΔU = Q − W (Q heat in, W work by system). Internal energy U depends on state, not path.',
    'Second law: heat cannot spontaneously flow cold to hot; entropy of isolated system never decreases. Carnot engine efficiency η = 1 − T_c/T_h is maximum for heat engines between two temperatures.',
  ]),
  mk(11, 'physics', 'Kinetic Theory', 'Molecular Model of Gases', ['kinetic theory', 'ideal gas', 'rms speed', 'degrees of freedom'], [
    'Ideal gas equation PV = nRT = Nk_BT. Kinetic interpretation: pressure from molecular collisions with walls. RMS speed v_rms = √(3k_BT/m) = √(3RT/M).',
    'Equipartition: energy ½k_BT per degree of freedom per molecule. Monatomic gas U = (3/2)nRT; diatomic at room temperature U = (5/2)nRT. Mean free path λ = 1/(√2 π d² N/V).',
  ]),
  mk(11, 'physics', 'Oscillations', 'Simple Harmonic Motion', ['SHM', 'oscillations', 'pendulum', 'spring', 'damping'], [
    'SHM: a = −ω²x. Displacement x = A sin(ωt + φ). Period T = 2π/ω. Spring: T = 2π√(m/k). Simple pendulum (small angles): T = 2π√(L/g).',
    'Total energy E = ½kA² = ½mω²A² constant. Damped oscillations decay exponentially; forced oscillations show resonance when driving frequency matches natural frequency.',
  ]),
  mk(11, 'physics', 'Waves', 'Wave Motion and Sound', ['waves', 'superposition', 'standing waves', 'doppler effect', 'sound'], [
    'Wave speed v = fλ. Transverse: displacement perpendicular to propagation; longitudinal: parallel (sound). Superposition principle: displacements add algebraically.',
    'Standing waves: nodes (zero displacement) and antinodes. String fixed at both ends: fₙ = nv/(2L). Doppler effect: f\' = f(v ± v₀)/(v ∓ vₛ) for source/observer motion. Speed of sound in air ≈ 340 m/s at room temperature.',
  ]),
];

// ─── Class 12 Physics (NCERT) ─────────────────────────────────────────────────

const PHYSICS_12: ChapterSeed[] = [
  mk(12, 'physics', 'Electric Charges and Fields', 'Coulomb Law and Electric Field', ['coulomb law', 'electric charge', 'electric field', 'gauss law'], [
    'Like charges repel; unlike attract. Coulomb force F = kq₁q₂/r² along line joining charges; k = 1/(4πε₀) ≈ 9×10⁹ N·m²/C². Charge quantised: q = ne.',
    'Electric field E⃗ = F⃗/q (N/C or V/m). Field of point charge E = kq/r². Gauss law: flux Φ = ∮E⃗·dA⃗ = Q_enclosed/ε₀. Symmetry simplifies field calculation for spheres, cylinders, planes.',
  ]),
  mk(12, 'physics', 'Electrostatic Potential and Capacitance', 'Potential and Capacitors', ['electrostatic', 'electric potential', 'equipotential', 'capacitance', 'dielectric'], [
    'Potential V = kq/r; potential difference ΔV = W/q. Equipotential surfaces perpendicular to field lines. Capacitance C = Q/V. Parallel plate C = ε₀A/d.',
    'Series: 1/C_eq = Σ1/Cᵢ; parallel: C_eq = ΣCᵢ. Energy stored U = ½CV² = ½Q²/C. Dielectric reduces field, increases capacitance: C = κC₀.',
  ]),
  mk(12, 'physics', 'Current Electricity', "Ohm's Law and Circuits", ['current', 'ohms law', 'resistivity', 'kirchhoff', 'wheatstone bridge'], [
    'Current I = dQ/dt (ampere). Ohm\'s law V = IR. Resistivity ρ: R = ρL/A. Temperature dependence R = R₀(1 + αΔT).',
    'Kirchhoff junction rule: ΣI_in = ΣI_out. Loop rule: ΣΔV = 0 around closed loop. Wheatstone bridge balanced when P/Q = R/S, no current through galvanometer.',
  ]),
  mk(12, 'physics', 'Moving Charges and Magnetism', 'Magnetic Force and Biot-Savart', ['magnetic field', 'lorentz force', 'biot-savart', 'ampere law'], [
    'Lorentz force F⃗ = q(E⃗ + v⃗ × B⃗). Force on current element dF⃗ = I d⃗l × B⃗. Circular motion in uniform B: r = mv/(qB).',
    'Biot-Savart: dB⃗ = (μ₀/4π)(I d⃗l × r̂)/r². Field at centre of circular loop B = μ₀I/(2R). Ampere\'s law ∮B⃗·dl⃗ = μ₀I_enclosed for steady currents.',
  ]),
  mk(12, 'physics', 'Magnetism and Matter', 'Magnetic Materials', ['magnetism', 'dia param ferro', 'earth magnetism', 'hysteresis'], [
    'Magnetic dipole moment m⃗ = IA n̂ for current loop. Torque τ⃗ = m⃗ × B⃗. Diamagnetic: weak repulsion (χ < 0). Paramagnetic: weak attraction. Ferromagnetic: strong permanent magnetisation, domains.',
    'Earth\'s magnetic field has declination, dip, and horizontal component. Hysteresis loop relates B and H in ferromagnets; retentivity and coercivity characterise permanent magnets and soft iron cores.',
  ]),
  mk(12, 'physics', 'Electromagnetic Induction', "Faraday's and Lenz's Laws", ['electromagnetic induction', 'faraday law', 'lenz law', 'motional emf', 'eddy current'], [
    'Faraday law: induced emf ε = −dΦ_B/dt. Magnetic flux Φ_B = ∫B⃗·dA⃗. Lenz law: induced current opposes change causing it.',
    'Motional emf ε = Blv for rod moving perpendicular to B. Self-inductance L: ε = −L dI/dt; energy ½LI². Mutual inductance links two coils.',
  ]),
  mk(12, 'physics', 'Alternating Current', 'AC Circuits and Transformers', ['alternating current', 'rms', 'reactance', 'resonance', 'transformer'], [
    'AC voltage V = V₀ sin ωt. RMS values V_rms = V₀/√2, I_rms = I₀/√2; power P = V_rms I_rms cos φ. Inductive reactance X_L = ωL; capacitive X_C = 1/(ωC).',
    'Series LCR: impedance Z = √(R² + (X_L − X_C)²). Resonance when X_L = X_C, f₀ = 1/(2π√(LC)). Transformer: V_s/V_p = N_s/N_p (ideal); power input ≈ output.',
  ]),
  mk(12, 'physics', 'Electromagnetic Waves', 'EM Spectrum and Properties', ['electromagnetic waves', 'maxwell', 'displacement current', 'EM spectrum'], [
    'Maxwell unified electricity and magnetism; changing electric field produces magnetic field and vice versa. Displacement current ε₀ dΦ_E/dt completes Ampere\'s law.',
    'EM waves travel at c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s in vacuum, transverse, need no medium. Spectrum: radio, microwave, infrared, visible, ultraviolet, X-ray, gamma—increasing frequency and energy.',
  ]),
  mk(12, 'physics', 'Ray Optics', 'Reflection, Refraction, and Lenses', ['ray optics', 'refraction', 'lens', 'mirror', 'total internal reflection'], [
    'Snell\'s law n₁ sin θ₁ = n₂ sin θ₂. Mirror formula 1/f = 1/v + 1/u. Lens formula same sign convention. Magnification m = −v/u.',
    'Total internal reflection when light goes denser to rarer beyond critical angle sin θ_c = n₂/n₁. Prism deviation; dispersion separates wavelengths. Optical instruments: microscope, telescope use lens combinations.',
  ]),
  mk(12, 'physics', 'Wave Optics', 'Interference and Diffraction', ['interference', 'young double slit', 'diffraction', 'polarisation'], [
    'Huygens principle: every point on wavefront is source of secondary wavelets. Young\'s double slit: bright fringes at path difference nλ; dark at (n+½)λ. Fringe width β = λD/d.',
    'Single-slit diffraction: central maximum twice width of secondary maxima. Diffraction limit θ ≈ λ/D. Polarisation: transverse EM waves; unpolarised light filtered by polaroid.',
  ]),
  mk(12, 'physics', 'Dual Nature of Radiation and Matter', 'Photoelectric Effect and de Broglie', ['photoelectric effect', 'photon', 'de broglie', 'davisson germer'], [
    'Photoelectric effect: electron emission when light frequency exceeds threshold f₀; KE_max = hf − φ. Einstein photon model E = hf explains instantaneous emission and threshold frequency.',
    'de Broglie wavelength λ = h/p = h/(mv). Matter waves confirmed by Davisson-Germer electron diffraction. Complementarity: wave and particle descriptions both needed.',
  ]),
  mk(12, 'physics', 'Atoms', 'Bohr Model and Spectra', ['bohr model', 'hydrogen spectrum', 'energy levels', 'rydberg'], [
    'Rutherford model: nucleus + orbiting electrons; instability problem. Bohr postulates: quantised angular momentum mvr = nh/(2π); transitions emit/absorb hf = E_i − E_f.',
    'Hydrogen energy E_n = −13.6/n² eV. Lyman (UV), Balmer (visible), Paschen (IR) series from transitions to n = 1, 2, 3. Rydberg formula 1/λ = R(1/n₁² − 1/n₂²).',
  ]),
  mk(12, 'physics', 'Nuclei', 'Nuclear Structure and Reactions', ['nucleus', 'binding energy', 'radioactivity', 'nuclear fission', 'fusion'], [
    'Nuclear radius R ≈ R₀A^(1/3). Binding energy per nucleon peaks near iron; fusion releases energy for light nuclei, fission for heavy. Mass defect Δm converts to energy E = Δmc².',
    'Radioactive decay law N = N₀e^(−λt); half-life t₁/₂ = ln2/λ. Alpha, beta, gamma decay. Controlled fission in reactors; fusion powers stars.',
  ]),
  mk(12, 'physics', 'Semiconductor Electronics', 'Diodes and Transistors', ['semiconductor', 'pn junction', 'diode', 'transistor', 'logic gates'], [
    'Intrinsic semiconductor: equal electron-hole pairs. Doping: n-type (donors), p-type (acceptors). p-n junction diode conducts forward bias (p to +), blocks reverse beyond breakdown.',
    'Transistor amplifies/switches: emitter-base junction forward, collector-base reverse. Logic gates AND, OR, NOT from diode/transistor circuits form digital electronics basis.',
  ]),
];

// ─── Class 11 Chemistry (NCERT) ───────────────────────────────────────────────

const CHEMISTRY_11: ChapterSeed[] = [
  mk(11, 'chemistry', 'Some Basic Concepts of Chemistry', 'Mole Concept and Stoichiometry', ['mole', 'avogadro', 'stoichiometry', 'molar mass', 'empirical formula'], [
    'One mole contains Avogadro number (6.022×10²³) entities. Molar mass in g/mol numerically equals atomic/molecular mass in u. Mass = n × M.',
    'Stoichiometry uses balanced equations: coefficients give mole ratios. Empirical formula gives simplest whole-number ratio; molecular formula = (empirical formula)ₙ.',
  ]),
  mk(11, 'chemistry', 'Structure of Atom', 'Atomic Models and Quantum Numbers', ['atomic structure', 'bohr model', 'quantum numbers', 'orbital', 'aufbau'], [
    'Rutherford: dense positive nucleus; most volume empty. Bohr: electrons in quantised orbits for hydrogen; E_n ∝ −1/n². Limitations led to quantum mechanical model.',
    'Quantum numbers n, l, m_l, m_s describe orbitals. Aufbau principle, Pauli exclusion (max 2 electrons, opposite spins), Hund\'s rule (maximise unpaired spins). s, p, d, f subshell capacities 2, 6, 10, 14.',
  ]),
  mk(11, 'chemistry', 'Classification of Elements and Periodicity', 'Periodic Table Trends', ['periodic table', 'ionisation energy', 'electronegativity', 'atomic radius'], [
    'Modern periodic law: properties periodic function of atomic number. Periods = rows (shells); groups = columns (valence configuration). s, p, d, f blocks by filling subshell.',
    'Trends: atomic radius decreases across period, increases down group. Ionisation energy and electronegativity generally opposite to radius trend. Metallic character decreases across, increases down.',
  ]),
  mk(11, 'chemistry', 'Chemical Bonding and Molecular Structure', 'VSEPR and Hybridisation', ['chemical bonding', 'ionic covalent', 'VSEPR', 'hybridisation', 'molecular orbital'], [
    'Ionic bond: electron transfer; lattice energy high. Covalent: electron sharing; bond order in MO theory. Electronegativity difference predicts polarity.',
    'VSEPR predicts geometry from electron pair repulsion: linear, trigonal planar, tetrahedral, etc. sp, sp², sp³ hybridisation explains bond angles. Hydrogen bonding raises boiling point of H₂O, NH₃.',
  ]),
  mk(11, 'chemistry', 'States of Matter', 'Gas Laws and Kinetic Theory', ['gas laws', 'ideal gas', 'dalton law', 'kinetic theory'], [
    'Boyle (P ∝ 1/V at constant T), Charles (V ∝ T at constant P), Avogadro (equal volumes equal moles at STP). Combined ideal gas PV = nRT.',
    'Dalton\'s law: P_total = ΣPᵢ for gas mixtures. Graham\'s law: rate ∝ 1/√M. Real gases deviate at high P, low T; van der Waals equation accounts for molecular volume and attractions.',
  ]),
  mk(11, 'chemistry', 'Thermodynamics', 'Enthalpy and Entropy', ['enthalpy', 'hess law', 'entropy', 'gibbs energy', 'spontaneity'], [
    'First law: ΔU = q + w. Enthalpy H = U + PV; at constant P, ΔH = q_p. Exothermic ΔH < 0; endothermic ΔH > 0. Hess law: ΔH independent of path.',
    'Entropy S measures disorder; ΔS_universe > 0 for spontaneous processes. Gibbs energy ΔG = ΔH − TΔS; spontaneous if ΔG < 0. ΔG° = −RT ln K at equilibrium.',
  ]),
  mk(11, 'chemistry', 'Equilibrium', 'Chemical and Ionic Equilibrium', ['equilibrium', 'le chatelier', 'Kc', 'kp', 'ionic equilibrium'], [
    'Dynamic equilibrium: forward and reverse rates equal. K_c = products/reactants with proper powers. K_p for gases uses partial pressures. Q vs K predicts direction.',
    'Le Chatelier: system opposes imposed change (concentration, pressure, temperature). Ionic equilibrium: weak acids/bases partial dissociation; pH = −log[H⁺]. Buffer resists pH change.',
  ]),
  mk(11, 'chemistry', 'Redox Reactions', 'Oxidation Number and Balancing', ['redox', 'oxidation number', 'balancing redox', 'electrochemical series'], [
    'Oxidation is loss of electrons; reduction is gain (OIL RIG). Oxidation number tracks electron distribution; sum zero in neutral compound.',
    'Balance redox by half-reaction or oxidation-number method. Electrochemical series ranks reducing strength. Disproportionation: same element oxidised and reduced.',
  ]),
  mk(11, 'chemistry', 'Hydrogen', 'Preparation and Hydrides', ['hydrogen', 'water gas', 'hydrides', 'heavy water'], [
    'Lab preparation: Zn + dil H₂SO₄ → ZnSO₄ + H₂. Industrial: steam on coke (water gas CO + H₂). Electrolysis of water gives pure H₂.',
    'Hydrides: ionic (NaH), covalent (CH₄), metallic (PdH). Heavy water D₂O used as moderator in nuclear reactors. H₂O₂ is oxidising and reducing agent.',
  ]),
  mk(11, 'chemistry', 'The s-Block Elements', 'Alkali and Alkaline Earth Metals', ['s-block', 'alkali metals', 'alkaline earth', 'diagonal relationship'], [
    'Group 1: soft, low density, +1 oxidation state, vigorous reaction with water. Flame colours diagnostic (Na yellow, K violet).',
    'Group 2: harder, +2 oxidation state, form carbonates, sulphates. Be shows diagonal similarity to Al. CaO (quicklime), Ca(OH)₂ (slaked lime), CaCO₃ (limestone) important industrially.',
  ]),
  mk(11, 'chemistry', 'The p-Block Elements', 'Group 13 and 14 Elements', ['p-block', 'boron', 'carbon', 'silicon', 'allotropy'], [
    'Boron: electron-deficient, forms BF₃. Aluminium amphoteric; Al₂O₃ protective oxide. Carbon allotropes: diamond (sp³), graphite (sp² layers), fullerenes.',
    'Silicon: SiO₂ quartz; silicates abundant in Earth\'s crust. CO and CO₂ differ: CO toxic reducing agent; CO₂ acidic oxide, greenhouse gas. Lead poisoning from tetraethyl lead historically.',
  ]),
  mk(11, 'chemistry', 'Organic Chemistry: Basic Principles', 'Nomenclature and Isomerism', ['organic chemistry', 'IUPAC', 'isomerism', 'inductive effect', 'resonance'], [
    'IUPAC: longest chain, lowest locants, functional group suffix/prefix. Structural isomers differ in connectivity; stereoisomers in spatial arrangement.',
    'Inductive effect (+I, −I) through σ bonds. Resonance delocalises π electrons; resonance structures stabilise benzene. Hyperconjugation explains stability of carbocations and alkenes.',
  ]),
  mk(11, 'chemistry', 'Hydrocarbons', 'Alkanes, Alkenes, Alkynes, Aromatic', ['alkanes', 'alkenes', 'alkynes', 'benzene', 'markovnikov'], [
    'Alkanes CₙH₂ₙ₊₂: free radical halogenation. Alkenes CₙH₂ₙ: electrophilic addition; Markovnikov adds H to carbon with more H. Ozonolysis cleaves double bond.',
    'Alkynes CₙH₂ₙ₋₂: acidic terminal H (NaNH₂). Benzene C₆H₆: resonance, electrophilic substitution (nitration, sulphonation, Friedel-Crafts). Anti-aromatic vs aromatic (4n+2 π electrons).',
  ]),
  mk(11, 'chemistry', 'Environmental Chemistry', 'Pollution and Green Chemistry', ['environmental chemistry', 'pollution', 'green chemistry', 'ozone', 'greenhouse'], [
    'Air pollution: CO, SO₂, NOₓ, particulates, smog (photochemical). Acid rain from SO₂, NOₓ lowers pH of rain below 5.6.',
    'Green chemistry principles minimise waste, use safer solvents, atom economy. Ozone layer depletion by CFCs; Montreal Protocol phased them out. Greenhouse gases CO₂, CH₄, N₂O trap infrared radiation.',
  ]),
];

// ─── Class 12 Chemistry (NCERT) ─────────────────────────────────────────────────

const CHEMISTRY_12: ChapterSeed[] = [
  mk(12, 'chemistry', 'The Solid State', 'Crystal Lattices and Defects', ['solid state', 'unit cell', 'packing', 'crystal defects'], [
    'Crystalline solids have long-range order; unit cell repeats in three dimensions. Cubic: simple, body-centred (bcc), face-centred (fcc). Coordination number 8 (bcc), 12 (fcc, hcp).',
    'Packing efficiency fcc/hcp ≈ 74%. Schottky defect (vacancy pairs in ionic crystals lowers density); Frenkel defect (ion displaced to interstitial). Doping silicon creates n-type or p-type semiconductors.',
  ]),
  mk(12, 'chemistry', 'Solutions', 'Concentration and Colligative Properties', ['solutions', 'molarity', 'molality', 'colligative properties', 'raoult law'], [
    'Concentration: molarity M = mol/L; molality m = mol/kg solvent. Raoult\'s law P = P°χ for volatile solute in ideal solution.',
    'Colligative properties depend on solute particle count: relative lowering of vapour pressure, elevation of boiling point ΔT_b = K_b m, depression of freezing point ΔT_f = K_f m, osmotic pressure π = MRT. Van\'t Hoff factor i corrects for dissociation.',
  ]),
  mk(12, 'chemistry', 'Electrochemistry', 'Cells and Electrolysis', ['electrochemistry', 'nernst equation', 'galvanic cell', 'electrolysis', 'faraday'], [
    'Galvanic cell converts chemical to electrical energy; anode oxidation (negative in cell), cathode reduction. EMF E°_cell = E°_cathode − E°_anode.',
    'Nernst equation E = E° − (RT/nF)ln Q. Electrolysis uses external EMF; Faraday laws: mass ∝ charge passed. Corrosion is electrochemical oxidation of metals.',
  ]),
  mk(12, 'chemistry', 'Chemical Kinetics', 'Rate Laws and Activation Energy', ['chemical kinetics', 'rate law', 'order', 'activation energy', 'arrhenius'], [
    'Rate = k[A]ᵐ[B]ⁿ; order m+n from experiment, not stoichiometry. Integrated first-order: ln[A] = ln[A]₀ − kt; half-life t₁/₂ = 0.693/k independent of concentration.',
    'Arrhenius equation k = Ae^(−E_a/RT). Activation energy E_a is barrier to reaction. Catalyst lowers E_a, provides alternate pathway; does not change ΔG or equilibrium position.',
  ]),
  mk(12, 'chemistry', 'Surface Chemistry', 'Adsorption and Catalysis', ['surface chemistry', 'adsorption', 'colloids', 'emulsion', 'catalysis'], [
    'Adsorption: accumulation at surface; physisorption weak van der Waals, low heat; chemisorption stronger, monolayer. Freundlich isotherm x/m = kP^(1/n).',
    'Colloids 1–1000 nm: Tyndall effect, Brownian motion. Emulsions oil-in-water or water-in-oil; stabilised by emulsifiers. Homogeneous and heterogeneous catalysis; enzyme catalysis highly specific.',
  ]),
  mk(12, 'chemistry', 'The p-Block Elements', 'Group 15–18 Elements', ['nitrogen family', 'oxygen family', 'halogens', 'noble gases'], [
    'Nitrogen: N₂ triple bond inert; ammonia Haber process; HNO₃ oxidising acid. Phosphorus allotropes white (pyrophoric) and red (safer).',
    'Oxygen: O₂ paramagnetic; ozone O₃ oxidising. Sulphur forms S₈ ring; H₂SO₄ dehydrating and oxidising. Halogens F₂ to I₂ decreasing reactivity; interhalogens. Noble gases low reactivity; Xe forms compounds with F, O.',
  ]),
  mk(12, 'chemistry', 'The d- and f-Block Elements', 'Transition and Inner Transition Metals', ['transition metals', 'lanthanoids', 'actinoids', 'crystal field'], [
    'd-block: variable oxidation states, coloured ions, paramagnetism, catalytic activity. Cr, Mn common oxidation states +3, +6 (CrO₄²⁻, MnO₄⁻).',
    'Lanthanoid contraction: steady decrease in size La to Lu. Actinoids radioactive, +3 common. Crystal field theory splits d orbitals; colour from d-d transitions.',
  ]),
  mk(12, 'chemistry', 'Coordination Compounds', 'Nomenclature and Isomerism', ['coordination compounds', 'ligand', 'werner theory', 'isomerism', 'crystal field theory'], [
    'Central metal ion bonded to ligands via coordinate bonds. Oxidation state of metal + ligand charges balance complex charge. IUPAC: ligands alphabetically, metal, oxidation state in Roman numerals.',
    'Isomerism: structural (ionisation, linkage, coordination) and stereoisomerism (geometrical cis-trans, optical). CFSE explains colour and magnetic properties (high-spin vs low-spin).',
  ]),
  mk(12, 'chemistry', 'Haloalkanes and Haloarenes', 'Nucleophilic Substitution', ['haloalkanes', 'SN1', 'SN2', 'elimination', 'haloarenes'], [
    'SN2: one step, backside attack, inversion, favoured by primary halide, strong nucleophile. SN1: two steps, carbocation intermediate, racemisation, tertiary halide.',
    'Elimination competes: E2 with strong base. Haloarenes resist nucleophilic substitution unless electron-withdrawing groups activate ring. DDT, freons environmental concerns.',
  ]),
  mk(12, 'chemistry', 'Alcohols, Phenols and Ethers', 'Preparation and Reactions', ['alcohols', 'phenols', 'ethers', 'dehydration', 'williamson synthesis'], [
    'Alcohols R−OH: oxidation to aldehyde/ketone/carboxylic acid. Primary alcohols oxidise to aldehyde then acid. Lucas test distinguishes 1°, 2°, 3° alcohols.',
    'Phenol C₆H₅OH acidic due to resonance-stabilised phenoxide; electrophilic substitution (nitration gives picric acid). Ethers R−O−R: Williamson synthesis R−ONa + R\'−X.',
  ]),
  mk(12, 'chemistry', 'Aldehydes, Ketones and Carboxylic Acids', 'Carbonyl Chemistry', ['aldehydes', 'ketones', 'carboxylic acids', 'nucleophilic addition', 'tollens test'], [
    'Carbonyl C=O polar; nucleophilic addition (HCN, NaHSO₃, alcohols to hemiacetals/acetals). Aldehydes oxidise easily: Tollens\' (silver mirror), Fehling\'s test; ketones generally do not.',
    'Carboxylic acids RCOOH dimerise via H-bonding; acidity increases with −I groups. Derivatives: acid chlorides, anhydrides, esters, amides from nucleophilic acyl substitution.',
  ]),
  mk(12, 'chemistry', 'Amines', 'Preparation and Basicity', ['amines', 'basicity', 'diazonium', 'coupling reaction'], [
    'Classification: primary RNH₂, secondary R₂NH, tertiary R₃N. Basicity: lone pair on N accepts H⁺; aromatic amines less basic (lone pair delocalised into ring).',
    'Diazonium salts ArN₂⁺X⁻ from primary aromatic amines; coupling with phenol/aniline gives azo dyes. Gabriel phthalimide synthesises primary amines.',
  ]),
  mk(12, 'chemistry', 'Biomolecules', 'Carbohydrates, Proteins, Nucleic Acids', ['biomolecules', 'carbohydrates', 'proteins', 'enzymes', 'DNA'], [
    'Carbohydrates: glucose (aldohexose), fructose (ketohexose); disaccharides sucrose, lactose; polysaccharides starch, cellulose, glycogen. Reducing sugars give Tollens\'/Fehling\'s test.',
    'Proteins: amino acids linked by peptide bonds; primary to quaternary structure. Enzymes are biological catalysts. DNA double helix: A−T, G−C base pairs; RNA single-stranded with uracil.',
  ]),
  mk(12, 'chemistry', 'Polymers', 'Addition and Condensation Polymers', ['polymers', 'addition polymerisation', 'condensation', 'natural rubber', 'biodegradable'], [
    'Addition polymers from alkenes: polyethylene, PVC, polystyrene, teflon. Condensation: nylon-6,6 (adipic acid + hexamethylenediamine), bakelite (phenol-formaldehyde).',
    'Natural rubber cis-1,4-polyisoprene; vulcanisation with sulphur improves strength. Biodegradable polymers reduce plastic pollution. Copolymers combine two monomers.',
  ]),
  mk(12, 'chemistry', 'Chemistry in Everyday Life', 'Drugs, Food Chemicals, Cleansing Agents', ['drugs', 'antibiotics', 'antacids', 'soaps detergents', 'food preservatives'], [
    'Drugs target receptors: analgesics (aspirin), antibiotics (penicillin), antacids (Mg(OH)₂, Al(OH)₃). Broad vs narrow spectrum antibiotics; resistance from misuse.',
    'Soaps sodium salts of fatty acids; detergents synthetic sulphates/sulphonates work in hard water. Food preservatives BHT, BHA; artificial sweeteners saccharin, aspartame.',
  ]),
];

// ─── Class 11 Biology (NCERT) ─────────────────────────────────────────────────

const BIOLOGY_11: ChapterSeed[] = [
  mk(11, 'biology', 'The Living World', 'Characteristics and Taxonomy', ['living world', 'taxonomy', 'binomial nomenclature', 'species'], [
    'Living organisms show growth, reproduction, metabolism, cellular organisation, response to stimuli, and ability to evolve. Viruses straddle living/non-living boundary.',
    'Taxonomy classifies organisms: Kingdom, Phylum, Class, Order, Family, Genus, Species. Binomial nomenclature: Genus species (italicised), e.g. Homo sapiens. Herbarium, botanical gardens, museums preserve specimens.',
  ]),
  mk(11, 'biology', 'Biological Classification', 'Five Kingdom and Viruses', ['five kingdom', 'monera', 'protista', 'fungi', 'whittaker'], [
    'Whittaker\'s five kingdoms: Monera (prokaryotes), Protista (unicellular eukaryotes), Fungi, Plantae, Animalia based on cell structure, nutrition, body organisation.',
    'Monera: bacteria, cyanobacteria; no membrane-bound nucleus. Protista: algae, protozoans, slime moulds. Fungi: chitin cell wall, heterotrophic absorption. Viruses, viroids, lichens (fungus + alga) outside traditional kingdoms.',
  ]),
  mk(11, 'biology', 'Plant Kingdom', 'Algae, Bryophytes, Pteridophytes, Gymnosperms', ['plant kingdom', 'algae', 'bryophytes', 'pteridophytes', 'gymnosperms'], [
    'Algae (Chlorophyceae, Phaeophyceae, Rhodophyceae): aquatic, photosynthetic, reproduce sexually and asexually. Bryophytes (mosses): amphibians of plant kingdom; dominant gametophyte.',
    'Pteridophytes (ferns): first vascular plants; spores on sporangia. Gymnosperms: naked seeds (conifers, cycads). Alternation of generations: sporophyte and gametophyte phases.',
  ]),
  mk(11, 'biology', 'Animal Kingdom', 'Classification and Key Phyla', ['animal kingdom', 'phylum', 'chordata', 'arthropoda', 'mollusca'], [
    'Basis: levels of organisation (cellular to organ-system), symmetry (radial, bilateral), coelom (acoelomate, pseudocoelomate, coelomate), segmentation.',
    'Major phyla: Porifera (sponges), Cnidaria (jellyfish), Platyhelminthes (flatworms), Annelida (earthworm), Arthropoda (insects, largest phylum), Mollusca, Echinodermata, Chordata (notochord, dorsal nerve cord).',
  ]),
  mk(11, 'biology', 'Morphology of Flowering Plants', 'Root, Stem, Leaf, Inflorescence', ['morphology', 'root', 'stem', 'leaf', 'inflorescence', 'flower'], [
    'Root types: tap and fibrous; modifications for storage (carrot), respiration (pneumatophores). Stem nodes, internodes; modifications: rhizome, tuber, tendril.',
    'Leaf venation parallel or reticulate; phyllotaxy alternate, opposite, whorled. Inflorescence racemose (acropetal) or cymose (basipetal). Flower parts: calyx, corolla, androecium, gynoecium.',
  ]),
  mk(11, 'biology', 'Anatomy of Flowering Plants', 'Tissues and Secondary Growth', ['anatomy', 'meristem', 'xylem', 'phloem', 'secondary growth'], [
    'Meristematic tissue divides; permanent tissue simple (parenchyma, collenchyma, sclerenchyma) and complex (xylem, phloem). Dicot vs monocot vascular bundle arrangement.',
    'Secondary growth in dicot stems: vascular cambium forms secondary xylem (wood) and phloem; cork cambium produces bark. Heartwood vs sapwood. Root anatomy: endodermis with Casparian strip controls apoplast pathway.',
  ]),
  mk(11, 'biology', 'Structural Organisation in Animals', 'Animal Tissues and Organs', ['animal tissues', 'epithelial', 'connective', 'muscular', 'nervous'], [
    'Epithelial: squamous, cuboidal, columnar; ciliated, glandular. Connective: loose, dense, cartilage, bone, blood. Muscle: striated (skeletal), smooth, cardiac.',
    'Cockroach as model: segmented body, chitinous exoskeleton, compound eyes, malpighian tubules for excretion. Organisation levels: cells → tissues → organs → organ systems.',
  ]),
  mk(11, 'biology', 'Cell: The Unit of Life', 'Cell Structure and Organelles', ['cell', 'prokaryotic', 'eukaryotic', 'organelles', 'endomembrane system'], [
    'Prokaryotes lack membrane-bound nucleus; 70S ribosomes. Eukaryotes: nucleus with nuclear envelope, 80S ribosomes, membrane-bound organelles.',
    'Mitochondria (ATP, own DNA), chloroplasts (photosynthesis, plants), ER (rough with ribosomes, smooth lipid synthesis), Golgi (packaging), lysosomes (hydrolytic enzymes), peroxisomes, cytoskeleton.',
  ]),
  mk(11, 'biology', 'Biomolecules', 'Carbohydrates, Proteins, Lipids, Nucleic Acids', ['biomolecules', 'amino acids', 'enzymes', 'nucleic acids', 'lipids'], [
    'Monosaccharides glucose, fructose; polysaccharides starch, glycogen, cellulose. Proteins: 20 amino acids linked by peptide bonds; levels of structure primary to quaternary.',
    'Enzymes biological catalysts; lock-and-key and induced-fit models; affected by temperature, pH, substrate concentration. Lipids fats, phospholipids (membranes). Nucleic acids DNA (A-T, G-C) and RNA store/transmit genetic information.',
  ]),
  mk(11, 'biology', 'Cell Cycle and Cell Division', 'Mitosis and Meiosis', ['cell cycle', 'mitosis', 'meiosis', 'interphase', 'cytokinesis'], [
    'Cell cycle: G₁, S (DNA replication), G₂, M (mitosis). Mitosis: prophase, metaphase, anaphase, telophase produces two identical diploid cells for growth/repair.',
    'Meiosis I (reduction) separates homologous chromosomes; meiosis II separates sister chromatids → four haploid gametes. Crossing over in prophase I increases genetic variation.',
  ]),
  mk(11, 'biology', 'Transport in Plants', 'Water and Mineral Transport', ['transport plants', 'xylem', 'transpiration', 'ascent of sap', 'phloem transport'], [
    'Water absorbed by root hairs; apoplast and symplast pathways. Root pressure and transpiration pull drive ascent of sap. Cohesion-tension theory: evaporation pulls water column in xylem.',
    'Phloem translocation via pressure flow (source to sink). Transpiration cools plant, aids mineral transport; stomatal regulation balances water loss and CO₂ uptake.',
  ]),
  mk(11, 'biology', 'Mineral Nutrition', 'Essential Elements and Deficiency', ['mineral nutrition', 'macronutrients', 'micronutrients', 'nitrogen fixation'], [
    'Essential elements from soil: macronutrients C, H, O, N, P, K, S, Ca, Mg; micronutrients Fe, Mn, Zn, Cu, B, Mo, Cl, Ni. Deficiency symptoms: chlorosis (N, Mg), necrosis.',
    'Nitrogen fixation: symbiotic (Rhizobium in root nodules) and free-living bacteria convert N₂ to ammonia. Mycorrhiza: fungus-root symbiosis aids phosphorus uptake.',
  ]),
  mk(11, 'biology', 'Photosynthesis in Higher Plants', 'Light and Dark Reactions', ['photosynthesis', 'chlorophyll', 'calvin cycle', 'C4 pathway', 'photorespiration'], [
    '6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O. Light reactions in thylakoids: photolysis of water, ATP and NADPH formation. Calvin cycle in stroma fixes CO₂ to glucose.',
    'C₃ plants (Calvin cycle primary); C₄ plants (Kranz anatomy, PEP carboxylase) minimise photorespiration in hot climates. CAM plants open stomata at night.',
  ]),
  mk(11, 'biology', 'Respiration in Plants', 'Glycolysis, Krebs Cycle, ETC', ['respiration', 'glycolysis', 'krebs cycle', 'electron transport', 'fermentation'], [
    'Glycolysis in cytoplasm: glucose → 2 pyruvate, net 2 ATP. Aerobic: pyruvate to acetyl-CoA enters Krebs cycle in mitochondria; NADH, FADH₂ feed electron transport chain → ~32 ATP total.',
    'Anaerobic fermentation: lactic acid (animals) or ethanol + CO₂ (yeast). Respiratory quotient RQ = CO₂ released/O₂ consumed indicates substrate (RQ=1 carbohydrates, <1 fats).',
  ]),
  mk(11, 'biology', 'Plant Growth and Development', 'Plant Hormones and Photoperiodism', ['plant hormones', 'auxin', 'gibberellin', 'cytokinin', 'photoperiodism'], [
    'Auxin (IAA): apical dominance, phototropism. Gibberellins: stem elongation, seed germination. Cytokinins: cell division, delay senescence. Abscisic acid: stress, dormancy. Ethylene: fruit ripening.',
    'Photoperiodism: flowering response to day length; short-day, long-day, day-neutral plants. Vernalisation: cold requirement for flowering. Seed dormancy and stratification.',
  ]),
  mk(11, 'biology', 'Digestion and Absorption', 'Human Digestive System', ['digestion', 'enzymes', 'absorption', 'alimentary canal', 'nutrition'], [
    'Alimentary canal: mouth (salivary amylase), stomach (pepsin, HCl), small intestine (trypsin, lipase, maltase—main digestion and absorption), large intestine (water absorption).',
    'Carbohydrates → monosaccharides; proteins → amino acids; fats → fatty acids + glycerol. Absorption via villi and microvilli; portal vein carries nutrients to liver.',
  ]),
  mk(11, 'biology', 'Breathing and Exchange of Gases', 'Respiratory System', ['respiration', 'lungs', 'alveoli', 'oxygen transport', 'haemoglobin'], [
    'Inspiration: diaphragm contracts, rib cage expands, lungs inflate. Gas exchange at alveoli by diffusion; alveolar surface area and thin membrane maximise exchange.',
    'O₂ binds haemoglobin forming oxyhaemoglobin; Bohr effect: H⁺ and CO₂ promote O₂ release to tissues. CO₂ transported as bicarbonate, carbamino compounds, dissolved.',
  ]),
  mk(11, 'biology', 'Body Fluids and Circulation', 'Blood, Heart, and Circulation', ['circulation', 'heart', 'blood', 'cardiac cycle', 'ECG'], [
    'Blood: plasma + formed elements (RBC, WBC, platelets). ABO and Rh blood groups; universal donor O, universal recipient AB. Cardiac cycle: systole and diastole; SA node pacemaker.',
    'Double circulation: pulmonary (heart to lungs) and systemic (heart to body). ECG records P (atrial depolarisation), QRS (ventricular), T (repolarisation) waves.',
  ]),
  mk(11, 'biology', 'Excretory Products and their Elimination', 'Kidney and Urine Formation', ['excretion', 'kidney', 'nephron', 'dialysis', 'osmoregulation'], [
    'Nephron functional unit: glomerulus (ultrafiltration), PCT (reabsorption), loop of Henle (concentration gradient), DCT and collecting duct (fine-tuning). ADH regulates water reabsorption.',
    'Kidneys excrete nitrogenous wastes (urea); also osmoregulation and pH balance. Dialysis for kidney failure. Other excretory organs: skin (sweat), lungs (CO₂), liver (bile pigments).',
  ]),
  mk(11, 'biology', 'Locomotion and Movement', 'Muscles, Bones, and Joints', ['locomotion', 'skeletal muscle', 'sliding filament', 'joints', 'skeleton'], [
    'Skeletal muscle: sarcomere with actin and myosin; sliding filament theory—ATP powers cross-bridge cycling. Tropomyosin-troponin regulate contraction via Ca²⁺.',
    'Human skeleton: axial and appendicular. Types of joints: ball-and-socket (shoulder), hinge (elbow), pivot (atlas-axis). Osteoporosis, arthritis, gout common disorders.',
  ]),
  mk(11, 'biology', 'Neural Control and Coordination', 'Nervous System and Reflexes', ['nervous system', 'neuron', 'synapse', 'reflex arc', 'brain'], [
    'Neuron: dendrites receive, axon transmits impulse. Synapse: neurotransmitter crosses gap. Reflex arc: receptor → sensory neuron → interneuron → motor neuron → effector; bypasses brain for speed.',
    'CNS: brain (cerebrum—thinking, cerebellum—balance, medulla—vital functions) and spinal cord. PNS: somatic (voluntary) and autonomic (sympathetic fight-or-flight, parasympathetic rest-and-digest).',
  ]),
  mk(11, 'biology', 'Chemical Coordination and Integration', 'Endocrine System and Hormones', ['endocrine', 'hormones', 'pituitary', 'thyroid', 'insulin'], [
    'Hormones are chemical messengers; endocrine glands secrete into blood. Pituitary (master gland): GH, TSH, ACTH, FSH, LH. Thyroid: thyroxine regulates metabolism; goitre from iodine deficiency.',
    'Pancreas: insulin lowers blood glucose; glucagon raises it; diabetes mellitus from insulin deficiency/resistance. Adrenal: adrenaline stress response. Feedback loops maintain homeostasis.',
  ]),
];

// ─── Class 12 Biology (NCERT) ───────────────────────────────────────────────────

const BIOLOGY_12: ChapterSeed[] = [
  mk(12, 'biology', 'Reproduction in Organisms', 'Asexual and Sexual Reproduction', ['reproduction', 'asexual', 'sexual', 'life span', 'binary fission'], [
    'Asexual: binary fission (Amoeba), budding (Hydra), fragmentation, spores, vegetative propagation. Produces genetically identical offspring; rapid.',
    'Sexual reproduction: meiosis forms gametes; fertilisation restores diploidy. Variation from crossing over and independent assortment. Life spans and generation times vary widely across species.',
  ]),
  mk(12, 'biology', 'Sexual Reproduction in Flowering Plants', 'Pollination and Fertilisation', ['pollination', 'fertilisation', 'double fertilisation', 'seed', 'fruit'], [
    'Stamen (anther, filament) and pistil (stigma, style, ovary). Pollination self or cross; agents wind, water, insects. Pollen tube carries male gametes to ovule.',
    'Double fertilisation (unique to angiosperms): one sperm + egg → zygote; other sperm + polar nuclei → triploid endosperm. Seed: embryo + food reserve; fruit develops from ovary.',
  ]),
  mk(12, 'biology', 'Human Reproduction', 'Male and Female Reproductive Systems', ['human reproduction', 'gametogenesis', 'menstrual cycle', 'fertilisation'], [
    'Male: testes produce sperm (spermatogenesis); accessory glands add seminal fluid. Female: ovaries produce ova (oogenesis); uterus supports embryo.',
    'Menstrual cycle ~28 days: follicular, ovulation (day 14), luteal phases regulated by FSH, LH, estrogen, progesterone. Fertilisation in fallopian tube; implantation in uterus.',
  ]),
  mk(12, 'biology', 'Reproductive Health', 'Contraception and STIs', ['reproductive health', 'contraception', 'STD', 'IVF', 'amniocentesis'], [
    'Family planning: barrier methods (condom), hormonal (pills), IUDs, surgical (vasectomy, tubectomy). Natural methods rhythm, coitus interruptus less reliable.',
    'STIs: AIDS (HIV), gonorrhoea, syphilis, hepatitis B. Assisted reproductive technologies: IVF, ZIFT, GIFT. Amniocentesis for prenatal diagnosis regulated due to sex-selection misuse.',
  ]),
  mk(12, 'biology', 'Principles of Inheritance and Variation', 'Mendelian Genetics', ['mendel', 'dominant', 'recessive', 'punnett square', 'test cross'], [
    'Mendel\'s laws: segregation (alleles separate in gametes), independent assortment (genes on different chromosomes assort independently). Monohybrid cross 3:1; dihybrid 9:3:3:1.',
    'Test cross: heterozygote × homozygous recessive reveals genotype. Incomplete dominance, codominance, multiple alleles (ABO blood groups), polygenic inheritance modify simple ratios.',
  ]),
  mk(12, 'biology', 'Molecular Basis of Inheritance', 'DNA Structure and Replication', ['DNA', 'replication', 'transcription', 'genetic code', 'central dogma'], [
    'Watson-Crick DNA: double helix, antiparallel strands, complementary base pairing. Semi-conservative replication: each daughter molecule has one old, one new strand.',
    'Central dogma: DNA → RNA (transcription) → protein (translation). Genetic code triplet, degenerate, universal. RNA types: mRNA, tRNA, rRNA. Lac operon model of gene regulation in prokaryotes.',
  ]),
  mk(12, 'biology', 'Evolution', 'Natural Selection and Speciation', ['evolution', 'natural selection', 'darwin', 'hardy weinberg', 'speciation'], [
    'Darwin-Wallace: variation, competition, differential survival and reproduction drive evolution. Evidence: fossils, homologous/analogous structures, molecular homology, embryology.',
    'Hardy-Weinberg equilibrium p² + 2pq + q² = 1 when no selection, mutation, migration, drift, non-random mating. Speciation: allopatric (geographic isolation), sympatric.',
  ]),
  mk(12, 'biology', 'Human Health and Disease', 'Pathogens and Immunity', ['disease', 'immunity', 'vaccination', 'cancer', 'AIDS'], [
    'Pathogens: bacteria, viruses, fungi, protozoans, helminths. Innate immunity: barriers, phagocytes, inflammation. Adaptive: B cells (antibodies), T cells (cell-mediated).',
    'Vaccination stimulates active immunity; passive via antibodies. AIDS: HIV attacks T-helper cells. Cancer: uncontrolled cell division; carcinogens, oncogenes. Addiction: opioids, nicotine, alcohol affect CNS.',
  ]),
  mk(12, 'biology', 'Microbes in Human Welfare', 'Beneficial Microorganisms', ['microbes', 'fermentation', 'antibiotics', 'sewage treatment', 'biogas'], [
    'Curd from Lactobacillus; bread and beer from yeast fermentation. Antibiotics penicillin from Penicillium; narrow vs broad spectrum.',
    'Sewage treatment: primary settling, aerobic/anaerobic microbial degradation. Biogas (methane) from methanogens in anaerobic sludge digesters. Biofertilisers Rhizobium, cyanobacteria.',
  ]),
  mk(12, 'biology', 'Biotechnology: Principles and Processes', 'Recombinant DNA Technology', ['biotechnology', 'restriction enzyme', 'plasmid', 'PCR', 'gel electrophoresis'], [
    'Recombinant DNA: isolate gene, cut with restriction endonucleases (sticky/blunt ends), ligate into vector (plasmid), transform host bacterium. DNA ligase seals backbone.',
    'PCR amplifies DNA in vitro: denaturation, annealing primers, extension by Taq polymerase. Gel electrophoresis separates fragments by size. Bioreactors scale up production of recombinant proteins.',
  ]),
  mk(12, 'biology', 'Biotechnology and its Applications', 'GMOs and Gene Therapy', ['GMO', 'Bt cotton', 'gene therapy', 'transgenic', 'biosafety'], [
    'Transgenic crops: Bt cotton expresses Bt toxin against bollworm; golden rice beta-carotene. GM organisms raise biosafety and ethical concerns; GEAC regulates India.',
    'Gene therapy replaces defective genes; first successes in SCID. Molecular diagnosis: PCR, ELISA detect pathogens early. Transgenic animals produce pharmaceuticals (e.g. alpha-1-antitrypsin in sheep milk).',
  ]),
  mk(12, 'biology', 'Organisms and Populations', 'Ecology and Population Growth', ['ecology', 'population growth', 'logistic growth', 'adaptation', 'abiotic factors'], [
    'Organism-environment interaction: temperature, water, light, soil abiotic factors. Adaptations morphological, physiological, behavioural.',
    'Population growth exponential (J-curve) when unlimited; logistic (S-curve) with carrying capacity K. r-selected (many offspring, little care) vs K-selected species strategies.',
  ]),
  mk(12, 'biology', 'Ecosystem', 'Energy Flow and Nutrient Cycling', ['ecosystem', 'food chain', 'energy pyramid', 'nutrient cycling', 'productivity'], [
    'Producers (plants) → consumers (herbivores, carnivores) → decomposers. Energy flow unidirectional; 10% law between trophic levels limits chain length.',
    'Nutrient cycling: carbon (photosynthesis, respiration, combustion), nitrogen (fixation, nitrification, denitrification), phosphorus (sedimentary cycle). GPP, NPP measure productivity.',
  ]),
  mk(12, 'biology', 'Biodiversity and Conservation', 'Biodiversity Hotspots and Conservation', ['biodiversity', 'hotspots', 'endangered species', 'in situ', 'ex situ'], [
    'Biodiversity levels: genetic, species, ecosystem. India mega-diverse; Western Ghats, Eastern Himalayas hotspots. IUCN Red List categories extinct, endangered, vulnerable.',
    'In situ: national parks, sanctuaries, biosphere reserves. Ex situ: zoos, botanical gardens, seed banks. Dodo, tiger, rhino conservation challenges. Rivet popper hypothesis: each species critical for ecosystem stability.',
  ]),
  mk(12, 'biology', 'Environmental Issues', 'Pollution and Global Change', ['pollution', 'global warming', 'ozone depletion', 'eutrophication', 'deforestation'], [
    'Air pollution: SPM, NOₓ, SO₂ cause respiratory disease, acid rain. Greenhouse effect: CO₂, CH₄ trap heat; global warming, sea-level rise, climate change.',
    'Ozone hole over Antarctica from CFCs; UV-B damage. Water eutrophication from excess nitrates/phosphates. Deforestation, plastic waste, e-waste require policy and public action.',
  ]),
];

// ─── English (Classes 11 & 12) ────────────────────────────────────────────────

const ENGLISH_11: ChapterSeed[] = [
  mk(11, 'english', 'Reading Comprehension', 'Unseen Passages and Inference', ['reading comprehension', 'unseen passage', 'inference', 'vocabulary in context'], [
    'Reading unseen passages tests literal comprehension, inference, and critical evaluation. Identify main idea, tone, and supporting evidence before answering.',
    'Context clues help deduce unfamiliar vocabulary. Factual passages require precise extraction; discursive passages need analysis of argument structure and author\'s viewpoint.',
  ]),
  mk(11, 'english', 'Note-making and Summarising', 'Structured Notes and Abstracts', ['note-making', 'summarising', 'headings', 'abbreviations'], [
    'Note-making uses headings, subheadings, and bullet points with key phrases—not full sentences. Abbreviations and symbols save space while preserving meaning.',
    'Summary condenses passage to one-third length in own words; maintains logical flow without personal opinion unless asked. Title should capture central theme.',
  ]),
  mk(11, 'english', 'Writing Skills', 'Notice, Poster, and Advertisement', ['notice', 'poster', 'advertisement', 'format', 'CBSE writing'], [
    'Notice: name of organisation, date, heading, body with 5 Ws and H, signature and designation. Limited to ~50 words; formal tone.',
    'Posters and advertisements use catchy headline, visuals (described), essential details, and contact. Brevity and reader appeal are essential.',
  ]),
  mk(11, 'english', 'Writing Skills', 'Letters Formal and Informal', ['formal letter', 'informal letter', 'letter format', 'complaint', 'enquiry'], [
    'Formal letters: sender\'s address, date, receiver\'s address, subject, salutation (Sir/Madam), body paragraphs, complimentary close (Yours faithfully), signature, name.',
    'Informal letters to friends/family use casual tone, contractions permitted, and personal anecdotes. Complaint, enquiry, job application, and editorial letters each have specific conventions.',
  ]),
  mk(11, 'english', 'Writing Skills', 'Articles, Reports, and Speeches', ['article', 'report', 'speech', 'essay', 'debate'], [
    'Articles: catchy title, byline, introduction with hook, body with sub-points, conclusion. Reports: factual, past tense, passive voice common; include findings and recommendations.',
    'Speeches: direct address to audience, rhetorical questions, clear opening and closing. Debates present for/against with rebuttal. Word limits strictly observed in board exams.',
  ]),
  mk(11, 'english', 'Grammar', 'Tenses and Modals', ['tenses', 'modals', 'grammar', 'verb forms'], [
    'Tenses express time of action: simple, continuous, perfect, perfect continuous each in present, past, future. Sequence of tenses in reported speech and conditional sentences.',
    'Modals (can, could, may, might, shall, should, will, would, must, ought to) express ability, permission, obligation, possibility. Semi-modals need to, used to, dare, had better.',
  ]),
  mk(11, 'english', 'Grammar', 'Determiners, Reported Speech, and Voice', ['determiners', 'reported speech', 'active passive', 'grammar'], [
    'Determiners (a, an, the, this, some, each, every) precede nouns and limit reference. Articles: definite the for specific; indefinite a/an for general.',
    'Reported speech shifts tense back, changes pronouns and time/place words. Active voice subject performs action; passive emphasises object: object + be + past participle.',
  ]),
  mk(11, 'english', 'Hornbill — Prose', 'Themes in Hornbill Prose', ['hornbill', 'portrait of a lady', 'discovering tut', 'adventure', 'NCERT class 11 english'], [
    'Hornbill prose explores memory, discovery, and human resilience. "The Portrait of a Lady" depicts grandmother-grandson bond and inevitable loss. "Discovering Tut" examines archaeology and the mystery of the pharaoh\'s death.',
    '"The Adventure" by Jayant Narlikar uses science fiction to discuss history and probability. "Silk Road" documents travel across Tibet. Themes: cultural encounter, mortality, scientific curiosity.',
  ]),
  mk(11, 'english', 'Hornbill — Poetry', 'Poetic Devices in Hornbill', ['hornbill poetry', 'a photograph', 'laburnum top', 'voice of the rain', 'poetic devices'], [
    'Hornbill poems use imagery, metaphor, simile, personification, and symbolism. "A Photograph" by Shirley Toulson reflects on time and memory through a frozen moment.',
    '"The Laburnum Top" by Ted Hughes contrasts stillness and sudden life. "The Voice of the Rain" by Walt Whitman personifies rain as poetry of the earth. Analysis requires paraphrase plus interpretation of form and theme.',
  ]),
  mk(11, 'english', 'Snapshots — Supplementary Reader', 'Short Stories in Snapshots', ['snapshots', 'ranga marriage', 'address', 'birth', 'short stories'], [
    'Snapshots supplementary reader: Indian and international short fiction. "Ranga\'s Marriage" by Masti Venkatesha Iyengar satirises marriage customs with gentle humour.',
    '"The Address" by Marga Minco explores war, loss, and identity through reclaimed belongings. "Birth" by A.J. Cronin portrays medical dedication. Stories suit character sketch and thematic questions.',
  ]),
];

const ENGLISH_12: ChapterSeed[] = [
  mk(12, 'english', 'Reading Comprehension', 'Literary and Factual Passages', ['reading comprehension', 'class 12 english', 'literary passage', 'critical reading'], [
    'Class 12 passages include literary extracts requiring tone, mood, and figurative language analysis. Factual passages test synthesis across paragraphs.',
    'Distinguish fact from opinion; evaluate assumptions. Answers must be grounded in text with brief quotation or paraphrase as evidence.',
  ]),
  mk(12, 'english', 'Note-making and Summarising', 'Advanced Summarisation', ['note-making', 'summary', 'abstract', 'class 12'], [
    'Advanced note-making may include flowcharts or tree diagrams for hierarchical ideas. Summary title must be informative, not generic.',
    'Avoid copying phrases; use own vocabulary while preserving technical terms. Word limit penalties apply for excess length in board marking schemes.',
  ]),
  mk(12, 'english', 'Writing Skills', 'Invitation and Reply, Poster', ['invitation', 'reply', 'poster', 'formal informal'], [
    'Formal invitations: third person, complete event details, RSVP. Informal invitations: first person, warm tone. Replies accept or decline with courtesy and reason if declining.',
    'Posters for events, campaigns, or awareness drives balance visual description with essential information in prescribed format.',
  ]),
  mk(12, 'english', 'Writing Skills', 'Letters and Job Applications', ['job application', 'business letter', 'formal letter', 'bio-data'], [
    'Job application letter accompanies biodata/resume: qualifications, experience, skills relevant to post. Enclose testimonials as mentioned.',
    'Business letters for orders, complaints, enquiries follow block or indented format with reference numbers. Clarity and politeness essential.',
  ]),
  mk(12, 'english', 'Writing Skills', 'Articles, Debates, and Reports', ['debate', 'article', 'report writing', 'speech class 12'], [
    'Debate: introduction stating stance, arguments with examples, rebuttal of opposing view, conclusion. Articles for magazines/newspapers need engaging lead.',
    'Reports of events (cultural, sports) chronological, objective. Speeches for school assembly: formal register, call to action in conclusion.',
  ]),
  mk(12, 'english', 'Flamingo — Prose', 'Themes in Flamingo Prose', ['flamingo', 'last lesson', 'lost spring', 'indigo', 'poets and pancakes'], [
    '"The Last Lesson" by Alphonse Daudet: Franco-Prussian War, linguistic identity, regret. "Lost Spring" by Anees Jung exposes child labour in bangle industry and poverty.',
    '"Indigo" from Gandhi\'s autobiography documents Champaran satyagraha. "Poets and Pancakes" by Asokamitran portrays Gemini Studios and humour in film industry. Themes: freedom, exploitation, social reform.',
  ]),
  mk(12, 'english', 'Flamingo — Poetry', 'Major Poems and Analysis', ['flamingo poetry', 'keeping quiet', 'thing of beauty', 'roadside stand', 'aunt jennifer'], [
    'Keats "A Thing of Beauty" celebrates enduring joy from nature and art. Neruda "Keeping Quiet" advocates silence for introspection and peace.',
    'Frost "A Roadside Stand" critiques urban indifference to rural poor. Adrienne Rich "Aunt Jennifer\'s Tigers" uses tapestry as feminist symbol against patriarchal oppression.',
  ]),
  mk(12, 'english', 'Vistas — Supplementary Reader', 'Vistas Short Fiction', ['vistas', 'third level', 'tiger king', 'enemy', 'should wizard hit mommy'], [
    '"The Third Level" by Jack Finney blends fantasy and nostalgia for peaceful past. "The Tiger King" by Kalki satirises royalty and fate.',
    '"The Enemy" by Pearl S. Buck: wartime ethics, doctor\'s humanity to enemy soldier. "Should Wizard Hit Mommy?" by John Updike explores child perspective on fairness and stories.',
  ]),
  mk(12, 'english', 'Literary Terms and Long Reading', 'Literary Devices and Novel Themes', ['literary terms', 'symbolism', 'irony', 'novel', 'character sketch'], [
    'Key terms: allegory, alliteration, irony (verbal, situational, dramatic), hyperbole, oxymoron, pathetic fallacy. Apply terms to unseen extracts in exams.',
    'Long reading texts (where prescribed) require plot summary, character analysis, and thematic essays linking text to social context. Character sketch covers physical, mental, and moral traits with incidents.',
  ]),
  mk(12, 'english', 'Grammar and Transformation', 'Transformation of Sentences', ['transformation', 'grammar', 'clauses', 'sentence improvement'], [
    'Transformation exercises: simple to complex/compound, active-passive, direct-indirect speech without meaning change. Error detection and sentence reordering test syntactic awareness.',
    'Clauses: noun, adjective, adverb clauses identified by function. Sentence improvement chooses grammatically correct and concise option among four.',
  ]),
];

// ─── Accountancy (Classes 11 & 12) ────────────────────────────────────────────

const ACCOUNTANCY_11: ChapterSeed[] = [
  mk(11, 'accountancy', 'Introduction to Accounting', 'Meaning and Objectives of Accounting', ['accounting', 'bookkeeping', 'users of accounting', 'class 11 accountancy'], [
    'Accounting identifies, measures, records, and communicates financial information. Objectives: maintain systematic records, ascertain profit/loss, depict financial position, provide information for decisions.',
    'Branches: financial, cost, management accounting. Users: internal (management, employees) and external (investors, creditors, government). Accounting equation: Assets = Liabilities + Capital.',
  ]),
  mk(11, 'accountancy', 'Theory Base of Accounting', 'GAAP, Concepts, and Conventions', ['GAAP', 'accounting concepts', 'going concern', 'accrual', 'consistency'], [
    'Fundamental concepts: business entity, money measurement, going concern, accounting period, cost, dual aspect, accrual, matching. Conventions: consistency, full disclosure, conservatism, materiality.',
    'Indian Accounting Standards (Ind AS) converge with IFRS. Historical cost generally used; prudence requires provision for foreseeable losses.',
  ]),
  mk(11, 'accountancy', 'Recording of Transactions I', 'Journal and Ledger', ['journal', 'ledger', 'debit credit', 'double entry', 'source documents'], [
    'Double-entry: every debit has equal credit. Journal chronological record; ledger account-wise. Rules: debit receiver/credit giver (personal); debit expenses losses, credit income gains (nominal); debit what comes in (real).',
    'Source documents: invoice, receipt, voucher. Journal entry format: date, particulars, L.F., debit, credit. Posting transfers amounts to ledger accounts.',
  ]),
  mk(11, 'accountancy', 'Recording of Transactions II', 'Cash Book and Special Purpose Books', ['cash book', 'petty cash', 'subsidiary books', 'purchases sales book'], [
    'Cash book records cash and bank; types simple, two-column, three-column (cash, bank, discount). Petty cash imprest system reimburses fixed float.',
    'Subsidiary books: purchases, sales, purchases return, sales return, bills receivable/payable books reduce journal clutter. Bank reconciliation matches cash book with bank statement.',
  ]),
  mk(11, 'accountancy', 'Bank Reconciliation Statement', 'BRS and Timing Differences', ['bank reconciliation', 'BRS', 'outstanding cheques', 'direct deposit'], [
    'BRS reconciles cash book balance with passbook balance on a date. Timing differences: cheques issued not presented, cheques deposited not cleared, bank charges, interest not recorded.',
    'Adjusted balance should agree. Favourable balance means deposit exceeds withdrawals. Errors in either book require correction entries.',
  ]),
  mk(11, 'accountancy', 'Trial Balance and Rectification of Errors', 'Trial Balance and Error Correction', ['trial balance', 'rectification', 'suspense account', 'errors'], [
    'Trial balance lists ledger balances; total debits should equal credits. Errors not affecting agreement: complete omission, recording wrong amount in both accounts, correct posting.',
    'Errors affecting trial balance use suspense account temporarily. Rectification entries reverse wrong debit/credit and record correct accounts.',
  ]),
  mk(11, 'accountancy', 'Depreciation, Provisions and Reserves', 'Depreciation Methods', ['depreciation', 'straight line', 'written down value', 'provisions', 'reserves'], [
    'Depreciation allocates cost of tangible asset over useful life. Straight line: equal annual charge (Cost − Scrap)/Life. Written down value: percentage on reducing balance.',
    'Provisions for known liability (e.g. doubtful debts). Reserves from profits: revenue (general, dividend) and capital (revaluation, securities premium).',
  ]),
  mk(11, 'accountancy', 'Bills of Exchange', 'Negotiable Instruments', ['bills of exchange', 'promissory note', 'endorsement', 'discounting', 'dishonour'], [
    'Bill of exchange unconditional order to pay fixed sum. Parties: drawer, drawee, payee. Promissory note is promise to pay. Acceptance makes bill binding.',
    'Discounting with bank before maturity; endorsement transfers rights. Dishonour on non-payment requires noting and protest; accounting entries reverse acceptance and record liability.',
  ]),
  mk(11, 'accountancy', 'Financial Statements I', 'Trading and Profit & Loss Account', ['trading account', 'profit loss', 'gross profit', 'net profit'], [
    'Trading account: opening stock + purchases − closing stock = cost of goods sold; sales − COGS = gross profit. Direct expenses (wages, carriage) in trading account.',
    'P&L account: gross profit + other income − indirect expenses (rent, salaries, depreciation) = net profit. Transfer net profit to capital account.',
  ]),
  mk(11, 'accountancy', 'Financial Statements II', 'Balance Sheet and Adjustments', ['balance sheet', 'adjustments', 'outstanding expenses', 'prepaid', 'accrued income'], [
    'Balance sheet: assets (fixed, current) = liabilities (capital, loans, current). Order of liquidity or permanence per schedule III companies act format concepts.',
    'Common adjustments: outstanding/prepaid expenses, accrued/unearned income, depreciation, bad debts, closing stock. Adjustments require additional journal entries before final accounts.',
  ]),
];

const ACCOUNTANCY_12: ChapterSeed[] = [
  mk(12, 'accountancy', 'Accounting for Partnership Firms', 'Partnership Deed and P&L Appropriation', ['partnership', 'profit sharing', 'partners capital', 'goodwill'], [
    'Partnership governed by deed: profit sharing ratio, interest on capital, partners\' salary, interest on drawings. P&L appropriation account distributes profit after salary and interest.',
    'Fixed vs fluctuating capital accounts. Goodwill valued by average profit, super profit, or capitalisation methods on admission, retirement, or death.',
  ]),
  mk(12, 'accountancy', 'Reconstitution of Partnership', 'Admission, Retirement, and Death', ['admission', 'retirement', 'sacrificing ratio', 'gaining ratio', 'revaluation'], [
    'Admission: new profit ratio, goodwill adjustment, revaluation of assets/liabilities, capital adjustment. Sacrificing ratio = old share − new share of continuing partners.',
    'Retirement/death: settlement of retiring/deceased partner\'s capital, share of goodwill, revaluation account. Joint life policy or individual policies fund buyout.',
  ]),
  mk(12, 'accountancy', 'Dissolution of Partnership Firm', 'Realisation Account and Settlement', ['dissolution', 'realisation account', 'loss deficiency', 'partner loan'], [
    'Dissolution winds up firm; realisation account records sale of assets, payment of liabilities, realisation expenses. Profit/loss on realisation to partners in profit ratio.',
    'Order of payment: external liabilities, partners\' loans, capital balances. Deficiency of capital borne by solvent partners. Insolvency requires legal proceedings.',
  ]),
  mk(12, 'accountancy', 'Accounting for Share Capital', 'Issue and Forfeiture of Shares', ['share capital', 'equity shares', 'preference shares', 'forfeiture', 'reissue'], [
    'Company capital divided into shares. Issue at par, premium, or discount (discount restricted). Application, allotment, call money stages.',
    'Forfeiture for non-payment cancels shares; amount received on forfeited shares to forfeited shares account. Reissue at par, premium, or discount; balance in forfeiture account to capital reserve.',
  ]),
  mk(12, 'accountancy', 'Issue and Redemption of Debentures', 'Debentures and Sinking Fund', ['debentures', 'redemption', 'sinking fund', 'security premium'], [
    'Debentures long-term debt; secured vs unsecured. Issue at par, premium, discount; interest is finance cost. Redemption at maturity or earlier.',
    'Debenture redemption reserve mandatory for certain companies. Sinking fund sets aside money for redemption. Conversion of debentures to equity possible.',
  ]),
  mk(12, 'accountancy', 'Financial Statements of Companies', 'Schedule III and Notes', ['company accounts', 'schedule III', 'balance sheet format', 'notes to accounts'], [
    'Schedule III Companies Act prescribes vertical balance sheet and statement of profit and loss format. Classification current vs non-current (12-month rule).',
    'Notes disclose accounting policies, contingent liabilities, related party transactions. Share capital shows authorised, issued, subscribed, paid-up.',
  ]),
  mk(12, 'accountancy', 'Analysis of Financial Statements', 'Ratio Analysis', ['ratio analysis', 'liquidity', 'solvency', 'profitability', 'turnover ratios'], [
    'Liquidity: current ratio, quick ratio. Solvency: debt-equity, interest coverage. Profitability: gross, operating, net profit margin; ROA, ROE.',
    'Activity/turnover: inventory turnover, receivables turnover, asset turnover. Trend analysis and inter-firm comparison interpret ratios; industry benchmarks contextualise.',
  ]),
  mk(12, 'accountancy', 'Cash Flow Statement', 'Operating, Investing, Financing Activities', ['cash flow', 'indirect method', 'operating activities', 'AS 3'], [
    'Cash flow statement (AS 3) shows inflows/outflows classified operating, investing, financing. Indirect method starts from net profit, adjusts non-cash items and working capital changes.',
    'Investing: purchase/sale of fixed assets, investments. Financing: issue of shares/debentures, repayment, dividends. Net increase in cash reconciles opening and closing balances.',
  ]),
  mk(12, 'accountancy', 'Accounting Ratios', 'Comprehensive Ratio Formulae', ['accounting ratios', 'current ratio', 'debt equity', 'working capital'], [
    'Current ratio = Current assets/Current liabilities. Quick ratio excludes inventory. Debt-equity = Total debt/Shareholders\' equity.',
    'Working capital = Current assets − Current liabilities. EPS = (Net profit − Preference dividend)/Weighted average equity shares. PE ratio = Market price/EPS.',
  ]),
  mk(12, 'accountancy', 'Computerised Accounting', 'ERP and Database Accounting', ['computerised accounting', 'Tally', 'ERP', 'database', 'security'], [
    'Computerised systems: speed, accuracy, automatic posting, instant reports. Database stores vouchers, ledgers; relational structure links tables.',
    'Internal controls: user access, audit trail, backup. Tally and similar software implement double-entry. Limitations: garbage in garbage out; requires trained personnel.',
  ]),
];

// ─── Business Studies (Classes 11 & 12) ───────────────────────────────────────

const BUSINESS_11: ChapterSeed[] = [
  mk(11, 'business', 'Nature and Purpose of Business', 'Economic and Social Objectives', ['business', 'profession', 'employment', 'economic objectives', 'social responsibility'], [
    'Business: organised activity for goods/services to earn profit. Distinct from profession (service, fee, code of conduct) and employment (contract, salary).',
    'Objectives: profit, growth, market share; social—quality products, fair wages, environmental care. Business risk from uncertainties; risk-bearing distinguishes entrepreneurs.',
  ]),
  mk(11, 'business', 'Forms of Business Organisation', 'Sole Proprietorship to Company', ['sole proprietorship', 'partnership', 'company', 'cooperative', 'HUF'], [
    'Sole proprietorship: easy formation, full control, unlimited liability, limited capital. Partnership: agreement, shared profit/loss, mutual agency, unlimited liability (except LLP).',
    'Company: separate legal entity, limited liability, perpetual succession; complex formation. Cooperative: democratic control, one member one vote. HUF governed by Hindu law.',
  ]),
  mk(11, 'business', 'Private, Public and Global Enterprises', 'PSU and MNCs', ['public sector', 'private sector', 'MNC', 'joint venture', 'PPP'], [
    'Public sector: government ownership—Departmental, PSU, statutory corporations. Objectives include public welfare, strategic sectors. Disinvestment reduces government stake.',
    'MNCs operate in multiple countries; FDI brings capital and technology. Joint ventures share ownership. PPP combines public purpose with private efficiency.',
  ]),
  mk(11, 'business', 'Business Services', 'Banking, Insurance, and Communication', ['banking', 'insurance', 'communication', 'e-banking', 'outsourcing'], [
    'Banking: commercial banks accept deposits, lend; RBI regulates. Types of accounts: savings, current, fixed deposit. E-banking: NEFT, RTGS, UPI.',
    'Insurance: life (long-term, savings) and general (fire, marine, health); principle of utmost good faith. Telecom, postal, courier facilitate communication. BPO/KPO outsourcing services.',
  ]),
  mk(11, 'business', 'Emerging Modes of Business', 'E-business and Outsourcing', ['e-business', 'e-commerce', 'B2B', 'B2C', 'digital payments'], [
    'E-business: electronic conduct of business—e-commerce (buying/selling online), e-learning, e-governance. B2B, B2C, C2C models.',
    'Benefits: global reach, 24×7, lower cost. Challenges: cybersecurity, digital divide, logistics. Outsourcing non-core functions to specialists.',
  ]),
  mk(11, 'business', 'Social Responsibilities of Business', 'CSR and Ethics', ['CSR', 'business ethics', 'stakeholders', 'environment', 'consumer protection'], [
    'Stakeholders: shareholders, employees, consumers, community, government. CSR beyond profit: education, health, environment. Companies Act mandates CSR spending for eligible firms.',
    'Business ethics: honesty, fair competition, no exploitation. Consumer rights: safety, information, choice, redressal (Consumer Protection Act).',
  ]),
  mk(11, 'business', 'Formation of a Company', 'Incorporation and Documents', ['company formation', 'MOA', 'AOA', 'promoter', 'incorporation'], [
    'Promoter conceives idea, prepares documents, arranges capital. Memorandum of Association: name, registered office, objects, liability, capital clauses. Articles: internal rules.',
    'Certificate of incorporation creates legal entity. Prospectus invites public investment (public company). One Person Company (OPC) allows single-member company.',
  ]),
  mk(11, 'business', 'Sources of Business Finance', 'Equity, Debt, and Retained Earnings', ['business finance', 'equity', 'debentures', 'retained earnings', 'trade credit'], [
    'Owner\'s funds: equity shares, retained earnings, reserves. Borrowed funds: debentures, bonds, loans from banks/financial institutions, public deposits.',
    'Trade credit from suppliers short-term. Factoring sells receivables. Choice depends on cost, control dilution, risk, flexibility. Short vs long-term matching with asset life.',
  ]),
  mk(11, 'business', 'Small Business and Entrepreneurship', 'MSME and Startup India', ['MSME', 'entrepreneurship', 'startup', 'small business', 'incentives'], [
    'MSMEs: micro, small, medium by investment and turnover. Role in employment, regional development. Government incentives: credit, subsidies, marketing support.',
    'Entrepreneur: innovator, risk-taker. Startup India: funding, tax benefits, simplification. Challenges: capital, skilled labour, competition from large firms.',
  ]),
  mk(11, 'business', 'Internal Trade', 'Retail, Wholesale, and Warehousing', ['internal trade', 'retail', 'wholesale', 'warehousing', 'GST'], [
    'Wholesale: bulk buying from producers, selling to retailers. Retail: direct to consumers—departmental stores, supermarkets, e-tailers.',
    'Warehousing balances supply-demand, price stabilisation. GST unified indirect tax across states. Role of chambers of commerce and trade fairs.',
  ]),
];

const BUSINESS_12: ChapterSeed[] = [
  mk(12, 'business', 'Nature and Significance of Management', 'Management Functions and Levels', ['management', 'planning', 'organising', 'staffing', 'controlling'], [
    'Management: getting things done through others efficiently and effectively. Functions: planning (goals, strategies), organising (structure), staffing, directing (leadership, motivation), controlling (standards, correction).',
    'Levels: top (strategic), middle (coordination), supervisory (operational). Management universal, continuous, multidimensional (work, people, operations).',
  ]),
  mk(12, 'business', 'Principles of Management', 'Fayol and Taylor', ['fayol', 'taylor', 'scientific management', '14 principles', 'time study'], [
    'Fayol 14 principles: division of work, authority-responsibility, discipline, unity of command, unity of direction, subordination of individual interest, remuneration, centralisation, scalar chain, order, equity, stability of tenure, initiative, esprit de corps.',
    'Taylor scientific management: time and motion study, standardisation, differential piece wage, functional foremanship. Focus efficiency at shop floor.',
  ]),
  mk(12, 'business', 'Business Environment', 'PEST and Liberalisation', ['business environment', 'economic reforms', 'liberalisation', 'globalisation', 'privatisation'], [
    'Environment dimensions: economic, social, technological, political, legal. Economic reforms 1991: liberalisation (reduced controls), privatisation, globalisation (integration with world economy).',
    'Demonetisation, GST, Make in India shape context. SWOT links internal strengths/weaknesses with external opportunities/threats.',
  ]),
  mk(12, 'business', 'Planning', 'Objectives, Strategy, and Planning Process', ['planning', 'objectives', 'strategy', 'policy', 'procedure'], [
    'Planning: deciding in advance what to do, how, when. Types: objectives (ends), strategy (grand plan), policies (guides), procedures (steps), rules (mandatory), programmes, budgets.',
    'Benefits: reduces uncertainty, focuses efforts. Limitations: rigid, time-consuming, cannot eliminate risk. MBO links organisational and individual goals.',
  ]),
  mk(12, 'business', 'Organising', 'Structure, Delegation, and Span of Control', ['organising', 'organisational structure', 'delegation', 'decentralisation', 'departmentation'], [
    'Organising arranges resources and tasks. Structure: functional, divisional, matrix. Delegation: authority, responsibility, accountability transferred; empowers subordinates.',
    'Span of control: subordinates per manager. Centralisation vs decentralisation of decision authority. Formal and informal organisation coexist.',
  ]),
  mk(12, 'business', 'Staffing', 'Recruitment, Selection, and Training', ['staffing', 'recruitment', 'selection', 'training', 'performance appraisal'], [
    'Staffing: manpower planning, recruitment (internal/external), selection (tests, interviews), placement, induction. Training on-the-job and off-the-job upgrades skills.',
    'Performance appraisal evaluates work; methods ranking, 360-degree. Compensation: monetary and non-monetary. Career planning retains talent.',
  ]),
  mk(12, 'business', 'Directing', 'Leadership, Motivation, and Communication', ['directing', 'leadership', 'motivation', 'maslow', 'communication'], [
    'Directing guides, inspires, supervises. Leadership styles autocratic, democratic, laissez-faire. Motivation theories: Maslow hierarchy, Herzberg two-factor, McGregor Theory X/Y.',
    'Communication: formal/informal, upward/downward. Barriers: semantic, psychological. Supervision ensures plans executed on ground.',
  ]),
  mk(12, 'business', 'Controlling', 'Steps and Techniques of Control', ['controlling', 'standards', 'deviation', 'budgetary control', 'PERT CPM'], [
    'Controlling: measure performance vs standards, identify deviations, take corrective action. Steps: establish standards, measure, compare, correct.',
    'Techniques: budgetary control, break-even analysis, PERT/CPM for projects, ROI. Critical point control and management by exception focus key areas.',
  ]),
  mk(12, 'business', 'Financial Management', 'Capital Structure and Working Capital', ['financial management', 'capital budgeting', 'working capital', 'dividend'], [
    'Objectives: maximise shareholder wealth, ensure liquidity and solvency. Investment decision: capital budgeting NPV, IRR, payback. Financing decision: debt-equity mix.',
    'Working capital: current assets minus current liabilities; gross vs net. Dividend policy balances retention for growth vs payout to shareholders.',
  ]),
  mk(12, 'business', 'Financial Markets', 'Money and Capital Markets', ['financial markets', 'stock exchange', 'SEBI', 'mutual funds', 'primary secondary market'], [
    'Money market: short-term instruments (T-bills, commercial paper). Capital market: long-term equity, bonds. Primary market: new issue; secondary: trading existing securities.',
    'SEBI regulates securities market protects investors. NSE, BSE major stock exchanges. Mutual funds pool retail investment; demat accounts hold shares electronically.',
  ]),
  mk(12, 'business', 'Marketing Management', 'Marketing Mix and Consumer Behaviour', ['marketing', '4Ps', 'product', 'price', 'place', 'promotion'], [
    'Marketing creates value and exchange. Marketing mix 4Ps: Product (features, branding), Price (skimming, penetration), Place (distribution channels), Promotion (advertising, sales promotion, PR).',
    'Consumer behaviour influenced by cultural, social, personal, psychological factors. Market segmentation, targeting, positioning (STP). Digital marketing and social media growing.',
  ]),
  mk(12, 'business', 'Consumer Protection', 'Consumer Rights and Redressal', ['consumer protection', 'consumer rights', 'COPRA', 'district forum', 'unfair trade practices'], [
    'Consumer Protection Act 2019: rights to safety, information, choice, be heard, seek redressal, consumer education. Covers e-commerce, product liability.',
    'Redressal: District Commission, State Commission, National Commission by claim value. Unfair trade practices: false advertising, defective goods. Role of consumer organisations.',
  ]),
];

// ─── Economics (Classes 11 & 12) ──────────────────────────────────────────────

const ECONOMICS_11: ChapterSeed[] = [
  mk(11, 'economics', 'Indian Economy on the Eve of Independence', 'Colonial Impact on Indian Economy', ['colonial economy', 'deindustrialisation', 'agriculture stagnation', 'independence 1947'], [
    'British rule left India poor, agrarian, with low industrial base. Deindustrialisation destroyed handicrafts; raw material exported, finished goods imported.',
    'Agriculture stagnant: zamindari, subsistence farming, famines. Infrastructure (railways, ports) served colonial extraction. Low literacy, poor health, partition trauma at independence.',
  ]),
  mk(11, 'economics', 'Indian Economy 1950-1990', 'Five Year Plans and Licence Raj', ['five year plans', 'green revolution', 'licence permit raj', 'public sector'], [
    'Planning Commission; mixed economy model. Priority: agriculture, heavy industry. Green Revolution (1960s): HYV seeds, irrigation, fertilisers—food self-sufficiency.',
    'Industrial policy reserved sectors for public sector; licence-permit raj regulated private industry. Import substitution; protectionism. Achievements and inefficiencies debated.',
  ]),
  mk(11, 'economics', 'Liberalisation, Privatisation, Globalisation', 'Economic Reforms 1991', ['LPG reforms', '1991 crisis', 'privatisation', 'globalisation', 'disinvestment'], [
    'Balance of payments crisis 1991 triggered reforms under Narasimha Rao-Manmohan Singh. Liberalisation reduced industrial licensing, trade barriers; rupee devaluation.',
    'Privatisation and disinvestment in PSUs. Globalisation: WTO, FDI, technology transfer. Debate on growth vs inequality, employment, farmer impact.',
  ]),
  mk(11, 'economics', 'Poverty and Human Capital', 'Poverty Measures and Education', ['poverty', 'BPL', 'human capital', 'education', 'health'], [
    'Poverty line based on calorie/nutrition or consumption expenditure; head count ratio, poverty gap. Causes: unemployment, inequality, social exclusion.',
    'Human capital: education and health raise productivity. Government schemes: MGNREGA, PM-JAY, mid-day meal. Gender disparities in literacy and workforce participation.',
  ]),
  mk(11, 'economics', 'Rural Development', 'Agriculture and Rural Credit', ['rural development', 'agriculture', 'NABARD', 'SHG', 'organic farming'], [
    'Rural development: diversification beyond crops—animal husbandry, fisheries, horticulture, non-farm employment. Institutional credit: cooperative banks, RRBs, NABARD.',
    'Self-Help Groups (SHGs) microfinance empower women. Organic farming, crop insurance PMFBY reduce risk. Land reforms uneven across states.',
  ]),
  mk(11, 'economics', 'Employment', 'Types and Unemployment in India', ['employment', 'unemployment', 'informal sector', 'jobless growth', 'labour force'], [
    'Labour force = employed + unemployed seeking work. Types: self-employed, regular wage, casual. Disguised unemployment in agriculture.',
    'Structural, frictional, cyclical unemployment. Informal sector lacks social security. Jobless growth concern despite GDP rise; skill mismatch.',
  ]),
  mk(11, 'economics', 'Infrastructure', 'Energy, Transport, and Communication', ['infrastructure', 'power', 'roads', 'telecom', 'digital india'], [
    'Infrastructure supports growth: power (thermal, hydro, renewable), roads (National Highways), railways, ports, airports. Telecom revolution and Digital India expand connectivity.',
    'Energy deficit and renewable transition (solar, wind). PPP in infrastructure. Rural electrification and broadband gaps remain challenges.',
  ]),
  mk(11, 'economics', 'Environment and Sustainable Development', 'Sustainability and Climate', ['sustainable development', 'environment', 'pollution', 'climate change', 'renewable'], [
    'Sustainable development meets present needs without compromising future generations. Trade-off between growth and environment.',
    'Air and water pollution, deforestation, climate change affect India. Paris Agreement commitments. Renewable energy targets; circular economy concepts.',
  ]),
  mk(11, 'economics', 'Comparative Development Experiences', 'India, China, Pakistan', ['comparative development', 'china growth', 'pakistan economy', 'demographic dividend'], [
    'China: post-1978 reforms, export-led manufacturing, poverty reduction at scale. One-child policy (relaxed) affected demography.',
    'Pakistan: agriculture base, political instability, lower growth than India/China. India\'s democratic institutions vs authoritarian efficiency debate. Demographic dividend window for India.',
  ]),
  mk(11, 'economics', 'Introduction to Microeconomics', 'Central Problems of Economy', ['microeconomics', 'scarcity', 'opportunity cost', 'PPF', 'central problems'], [
    'Scarcity forces choice. Opportunity cost: value of next best foregone. Production possibility frontier shows trade-offs; outward shift = growth.',
    'Central problems: what to produce, how to produce, for whom to produce. Positive vs normative economics. Micro studies individual units; macro aggregate economy.',
  ]),
];

const ECONOMICS_12: ChapterSeed[] = [
  mk(12, 'economics', 'Introduction to Macroeconomics', 'National Income and Aggregates', ['macroeconomics', 'GDP', 'GNP', 'national income', 'value added'], [
    'Macroeconomics studies economy-wide variables: output, employment, inflation. GDP: market value of final goods/services produced domestically in a year.',
    'GNP = GDP + net factor income from abroad. Nominal vs real GDP (deflator adjusts prices). Three approaches: expenditure, income, value added.',
  ]),
  mk(12, 'economics', 'National Income Accounting', 'Circular Flow and Methods', ['national income accounting', 'circular flow', 'depreciation', 'NNP', 'personal income'], [
    'Circular flow: households, firms, government, external sector. Leakages (savings, taxes, imports) equal injections (investment, govt spending, exports) at equilibrium.',
    'NNP = GNP − depreciation. Personal income = NI − undistributed profits − net indirect taxes + transfers. Disposable income = PI − direct taxes.',
  ]),
  mk(12, 'economics', 'Money and Banking', 'Money Supply and RBI', ['money', 'RBI', 'money supply', 'credit creation', 'repo rate'], [
    'Functions of money: medium of exchange, store of value, unit of account. M1, M2, M3, M4 measures in India. RBI: issuer of currency, banker to government, bank of banks.',
    'Commercial banks create credit through lending; reserve ratio limits. Monetary policy tools: repo, reverse repo, CRR, SLR, open market operations control inflation and growth.',
  ]),
  mk(12, 'economics', 'Income Determination', 'Aggregate Demand and Supply', ['aggregate demand', 'aggregate supply', 'multiplier', 'consumption function', 'savings'], [
    'AD = C + I + G + (X − M). Consumption function C = C̄ + cY; MPC + MPS = 1. Investment multiplier k = 1/(1 − c) increases income by multiple of initial spending.',
    'Short-run equilibrium where AD = AS. Paradox of thrift. Role of government spending in recession.',
  ]),
  mk(12, 'economics', 'Government Budget and the Economy', 'Budget, Deficit, and Fiscal Policy', ['government budget', 'fiscal deficit', 'revenue expenditure', 'capital expenditure', 'fiscal policy'], [
    'Budget annual financial statement: revenue budget (receipts/expenditure recurring) and capital budget (assets/loans). Revenue deficit, fiscal deficit (total borrowing need), primary deficit (excluding interest).',
    'Fiscal policy: taxation and spending influences AD. Direct taxes progressive; indirect GST. Subsidies, capital expenditure on infrastructure. FRBM Act targets fiscal discipline.',
  ]),
  mk(12, 'economics', 'Open Economy Macroeconomics', 'Balance of Payments and Exchange Rate', ['balance of payments', 'current account', 'capital account', 'exchange rate', 'forex'], [
    'BOP records transactions with rest of world: current account (trade, services, transfers) and capital account (FDI, portfolio, loans). Deficit financed by capital inflows or reserves.',
    'Fixed vs flexible exchange rates. Depreciation makes exports cheaper, imports dearer. Managed float in India. Forex reserves buffer external shocks.',
  ]),
  mk(12, 'economics', 'Introduction to Microeconomics', 'Demand and Supply', ['demand', 'supply', 'equilibrium', 'elasticity', 'law of demand'], [
    'Law of demand: price up, quantity demanded down (ceteris paribus). Demand curve downward sloping. Supply law opposite. Equilibrium price clears market.',
    'Elasticity: price elasticity of demand (%ΔQd/%ΔP). Inelastic (necessities), elastic (luxuries). Cross-price, income elasticity classify goods normal/inferior, substitutes/complements.',
  ]),
  mk(12, 'economics', 'Consumer Equilibrium and Demand', 'Utility and Indifference Curves', ['consumer equilibrium', 'utility', 'indifference curve', 'budget line', 'MRS'], [
    'Cardinal utility: MUₓ/Pₓ = MUᵧ/Pᵧ at equilibrium. Ordinal: indifference curves show preference bundles; convex to origin. Budget line: income constraint.',
    'Equilibrium where MRS = price ratio. Substitution and income effects of price change. Giffen goods exception. Consumer surplus area below demand above price.',
  ]),
  mk(12, 'economics', 'Production and Costs', 'Production Function and Cost Curves', ['production function', 'marginal product', 'cost curves', 'returns to scale'], [
    'Production function Q = f(L, K). Law of diminishing marginal product. Short-run: MP and AP curves. Returns to scale: increasing, constant, decreasing.',
    'Cost curves: TC, AFC, AVC, ATC, MC. MC intersects AVC and ATC at minimums. Long-run all inputs variable; economies of scale.',
  ]),
  mk(12, 'economics', 'Market Competition', 'Perfect Competition and Monopoly', ['perfect competition', 'monopoly', 'oligopoly', 'MR MC', 'price discrimination'], [
    'Perfect competition: many firms, homogeneous product, price taker; equilibrium P = MC = minimum ATC in long run. Monopoly: single seller, barriers to entry; profits where MR = MC.',
    'Price discrimination extracts consumer surplus. Monopolistic competition: differentiated products, excess capacity. Oligopoly: few firms, interdependence, kinked demand.',
  ]),
];

// ─── History (Classes 11 & 12) ────────────────────────────────────────────────

const HISTORY_11: ChapterSeed[] = [
  mk(11, 'history', 'From the Beginning of Time', 'Human Evolution and Early Societies', ['human evolution', 'archaeology', 'hunter gatherer', 'early humans'], [
    'Archaeology and anthropology study human origins. Australopithecus to Homo sapiens; migration out of Africa. Paleolithic hunter-gatherers used stone tools, fire.',
    'Neolithic revolution: agriculture and domestication (~10,000 BCE) enabled settled villages. Pastoralism complemented farming. Rock art documents early belief and society.',
  ]),
  mk(11, 'history', 'Early Cities and Writing', 'Mesopotamia and Egypt', ['mesopotamia', 'cuneiform', 'egypt', 'urbanisation', 'bronze age'], [
    'Mesopotamia (Tigris-Euphrates): Sumerian cities Ur, Uruk; cuneiform writing; ziggurats; Code of Hammurabi. Wheel, bronze metallurgy.',
    'Egypt: Nile civilisation; pharaohs, pyramids, hieroglyphics; centralised bureaucracy. Urban centres required surplus agriculture and trade.',
  ]),
  mk(11, 'history', 'An Empire Across Three Continents', 'Roman Empire', ['roman empire', 'augustus', 'pax romana', 'christianity', 'decline of rome'], [
    'Roman Republic to Empire under Augustus. Pax Romana facilitated trade across Mediterranean, Europe, North Africa, Near East. Roads, law, Latin language unified.',
    'Christianity spread within empire; later adopted officially. Crisis of third century, division, barbarian invasions. Legacy in law, architecture, governance.',
  ]),
  mk(11, 'history', 'The Central Islamic Lands', 'Rise and Spread of Islam', ['islam', 'caliphate', 'umayyad', 'abbasid', 'crusades'], [
    'Prophet Muhammad (PBUH) unified Arabia; Quran and Sharia. Rashidun and Umayyad caliphates expanded to Spain, Central Asia, India borders.',
    'Abbasid Baghdad centre of learning (House of Wisdom). Crusades Christian-Muslim conflict over Holy Land. Ottoman succession later dominated eastern Mediterranean.',
  ]),
  mk(11, 'history', 'Nomadic Empires', 'Mongols and Pax Mongolica', ['mongols', 'genghis khan', 'pax mongolica', 'nomadic empires'], [
    'Genghis Khan united Mongol tribes; rapid conquests across Asia to Eastern Europe. Mongol administration tolerant of religions; postal system (yam).',
    'Pax Mongolica enabled Silk Road trade linking China, Islamic world, Europe. Black Death may have spread along routes. Yuan dynasty in China under Kublai Khan.',
  ]),
  mk(11, 'history', 'The Three Orders', 'Feudal Europe', ['feudalism', 'three orders', 'church', 'manorialism', 'medieval europe'], [
    'Medieval European society: those who pray (clergy), fight (nobility), work (peasants). Feudal ties: lord-vassal, fief, knight service.',
    'Manorialism: serfs cultivate lord\'s land. Church dominant institution; monasteries preserved learning. Gothic cathedrals. Gradual growth of towns and trade weakened feudal bonds.',
  ]),
  mk(11, 'history', 'Changing Cultural Traditions', 'Renaissance and Reformation', ['renaissance', 'humanism', 'reformation', 'printing press', 'scientific revolution'], [
    'Renaissance Italy: revival of classical learning, humanism, art (Leonardo, Michelangelo). Printing press (Gutenberg) spread ideas.',
    'Protestant Reformation (Luther) challenged Catholic Church; religious wars. Scientific revolution: Copernicus, Galileo, Newton questioned medieval cosmology.',
  ]),
  mk(11, 'history', 'Confrontation of Cultures', 'Columbian Exchange and Colonisation', ['columbian exchange', 'conquistadors', 'colonisation', 'americas', 'atlantic slave trade'], [
    '1492 Columbus voyage linked hemispheres. Conquistadors destroyed Aztec and Inca empires; silver flowed to Europe. Columbian exchange: crops, animals, diseases (smallpox devastated natives).',
    'Atlantic slave trade forcibly transported Africans to Americas. Mercantilism justified colonial extraction for European powers.',
  ]),
  mk(11, 'history', 'The Industrial Revolution', 'Mechanisation and Social Change', ['industrial revolution', 'steam engine', 'factory system', 'urbanisation', 'labour'], [
    'Britain first industrialised: coal, iron, steam engine (Watt), textile machines. Factory system replaced domestic production. Railways revolutionised transport.',
    'Urbanisation, harsh working conditions, child labour. Luddite protests. Gradual labour unions and reform acts. Spread to Europe, USA, Japan by late 19th century.',
  ]),
  mk(11, 'history', 'Displacing Indigenous Peoples', 'Colonialism in Americas and Australia', ['indigenous peoples', 'settler colonialism', 'reservations', 'frontier'], [
    'European settlers displaced Native Americans through disease, war, treaties broken. Westward expansion USA; reservations and cultural assimilation policies.',
    'Australia: Aboriginal dispossession; terra nullius doctrine later challenged (Mabo). Similar patterns in Canada, New Zealand. Lasting socioeconomic marginalisation.',
  ]),
];

const HISTORY_12: ChapterSeed[] = [
  mk(12, 'history', 'Bricks, Beads and Bones', 'Harappan Civilisation', ['harappan', 'indus valley', 'mohenjodaro', 'urban planning', 'script'], [
    'Harappan (Indus) civilisation c. 2600–1900 BCE: Mohenjo-daro, Harappa, Dholavira. Grid town planning, drainage, standardised bricks, Great Bath.',
    'Agriculture, craft specialisation, trade with Mesopotamia. Undeciphered script. Possible decline from climate change, river shifts, not solely invasion.',
  ]),
  mk(12, 'history', 'Kings, Farmers and Towns', 'Early States and Economies', ['mauryan', 'gupta', 'coins', 'agrarian expansion', 'early india'], [
    'Post-Harappan: Vedic society to mahajanapadas, rise of Magadha. Mauryan empire Ashoka dhamma; pillars and inscriptions. Gupta age "classical" period: art, science, literature.',
    'Numismatics and archaeology trace trade. Urban centres Mathura, Ujjain. Agrarian expansion with iron tools; land grants to brahmanas.',
  ]),
  mk(12, 'history', 'Kinship, Caste and Class', 'Social Structures in Early India', ['varna', 'caste', 'kinship', 'patriarchy', 'sangam'], [
    'Varna system Brahmana, Kshatriya, Vaishya, Shudra; jati more local. Manusmriti codified norms; patriarchy in family and inheritance.',
    'Sangam literature Tamil south. Slavery and unfree labour existed. Buddhist and Jain challenge to Brahmanical order.',
  ]),
  mk(12, 'history', 'Thinkers, Beliefs and Buildings', 'Buddhism, Jainism, and Architecture', ['buddhism', 'jainism', 'stupa', 'temple architecture', 'ashoka'], [
    'Mahavira Jainism: ahimsa, asceticism. Buddha Four Noble Truths, Eightfold Path; monastic sangha. Ashoka propagated Buddhism after Kalinga war.',
    'Stupas (Sanchi), chaityas, viharas. Temple architecture evolves nagara, dravida, vesara styles. Philosophy schools Nyaya, Vaisheshika, Sankhya, Yoga, Mimamsa, Vedanta.',
  ]),
  mk(12, 'history', 'Through the Eyes of Travellers', 'Perceptions of Medieval India', ['ibn battuta', 'al beruni', 'travellers accounts', 'medieval india'], [
    'Al-Biruni Kitab-ul-Hind studied Sanskrit, criticised prejudices. Ibn Battuta documented Delhi Sultanate, ports, customs.',
    'Traveller accounts reveal trade, urban life, religious diversity. Bernier 17th century Mughal observations. Critical reading: bias, audience, purpose.',
  ]),
  mk(12, 'history', 'Bhakti-Sufi Traditions', 'Religious Movements', ['bhakti', 'sufi', 'kabir', 'nanak', 'chaitanya'], [
    'Bhakti personal devotion across regions: Alvars, Nayanars, Kabir, Mirabai, Chaitanya, Tulsidas. Challenged ritual hierarchy; vernacular languages.',
    'Sufi mysticism in Islam: khanqahs, syncretic practices. Chishti order popular in north India. Bhakti-Sufi interaction enriched cultural synthesis.',
  ]),
  mk(12, 'history', 'An Imperial Capital: Vijayanagara', 'Archaeology of Hampi', ['vijayanagara', 'hampi', 'krishnadevaraya', 'nayaka'], [
    'Vijayanagara empire 14th–16th century; capital Hampi. Krishnadevaraya patronised art, literature. Royal centre, temple complexes Virupaksha.',
    'Archaeological surveys reconstruct urban layout, bazaars, aqueducts. Battle of Talikota 1565 led to decline. Nayaka successor states.',
  ]),
  mk(12, 'history', 'Peasants, Zamindars and the State', 'Mughal Agrarian Relations', ['mughal', 'zamindar', 'jagirdar', 'agrarian', 'akbar'], [
    'Mughal administration mansabdari, jagirdari; revenue to state via zamindars. Ain-i-Akbari documents land revenue, crops, administration.',
    'Peasant communities bore revenue burden; rebellions documented. Agrarian relations varied regionally Bengal, Deccan, Punjab.',
  ]),
  mk(12, 'history', 'Colonialism and the Countryside', 'Revenue Systems and Revolt', ['permanent settlement', 'ryotwari', 'mahalwari', 'deindustrialisation', '1857'], [
    'British land revenue: Permanent Settlement Bengal zamindars; Ryotwari south direct on cultivators; Mahalwari north-west. Commercial crops cotton, indigo, opium.',
    'Deindustrialisation, famines, tribal dispossession. 1857 revolt causes: sepoy grievances, annexations, social reforms resentment. Aftermath: Crown rule, reorganisation.',
  ]),
  mk(12, 'history', 'Mahatma Gandhi and the National Movement', 'Non-Cooperation to Quit India', ['gandhi', 'non cooperation', 'civil disobedience', 'quit india', 'national movement'], [
    'Gandhi satyagraha in South Africa; leadership from 1917 Champaran. Non-Cooperation 1920–22; Civil Disobedience Salt March 1930; Quit India 1942.',
    'Mass mobilisation, khadi, Hindu-Muslim tensions, role of women, peasants, workers. Negotiations, Cripps Mission, Cabinet Mission; partition and independence 1947.',
  ]),
  mk(12, 'history', 'Framing the Constitution', 'Making of the Indian Constitution', ['constituent assembly', 'constitution', 'fundamental rights', 'directive principles', 'ambedkar'], [
    'Constituent Assembly 1946–49; Dr B.R. Ambedkar chaired Drafting Committee. Debates on federalism, minority rights, language, property.',
    'Adopted 26 November 1949; effective 26 January 1950. Fundamental Rights, Directive Principles, secular democratic republic. Borrowed from various constitutions adapted to Indian context.',
  ]),
];

// ─── Political Science (Classes 11 & 12) ──────────────────────────────────────

const POLITICAL_SCIENCE_11: ChapterSeed[] = [
  mk(11, 'political_science', 'Political Theory: An Introduction', 'What is Politics and Political Theory', ['political theory', 'politics', 'power', 'authority', 'legitimacy'], [
    'Politics concerns power, collective decisions, conflict and cooperation. Political theory reflects on justice, liberty, equality, rights using concepts and traditions.',
    'Empirical vs normative questions. Authority legitimate power; coercion vs consent. State central actor but not only one in global era.',
  ]),
  mk(11, 'political_science', 'Freedom', 'Negative and Positive Liberty', ['freedom', 'liberty', 'negative liberty', 'positive liberty', 'swaraj'], [
    'Negative liberty: absence of external constraints (Isaiah Berlin). Positive liberty: capacity to realise one\'s potential, self-mastery. Tension between individual freedom and social reform.',
    'Indian context: Gandhi swaraj self-rule; Ambedkar social freedom requires annihilation of caste. Limits: harm principle, public order, reasonable restrictions in Constitution.',
  ]),
  mk(11, 'political_science', 'Equality', 'Formal and Substantive Equality', ['equality', 'formal equality', 'affirmative action', 'reservation', 'gender equality'], [
    'Formal equality: equal legal rights. Substantive equality addresses historical disadvantage through redistribution, representation, affirmative action.',
    'Indian reservations for SC, ST, OBC in education and jobs. Gender equality: laws, representation, unpaid care work. Debate merit vs social justice.',
  ]),
  mk(11, 'political_science', 'Social Justice', 'Distributive Justice and Rights', ['social justice', 'distributive justice', 'rawls', 'welfare state'], [
    'Just distribution of resources, opportunities, burdens. Rawls veil of ignorance suggests fair principles protect worst-off. Marxist critique of capitalist inequality.',
    'Welfare state: poverty alleviation, public health, education. Universal basic income debated. Environmental justice links ecology with equity.',
  ]),
  mk(11, 'political_science', 'Rights', 'Human Rights and Constitutional Rights', ['rights', 'human rights', 'fundamental rights', 'UDHR', 'civil liberties'], [
    'Rights claims against state/society. UDHR 1948: civil, political, economic, social, cultural rights. Justiciability distinguishes enforceable constitutional rights from directive goals.',
    'Indian Fundamental Rights Articles 12–35: equality, freedom, against exploitation, religion, culture, constitutional remedies. Reasonable restrictions Article 19.',
  ]),
  mk(11, 'political_science', 'Citizenship', 'Citizenship and Nationality', ['citizenship', 'nationality', 'NRC', 'dual citizenship', 'overseas citizen'], [
    'Citizenship legal membership in political community confers rights and duties. Birth, descent, naturalisation modes. Globalisation challenges exclusive nation-state citizenship.',
    'India: Citizenship Act; OCI for diaspora without political rights. Debates on NRC, CAA, refugees. Cosmopolitan vs communitarian views.',
  ]),
  mk(11, 'political_science', 'Nationalism', 'Nations and National Self-Determination', ['nationalism', 'nation', 'self determination', 'patriotism', 'subnationalism'], [
    'Nation imagined community (Anderson); nationalism asserts political autonomy of nation. Civic nationalism (shared values) vs ethnic nationalism (shared culture/ancestry).',
    'Anti-colonial nationalism in India united diverse groups against British rule. Subnationalisms linguistic states, regional parties. Balance patriotism and pluralism.',
  ]),
  mk(11, 'political_science', 'Secularism', 'Indian vs Western Secularism', ['secularism', 'sarva dharma sambhava', 'principled distance', 'religion politics'], [
    'Western secularism: separation church-state, privatisation of religion. Indian secularism: equal respect all religions, state intervention to reform practices (principled distance).',
    'Constitution Preamble secular; no state religion. Debates uniform civil code, religious personal laws, festivals, education. Communalism threat to secular fabric.',
  ]),
  mk(11, 'political_science', 'Constitution: Why and How', 'Making and Philosophy of Constitution', ['constitution', 'constituent assembly', 'preamble', 'philosophy'], [
    'Constitution supreme law; limits government, protects rights. Indian Constitution longest written; federal with unitary bias; parliamentary democracy; independent judiciary.',
    'Preamble: sovereign socialist secular democratic republic; justice, liberty, equality, fraternity. Amendment procedure balances flexibility and rigidity.',
  ]),
  mk(11, 'political_science', 'Election and Representation', 'Electoral System and Political Parties', ['election', 'FPTP', 'political parties', 'ECI', 'representation'], [
    'First-past-the-post in general elections; proportional elements in Rajya Sabha. Election Commission independent; Model Code, EVMs, voter awareness.',
    'Multi-party system; national vs regional parties. Anti-defection law Tenth Schedule. Representation: descriptive (mirror) vs substantive (acting for groups).',
  ]),
];

const POLITICAL_SCIENCE_12: ChapterSeed[] = [
  mk(12, 'political_science', 'The Cold War Era', 'Bipolarity and Non-Alignment', ['cold war', 'bipolarity', 'NAM', 'NATO', 'warsaw pact'], [
    'Post-1945 USA-USSR rivalry: ideological, nuclear arms race, proxy wars Korea, Vietnam, Afghanistan. Bipolar order; Berlin Wall symbol.',
    'Non-Aligned Movement (Bandung 1955, Belgrade 1961): Nehru, Nasser, Tito avoided bloc alignment. India pursued strategic autonomy; Panchsheel principles.',
  ]),
  mk(12, 'political_science', 'The End of Bipolarity', 'Soviet Collapse and Unipolar Moment', ['soviet collapse', 'unipolar', 'globalisation', '1991'], [
    '1989 Eastern Europe revolutions; 1991 USSR dissolution ended Cold War. USA dominant superpower briefly "unipolar moment".',
    'Russia successor state; shock therapy economics. EU expansion. Rise of China, India shifts toward multipolarity. New security threats terrorism, cyber.',
  ]),
  mk(12, 'political_science', 'US Hegemony in World Politics', 'American Power and Soft Power', ['US hegemony', 'soft power', 'NATO expansion', 'unilateralism'], [
    'US military, economic, cultural dominance post-Cold War. Soft power Hollywood, universities, technology. NATO expansion eastward.',
    'Iraq War 2003 unilateralism controversy. Hegemony vs empire debate. Constraints: domestic politics, rising powers, international law.',
  ]),
  mk(12, 'political_science', 'Alternative Centres of Power', 'EU, China, Japan, ASEAN', ['European Union', 'china rise', 'ASEAN', 'BRICS', 'multipolarity'], [
    'EU economic integration eurozone; political limitations. China manufacturing hub, Belt and Road Initiative; authoritarian party-state.',
    'Japan economic power pacifist constitution. ASEAN regional cooperation. BRICS alternative forum. India G20 presidency role.',
  ]),
  mk(12, 'political_science', 'Contemporary South Asia', 'Regional Politics and SAARC', ['south asia', 'SAARC', 'india pakistan', 'bangladesh', 'sri lanka'], [
    'South Asia: India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan, Maldives, Afghanistan. SAARC limited by India-Pakistan tensions.',
    'Nuclearisation India-Pakistan 1998. Bangladesh liberation 1971 legacy. Sri Lanka civil war ended 2009. Migration, water sharing, terrorism cross-border issues.',
  ]),
  mk(12, 'political_science', 'International Organisations', 'UN, IMF, World Bank, WTO', ['United Nations', 'UNSC', 'IMF', 'World Bank', 'WTO'], [
    'UN founded 1945: General Assembly, Security Council five permanent veto powers. Peacekeeping, specialised agencies WHO, UNESCO.',
    'IMF/World Bank Bretton Woods; structural adjustment critiques. WTO trade rules; disputes settlement. Reform demands for Global South representation.',
  ]),
  mk(12, 'political_science', 'Security in Contemporary World', 'Traditional and Non-Traditional Security', ['security', 'terrorism', 'human security', 'cyber security', 'climate security'], [
    'Traditional security: military, state-centric, deterrence. Non-traditional: terrorism, pandemics, climate change, migration, cyber attacks transcend borders.',
    'Human security focuses individuals freedoms from fear, want. India 26/11, Pulwama responses. Nuclear deterrence India-Pakistan-China triangle.',
  ]),
  mk(12, 'political_science', 'Environment and Natural Resources', 'Global Environmental Politics', ['environment politics', 'climate change', 'paris agreement', 'sustainable development'], [
    'UNFCCC, Kyoto Protocol, Paris Agreement 2015 voluntary nationally determined contributions. Common but differentiated responsibilities principle.',
    'Resource conflicts water, minerals, fisheries. India\'s climate commitments renewable targets. Environmental movements Chipko, Narmada.',
  ]),
  mk(12, 'political_science', 'Challenges of Nation-Building', 'Integration and Linguistic States', ['nation building', 'partition', 'linguistic states', 'kashmir', 'integration'], [
    'Partition 1947 violence, refugee crisis, India-Pakistan hostility. Integration princely states; Kashmir special status history (Article 370 revoked 2019).',
    'Linguistic reorganisation States 1956 after Andhra movement. Northeast tribal diversity. Secularism and minority rights ongoing challenges.',
  ]),
  mk(12, 'political_science', 'Politics of Planned Development', 'Planning, Green Revolution, and Inequality', ['planned development', 'five year plan', 'green revolution', 'poverty', 'land reforms'], [
    'Nehruvian planning mixed economy; heavy industry, dams (temples of modern India). Green Revolution productivity gains but regional, farmer inequality.',
    'Land reforms uneven; zamindari abolition. License raj bureaucracy. 1991 reforms market orientation. Debate development vs displacement, Adivasi rights.',
  ]),
  mk(12, 'political_science', 'Regional Aspirations and Recent Developments', 'Regionalism and Coalition Politics', ['regionalism', 'coalition government', 'mandir mandal', 'liberalisation'], [
    'Regional parties DMK, AIADMK, TMC, BSP, SP reflect linguistic, caste, ethnic identities. Coalition governments since 1989; centrality of regional demands.',
    'Mandal Commission OBC reservations 1990 protests. Ram Janmabhoomi movement communal politics. Economic reforms changed state-market relations; new social movements.',
  ]),
];

// ─── Export ───────────────────────────────────────────────────────────────────

export const SEEDS_CLASS_11_12: ChapterSeed[] = [
  ...MATH_11,
  ...MATH_12,
  ...PHYSICS_11,
  ...PHYSICS_12,
  ...CHEMISTRY_11,
  ...CHEMISTRY_12,
  ...BIOLOGY_11,
  ...BIOLOGY_12,
  ...ENGLISH_11,
  ...ENGLISH_12,
  ...ACCOUNTANCY_11,
  ...ACCOUNTANCY_12,
  ...BUSINESS_11,
  ...BUSINESS_12,
  ...ECONOMICS_11,
  ...ECONOMICS_12,
  ...HISTORY_11,
  ...HISTORY_12,
  ...POLITICAL_SCIENCE_11,
  ...POLITICAL_SCIENCE_12,
];
