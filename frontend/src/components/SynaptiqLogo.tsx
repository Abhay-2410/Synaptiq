interface SynaptiqLogoProps {
  size?: number;
  className?: string;
}

/**
 * Synaptiq neuron — textbook-style cell (soma, dendrites, myelin, terminals)
 * recoloured to match the study-desk UI gradients.
 */
export function SynaptiqLogo({ size = 38, className = '' }: SynaptiqLogoProps) {
  const uid = 'sq';

  return (
    <svg
      className={`synaptiq-logo ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-body`} x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe484" />
          <stop offset="45%" stopColor="#ffd966" />
          <stop offset="100%" stopColor="#ff8a6b" />
        </linearGradient>
        <linearGradient id={`${uid}-myelin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a5248" />
          <stop offset="50%" stopColor="#1e2a24" />
          <stop offset="100%" stopColor="#2a4238" />
        </linearGradient>
        <radialGradient id={`${uid}-bulb`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#9ee4c9" />
          <stop offset="55%" stopColor="#6ecfaa" />
          <stop offset="100%" stopColor="#3d9a7a" />
        </radialGradient>
        <radialGradient id={`${uid}-nucleus`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#b8f0dc" />
          <stop offset="100%" stopColor="#6ecfaa" />
        </radialGradient>
        <pattern id={`${uid}-hatch`} width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
          <line x1="0" y1="0" x2="0" y2="3" stroke="#1a2420" strokeOpacity="0.14" strokeWidth="0.65" />
        </pattern>
        <clipPath id={`${uid}-clip`}>
          <rect x="2" y="2" width="40" height="40" rx="9" />
        </clipPath>
      </defs>

      {/* Badge */}
      <rect x="2" y="2" width="40" height="40" rx="9" className="synaptiq-logo-badge" />

      <g clipPath={`url(#${uid}-clip)`}>
        {/* Dendrites + soma (thick organic branches) */}
        <g stroke={`url(#${uid}-body)`} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M13 13.5 L8 7.5 L5.5 5" strokeWidth="3.1" />
          <path d="M13 13.5 L6.5 10.5" strokeWidth="2.6" />
          <path d="M14.2 12.2 L12.5 5.5 L10.5 3.5" strokeWidth="2.8" />
          <path d="M14.2 12.2 L16 6 L18 4" strokeWidth="2.5" />
          <path d="M15 14 L21 8.5 L24.5 6.5" strokeWidth="3" />
          <path d="M15 14 L22.5 12.5" strokeWidth="2.4" />
          <path d="M15 14 L19.5 16.5" strokeWidth="2.6" />
        </g>

        {/* Soma fill */}
        <circle cx="13.8" cy="13.5" r="5.2" fill={`url(#${uid}-body)`} stroke="#1a2420" strokeWidth="1.15" />
        <circle cx="13.8" cy="13.5" r="5.2" fill={`url(#${uid}-hatch)`} stroke="none" opacity="0.55" />

        {/* Nucleus */}
        <circle cx="13.8" cy="13.5" r="2.15" fill={`url(#${uid}-nucleus)`} stroke="#1a2420" strokeWidth="0.85" />

        {/* Axon shaft */}
        <path
          d="M17.5 16.5 L22 21 L26.5 25.5 L31 30 L35 34"
          stroke={`url(#${uid}-body)`}
          strokeWidth="3.35"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M17.5 16.5 L22 21 L26.5 25.5 L31 30 L35 34"
          stroke={`url(#${uid}-hatch)`}
          strokeWidth="3.35"
          strokeLinecap="round"
          fill="none"
          opacity="0.45"
        />

        {/* Myelin sheath segments */}
        <g transform="rotate(42 22 22)">
          <rect x="17.8" y="20.6" width="4.6" height="2.5" rx="1.1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.75" />
          <ellipse cx="20.1" cy="21.75" rx="0.55" ry="0.38" fill="#6ecfaa" fillOpacity="0.85" />

          <rect x="22.8" y="20.6" width="4.6" height="2.5" rx="1.1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.75" />
          <ellipse cx="25.1" cy="21.75" rx="0.55" ry="0.38" fill="#6ecfaa" fillOpacity="0.85" />

          <rect x="27.8" y="20.6" width="4.6" height="2.5" rx="1.1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.75" />
          <ellipse cx="30.1" cy="21.75" rx="0.55" ry="0.38" fill="#6ecfaa" fillOpacity="0.85" />

          <rect x="32.8" y="20.6" width="4.2" height="2.5" rx="1.1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.75" />
          <ellipse cx="34.7" cy="21.75" rx="0.5" ry="0.35" fill="#6ecfaa" fillOpacity="0.85" />
        </g>

        {/* Terminal arbor */}
        <g stroke={`url(#${uid}-body)`} strokeLinecap="round" fill="none">
          <path d="M35 34 L38.5 36.5" strokeWidth="2.2" />
          <path d="M35 34 L37 32" strokeWidth="1.9" />
          <path d="M35 34 L33.5 37.5" strokeWidth="2" />
          <path d="M38.5 36.5 L40.5 38" strokeWidth="1.5" />
          <path d="M33.5 37.5 L32 39.5" strokeWidth="1.5" />
        </g>

        {/* Synaptic bulbs */}
        <circle cx="40.5" cy="38" r="1.35" fill={`url(#${uid}-bulb)`} stroke="#1a2420" strokeWidth="0.7" />
        <circle cx="32" cy="39.5" r="1.2" fill={`url(#${uid}-bulb)`} stroke="#1a2420" strokeWidth="0.7" />
        <circle cx="37" cy="32" r="1.05" fill={`url(#${uid}-bulb)`} stroke="#1a2420" strokeWidth="0.65" />
        <circle cx="38.8" cy="36.8" r="1.1" fill={`url(#${uid}-bulb)`} stroke="#1a2420" strokeWidth="0.65" />
      </g>
    </svg>
  );
}
