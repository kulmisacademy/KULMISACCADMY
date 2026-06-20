'use client';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, reviewCount, showCount = true, size = 'sm' }: StarRatingProps) {
  const starSize = size === 'sm' ? 12 : 15;
  const stars = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, rating - i));
    return fill;
  });

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {stars.map((fill, i) => (
          <svg key={i} width={starSize} height={starSize} viewBox="0 0 12 12" fill="none">
            <path
              d="M6 1l1.236 2.506L10 3.915l-2 1.95.472 2.757L6 7.25 3.528 8.622 4 5.865 2 3.915l2.764-.409L6 1z"
              fill={fill === 1 ? '#F59E0B' : fill > 0 ? 'url(#half)' : 'var(--neutral-300)'}
            />
            <defs>
              <linearGradient id="half" x1="0" x2="1" y1="0" y2="0">
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="var(--neutral-300)" />
              </linearGradient>
            </defs>
          </svg>
        ))}
      </span>
      <span className="text-[11px] font-semibold text-[var(--text-muted)] font-mono">
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className="text-[11px] text-[var(--text-subtle)]">({reviewCount})</span>
      )}
    </span>
  );
}
