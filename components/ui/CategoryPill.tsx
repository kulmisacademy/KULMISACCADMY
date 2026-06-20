'use client';
import { TRACK_META } from '@/lib/data';
import type { Track } from '@/lib/types';

interface CategoryPillProps {
  track: Track;
  size?: 'sm' | 'md';
  solid?: boolean;
}

export function CategoryPill({ track, size = 'md', solid }: CategoryPillProps) {
  const meta = TRACK_META[track];
  const isSmall = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-pill font-mono uppercase tracking-wide ${
        isSmall ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
      }`}
      style={{
        background: solid ? meta.bg : `${meta.color}18`,
        color: meta.color,
        border: `1px solid ${meta.color}30`,
      }}
    >
      {meta.label}
    </span>
  );
}
