/**
 * Deterministic physics numerical solvers for CBSE/ICSE class problems.
 * Used when the LLM might only state a formula without finishing the calculation.
 */
import type { RawMathStep } from './raw-math/quadratic.js';
import { normalizeMathInput } from './stem-solve.js';

export interface PhysicsSolveResult {
  title: string;
  steps: RawMathStep[];
  narrativeOptions: {
    ohm?: { v: number; i: number; r: number; find: 'v' | 'i' | 'r' };
    fma?: { m: number; f: number };
    work?: { f: number; s: number };
    power?: { p?: number; v?: number; i?: number; w?: number; t?: number };
    speed?: { d: number; t: number };
    ke?: { m: number; v: number };
    pe?: { m: number; h: number; g?: number };
    kinematics?: { u: number; a: number; t: number; find: 'v' | 's' };
  };
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

function extractFindTarget(text: string): string | null {
  const m = text.match(/\bfind\s+([a-zA-Z]+)/i);
  return m?.[1]?.toLowerCase() ?? null;
}

/** Parse assignments like R = 10 Ω, V = 5 V, m = 2 kg */
function extractSymbolValues(text: string): Record<string, number> {
  const q = normalizeMathInput(text);
  const out: Record<string, number> = {};

  const symbolPatterns = [
    /\b([VIRPFmauts])\s*=\s*(\d+(?:\.\d+)?)/gi,
    /\b(resistance|voltage|current|mass|force|distance|time|speed|acceleration)\s*=\s*(\d+(?:\.\d+)?)/gi,
  ];

  for (const re of symbolPatterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(q)) !== null) {
      const sym = m[1].toLowerCase();
      const val = Number(m[2]);
      const key =
        sym === 'resistance'
          ? 'r'
          : sym === 'voltage'
            ? 'v'
            : sym === 'current'
              ? 'i'
              : sym === 'mass'
                ? 'm'
                : sym === 'force'
                  ? 'f'
                  : sym === 'distance'
                    ? 's'
                    : sym === 'time'
                      ? 't'
                      : sym === 'speed'
                        ? 'v'
                        : sym === 'acceleration'
                          ? 'a'
                          : sym;
      out[key] = val;
    }
  }

  const massWord = q.match(/\bmass\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*kg/i);
  if (massWord) out.m = Number(massWord[1]);

  const forceWord = q.match(/\bforce\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*n\b/i);
  if (forceWord) out.f = Number(forceWord[1]);

  const distWord = q.match(/\b(?:distance|displacement)\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*m\b/i);
  if (distWord) out.s = Number(distWord[1]);

  const timeWord = q.match(/\btime\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*s\b/i);
  if (timeWord) out.t = Number(timeWord[1]);

  return out;
}

export function parseOhmsLaw(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  const mentionsOhm =
    /\bohm|ohms?\s*law|resistance|circuit|electricity\b/.test(q) ||
    /\b[vir]\s*=/.test(q) ||
    /ω|Ω/.test(question);

  const vals = extractSymbolValues(question);
  const findRaw = extractFindTarget(question);
  const find: 'v' | 'i' | 'r' | null =
    findRaw === 'v' || findRaw === 'voltage'
      ? 'v'
      : findRaw === 'i' || findRaw === 'current'
        ? 'i'
        : findRaw === 'r' || findRaw === 'resistance'
          ? 'r'
          : null;

  const v = vals.v;
  const i = vals.i;
  const r = vals.r;

  if (!mentionsOhm && v == null && i == null && r == null) return null;
  if (v == null && i == null && r == null) return null;

  let target = find;
  if (!target) {
    if (v != null && r != null && i == null) target = 'i';
    else if (v != null && i != null && r == null) target = 'r';
    else if (i != null && r != null && v == null) target = 'v';
    else return null;
  }

  const V = v ?? 0;
  const I = i ?? 0;
  const R = r ?? 0;

  if (target === 'i') {
    if (v == null || r == null || r === 0) return null;
    const current = v / r;
    return {
      title: "Ohm's law",
      narrativeOptions: { ohm: { v, i: current, r, find: 'i' } },
      steps: [
        { equation: '$V = IR$', explanation: "Ohm's law — voltage equals current times resistance (at constant temperature)." },
        { equation: '$I = \\dfrac{V}{R}$', explanation: 'Rearrange to solve for current $I$.' },
        { equation: `$I = \\dfrac{${formatNum(v)}}{${formatNum(r)}}$`, explanation: 'Substitute the given voltage and resistance.' },
        { equation: `$I = ${formatNum(current)}\\,\\text{A}$`, explanation: 'Compute — the answer is in amperes (A).' },
      ],
    };
  }

  if (target === 'v') {
    if (i == null || r == null) return null;
    const voltage = i * r;
    return {
      title: "Ohm's law",
      narrativeOptions: { ohm: { v: voltage, i, r, find: 'v' } },
      steps: [
        { equation: '$V = IR$', explanation: "Ohm's law relating voltage, current, and resistance." },
        { equation: `$V = (${formatNum(i)}) \\times (${formatNum(r)})$`, explanation: 'Substitute current and resistance.' },
        { equation: `$V = ${formatNum(voltage)}\\,\\text{V}$`, explanation: 'Voltage in volts (V).' },
      ],
    };
  }

  if (target === 'r') {
    if (v == null || i == null || i === 0) return null;
    const resistance = v / i;
    return {
      title: "Ohm's law",
      narrativeOptions: { ohm: { v, i, r: resistance, find: 'r' } },
      steps: [
        { equation: '$V = IR$', explanation: "Ohm's law." },
        { equation: '$R = \\dfrac{V}{I}$', explanation: 'Rearrange for resistance.' },
        { equation: `$R = \\dfrac{${formatNum(v)}}{${formatNum(i)}} = ${formatNum(resistance)}\\,\\Omega$`, explanation: 'Resistance in ohms ($\\Omega$).' },
      ],
    };
  }

  return null;
}

export function parseForceMassAccel(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  if (!/\b(force|acceleration|f\s*=\s*ma|newton)\b/.test(q)) return null;

  const vals = extractSymbolValues(question);
  const find = extractFindTarget(question);

  const m = vals.m;
  const f = vals.f;
  const a = vals.a;

  if (find === 'a' || (m != null && f != null && a == null)) {
    if (m == null || f == null || m === 0) return null;
    const accel = f / m;
    return {
      title: "Newton's second law",
      narrativeOptions: { fma: { m, f } },
      steps: [
        { equation: '$F = ma$', explanation: "Newton's second law — net force equals mass times acceleration." },
        { equation: `$a = \\dfrac{F}{m} = \\dfrac{${formatNum(f)}}{${formatNum(m)}}$`, explanation: 'Rearrange and substitute.' },
        { equation: `$a = ${formatNum(accel)}\\,\\text{m/s}^2$`, explanation: 'Acceleration in $\\text{m/s}^2$.' },
      ],
    };
  }

  if (find === 'f' || (m != null && a != null && f == null)) {
    if (m == null || a == null) return null;
    const force = m * a;
    return {
      title: "Newton's second law",
      narrativeOptions: { fma: { m, f: force } },
      steps: [
        { equation: '$F = ma$', explanation: "Newton's second law." },
        { equation: `$F = (${formatNum(m)}) \\times (${formatNum(a)})$`, explanation: 'Substitute mass and acceleration.' },
        { equation: `$F = ${formatNum(force)}\\,\\text{N}$`, explanation: 'Force in newtons (N).' },
      ],
    };
  }

  if (find === 'm' || (f != null && a != null && m == null)) {
    if (f == null || a == null || a === 0) return null;
    const mass = f / a;
    return {
      title: "Newton's second law",
      narrativeOptions: { fma: { m: mass, f } },
      steps: [
        { equation: '$F = ma$', explanation: "Newton's second law." },
        { equation: `$m = \\dfrac{F}{a} = \\dfrac{${formatNum(f)}}{${formatNum(a)}}$`, explanation: 'Rearrange for mass.' },
        { equation: `$m = ${formatNum(mass)}\\,\\text{kg}$`, explanation: 'Mass in kilograms.' },
      ],
    };
  }

  return null;
}

export function parseWorkDone(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  if (!/\b(work|w\s*=\s*f|joule)\b/.test(q)) return null;

  const vals = extractSymbolValues(question);
  const f = vals.f;
  const s = vals.s;
  if (f == null || s == null) return null;

  const w = f * s;
  return {
    title: 'Work done',
    narrativeOptions: { work: { f, s } },
    steps: [
      { equation: '$W = F \\times s$', explanation: 'Work done equals force times displacement in the direction of force.' },
      { equation: `$W = ${formatNum(f)} \\times ${formatNum(s)}$`, explanation: 'Substitute force (N) and displacement (m).' },
      { equation: `$W = ${formatNum(w)}\\,\\text{J}$`, explanation: 'Work in joules (J).' },
    ],
  };
}

export function parseSpeedDistanceTime(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  if (!/\b(speed|velocity|distance|time)\b/.test(q) || !/\b(find|calculate|compute|solve)\b/.test(q)) return null;

  const vals = extractSymbolValues(question);
  const find = extractFindTarget(question);
  const d = vals.s ?? vals.d;
  const t = vals.t;
  const v = vals.v;

  if ((find === 'speed' || find === 'v' || find === 'velocity') && d != null && t != null && t !== 0) {
    const speed = d / t;
    return {
      title: 'Speed',
      narrativeOptions: { speed: { d, t } },
      steps: [
        { equation: '$\\text{speed} = \\dfrac{\\text{distance}}{\\text{time}}$', explanation: 'Average speed formula.' },
        { equation: `$v = \\dfrac{${formatNum(d)}}{${formatNum(t)}}$`, explanation: 'Substitute distance (m) and time (s).' },
        { equation: `$v = ${formatNum(speed)}\\,\\text{m/s}$`, explanation: 'Speed in $\\text{m/s}$.' },
      ],
    };
  }

  if (find === 'distance' || find === 's') {
    if (v != null && t != null) {
      const dist = v * t;
      return {
        title: 'Distance',
        narrativeOptions: { speed: { d: dist, t } },
        steps: [
          { equation: '$s = v \\times t$', explanation: 'Distance = speed × time (uniform motion).' },
          { equation: `$s = ${formatNum(v)} \\times ${formatNum(t)} = ${formatNum(dist)}\\,\\text{m}$`, explanation: 'Distance in metres.' },
        ],
      };
    }
  }

  return null;
}

export function parseKineticEnergy(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  if (!/\b(kinetic energy|ke\s*=|½mv|1\/2\s*m\s*v)\b/.test(q)) return null;

  const vals = extractSymbolValues(question);
  const m = vals.m;
  const v = vals.v;
  if (m == null || v == null) return null;

  const ke = 0.5 * m * v * v;
  return {
    title: 'Kinetic energy',
    narrativeOptions: { ke: { m, v } },
    steps: [
      { equation: '$KE = \\dfrac{1}{2}mv^2$', explanation: 'Kinetic energy formula.' },
      { equation: `$KE = \\dfrac{1}{2} \\times ${formatNum(m)} \\times (${formatNum(v)})^2$`, explanation: 'Substitute mass (kg) and speed (m/s).' },
      { equation: `$KE = ${formatNum(ke)}\\,\\text{J}$`, explanation: 'Energy in joules.' },
    ],
  };
}

export function parseUniformAcceleration(question: string): PhysicsSolveResult | null {
  const q = question.toLowerCase();
  if (!/\b(acceleration|v\s*=\s*u\s*\+\s*at|uniform)\b/.test(q)) return null;

  const vals = extractSymbolValues(question);
  const find = extractFindTarget(question);
  const u = vals.u;
  const a = vals.a;
  const t = vals.t;
  const v = vals.v;

  if ((find === 'v' || find === 'velocity') && u != null && a != null && t != null) {
    const velocity = u + a * t;
    return {
      title: 'Equations of motion',
      narrativeOptions: { kinematics: { u, a, t, find: 'v' } },
      steps: [
        { equation: '$v = u + at$', explanation: 'First equation of motion (uniform acceleration).' },
        { equation: `$v = ${formatNum(u)} + (${formatNum(a)}) \\times (${formatNum(t)})$`, explanation: 'Substitute initial velocity, acceleration, and time.' },
        { equation: `$v = ${formatNum(velocity)}\\,\\text{m/s}$`, explanation: 'Final velocity.' },
      ],
    };
  }

  if ((find === 's' || find === 'distance') && u != null && a != null && t != null) {
    const s = u * t + 0.5 * a * t * t;
    return {
      title: 'Equations of motion',
      narrativeOptions: { kinematics: { u, a, t, find: 's' } },
      steps: [
        { equation: '$s = ut + \\dfrac{1}{2}at^2$', explanation: 'Second equation of motion.' },
        { equation: `$s = (${formatNum(u)})(${formatNum(t)}) + \\dfrac{1}{2}(${formatNum(a)})(${formatNum(t)})^2$`, explanation: 'Substitute $u$, $a$, and $t$.' },
        { equation: `$s = ${formatNum(s)}\\,\\text{m}$`, explanation: 'Displacement in metres.' },
      ],
    };
  }

  return null;
}

export function trySolvePhysicsNumerical(question: string): PhysicsSolveResult | null {
  const solvers = [
    parseOhmsLaw,
    parseForceMassAccel,
    parseWorkDone,
    parseSpeedDistanceTime,
    parseKineticEnergy,
    parseUniformAcceleration,
  ];

  for (const solve of solvers) {
    const result = solve(question);
    if (result) return result;
  }
  return null;
}

export function formatPhysicsNarrative(result: PhysicsSolveResult): string {
  const final = result.steps[result.steps.length - 1]?.equation ?? '';

  if (result.narrativeOptions.ohm) {
    const { v, i, r, find } = result.narrativeOptions.ohm;
    const law =
      "Ohm's law states that for a conductor at constant temperature, the voltage across it is directly proportional to the current through it: $V = IR$, where $V$ is in volts (V), $I$ in amperes (A), and $R$ in ohms ($\\Omega$).";
    const approach =
      find === 'i'
        ? `Given $V = ${formatNum(v)}\\,\\text{V}$ and $R = ${formatNum(r)}\\,\\Omega$, rearrange to $I = V/R$.`
        : find === 'v'
          ? `Given $I = ${formatNum(i)}\\,\\text{A}$ and $R = ${formatNum(r)}\\,\\Omega$, use $V = IR$.`
          : `Given $V = ${formatNum(v)}\\,\\text{V}$ and $I = ${formatNum(i)}\\,\\text{A}$, use $R = V/I$.`;
    return [
      `**${result.title}**`,
      '',
      '### Understanding the problem',
      '',
      law,
      '',
      '### The approach',
      '',
      approach,
      '',
      '### Final answer',
      '',
      final,
      '',
      'The step-by-step working below shows every substitution and arithmetic line.',
    ].join('\n');
  }

  if (result.narrativeOptions.fma) {
    const { m, f } = result.narrativeOptions.fma;
    const a = f / m;
    return [
      `**${result.title}**`,
      '',
      '### Understanding the problem',
      '',
      `A mass of $${formatNum(m)}\\,\\text{kg}$ experiences a net force of $${formatNum(f)}\\,\\text{N}$. Use $F = ma$ to find acceleration.`,
      '',
      '### Final answer',
      '',
      `$a = ${formatNum(a)}\\,\\text{m/s}^2$`,
      '',
      'See the step-by-step working below for the full substitution.',
    ].join('\n');
  }

  return [
    `**${result.title}**`,
    '',
    '### Final answer',
    '',
    final,
    '',
    'The step-by-step working below shows every calculation line.',
  ].join('\n');
}
