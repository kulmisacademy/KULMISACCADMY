interface KulmisLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function KulmisLogo({ size = 36, className = '', style }: KulmisLogoProps) {
  const h = Math.round(size * 1.18);
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 100 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Kulmis Academy"
    >
      {/* ── Graduation Cap (uses currentColor → adapts dark/light) ── */}
      {/* Mortarboard board */}
      <path d="M50 4 L97 26 L50 48 L3 26 Z" fill="currentColor" />
      {/* Cap post (right side) */}
      <rect x="74" y="26" width="5" height="20" rx="2" fill="currentColor" />
      {/* Tassel ball */}
      <circle cx="76.5" cy="48" r="5.5" fill="currentColor" />
      {/* Tassel strings */}
      <path
        d="M73 53 Q70 60 68 66 M76.5 53 L76.5 66 M80 53 Q83 60 85 66"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* ── Letter A (solid brand purple) ── */}
      {/* Outer A shape */}
      <path
        d="M50 42 L5 116 L27 116 L50 67 L73 116 L95 116 Z"
        fill="url(#kulmisGrad)"
      />
      {/* A inner counter — V-notched bottom gives the arrow / lightning look */}
      <path
        d="M50 70 L37 97 L50 87 L63 97 Z"
        fill="var(--surface-page)"
      />

      <defs>
        <linearGradient
          id="kulmisGrad"
          x1="5"
          y1="42"
          x2="95"
          y2="116"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
