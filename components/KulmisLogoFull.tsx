import Image from 'next/image';

interface KulmisLogoFullProps {
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Full horizontal Kulmis Academy logo — uses the REAL logo image.
 *
 * The brand logo (icon + "KULMIS" + "ACADEMY") is theme-adaptive:
 *   • public/logo-light.png → navy icon + navy "KULMIS" (for LIGHT backgrounds)
 *   • public/logo-dark.png  → white icon + white "KULMIS" (for DARK backgrounds)
 * Both keep the purple "A" and purple "ACADEMY".
 *
 * Natural image is 750 x 230 ≈ 3.26 aspect ratio.
 */
const ASPECT = 750 / 230;

export function KulmisLogoFull({ height = 40, className = '', style }: KulmisLogoFullProps) {
  const w = Math.round(height * ASPECT);
  return (
    <span
      className={`kulmis-logo inline-block ${className}`}
      style={{ width: w, height, lineHeight: 0, ...style }}
    >
      {/* LIGHT mode — navy version */}
      <Image
        src="/logo-light.png"
        alt="Kulmis Academy"
        width={w}
        height={height}
        priority
        className="kulmis-logo-light"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
      {/* DARK mode — white version */}
      <Image
        src="/logo-dark.png"
        alt="Kulmis Academy"
        width={w}
        height={height}
        priority
        className="kulmis-logo-dark"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </span>
  );
}
