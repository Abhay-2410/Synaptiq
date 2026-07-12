import { useId } from 'react';

interface SynaptiqLogoProps {
  size?: number;
  className?: string;
}

/** Multipolar neuron: soma, dendritic tree, myelinated axon, synaptic terminals. */
export function SynaptiqLogo({ size = 38, className = '' }: SynaptiqLogoProps) {
  const uid = useId().replace(/:/g, '');

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
        <linearGradient id={`${uid}-cyto`} x1="6" y1="6" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffe484" />
          <stop offset="50%" stopColor="#ffd966" />
          <stop offset="100%" stopColor="#ff8a6b" />
        </linearGradient>
        <linearGradient id={`${uid}-myelin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a5248" />
          <stop offset="55%" stopColor="#1e2a24" />
          <stop offset="100%" stopColor="#2a4238" />
        </linearGradient>
        <radialGradient id={`${uid}-bouton`} cx="35%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#b8f0dc" />
          <stop offset="55%" stopColor="#6ecfaa" />
          <stop offset="100%" stopColor="#3d9a7a" />
        </radialGradient>
        <radialGradient id={`${uid}-nucleus`} cx="38%" cy="36%" r="58%">
          <stop offset="0%" stopColor="#c8f5e4" />
          <stop offset="100%" stopColor="#5ec49f" />
        </radialGradient>
        <clipPath id={`${uid}-clip`}>
          <rect x="2" y="2" width="40" height="40" rx="9" />
        </clipPath>
      </defs>

      <rect x="2" y="2" width="40" height="40" rx="9" className="synaptiq-logo-badge" />

      <g clipPath={`url(#${uid}-clip)`}>
        <g stroke={`url(#${uid}-cyto)`} strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M14.5 10.2 L14.5 4.8 L13.2 3.2" strokeWidth="2.2" />
          <path d="M14.5 10.2 L16.2 5.5 L18.4 3.8" strokeWidth="2" />
          <path d="M14.5 10.2 L11.8 6.2 L9.2 4.5" strokeWidth="2.1" />
          <path d="M12.8 11.8 L8.2 9.5 L5.5 7.2 L4.2 5.5" strokeWidth="1.9" />
          <path d="M12.8 11.8 L9.8 12.8 L7.2 11.5" strokeWidth="1.7" />
          <path d="M15.8 12.2 L18.8 10.2 L21.2 8.2" strokeWidth="1.8" />
          <path d="M15.8 12.2 L17.5 14.2 L19.2 15.5" strokeWidth="1.6" />
          <path d="M13.2 11.2 L10.5 8.8" strokeWidth="1.4" />
          <path d="M14.8 9.5 L12.2 7.8" strokeWidth="1.3" />
        </g>

        <circle cx="14.8" cy="15.2" r="5.6" fill={`url(#${uid}-cyto)`} stroke="#1a2420" strokeWidth="1.1" />
        <circle cx="14.2" cy="14.6" r="2.1" fill={`url(#${uid}-nucleus)`} stroke="#1a2420" strokeWidth="0.75" />

        <path d="M19.2 15.8 L21.5 17.5" stroke={`url(#${uid}-cyto)`} strokeWidth="2.8" strokeLinecap="round" fill="none" />

        <path
          d="M21.5 17.5 C24.5 20.5, 27 23.5, 29.5 26.5 C32 29.5, 34.5 32.5, 36.5 35.2"
          stroke={`url(#${uid}-cyto)`}
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />

        <g transform="rotate(48 22 22)">
          <rect x="18.2" y="20.9" width="4.4" height="2.35" rx="1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.65" />
          <rect x="23.1" y="20.9" width="4.4" height="2.35" rx="1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.65" />
          <rect x="28" y="20.9" width="4.2" height="2.35" rx="1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.65" />
          <rect x="32.6" y="20.9" width="3.8" height="2.35" rx="1" fill={`url(#${uid}-myelin)`} stroke="#1a2420" strokeWidth="0.65" />
        </g>

        <circle cx="22.4" cy="24.8" r="0.55" fill="#6ecfaa" fillOpacity="0.9" />
        <circle cx="27.2" cy="28.2" r="0.5" fill="#6ecfaa" fillOpacity="0.9" />
        <circle cx="31.8" cy="31.5" r="0.48" fill="#6ecfaa" fillOpacity="0.85" />

        <g stroke={`url(#${uid}-cyto)`} strokeLinecap="round" fill="none">
          <path d="M36.5 35.2 L39.2 37.8" strokeWidth="1.9" />
          <path d="M36.5 35.2 L38.2 32.8" strokeWidth="1.7" />
          <path d="M36.5 35.2 L34.2 37.5" strokeWidth="1.8" />
          <path d="M39.2 37.8 L40.8 39.2" strokeWidth="1.35" />
          <path d="M34.2 37.5 L32.8 39" strokeWidth="1.3" />
        </g>

        <circle cx="40.8" cy="39.2" r="1.25" fill={`url(#${uid}-bouton)`} stroke="#1a2420" strokeWidth="0.65" />
        <circle cx="32.8" cy="39" r="1.15" fill={`url(#${uid}-bouton)`} stroke="#1a2420" strokeWidth="0.6" />
        <circle cx="38.2" cy="32.8" r="1.05" fill={`url(#${uid}-bouton)`} stroke="#1a2420" strokeWidth="0.6" />
        <circle cx="39.2" cy="37.8" r="1.1" fill={`url(#${uid}-bouton)`} stroke="#1a2420" strokeWidth="0.58" />
      </g>
    </svg>
  );
}