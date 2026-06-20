'use client';
import React from 'react';

const COLORS = [
  ['#6366F1', '#4F46E5'], ['#22D3EE', '#0891B2'], ['#10B981', '#059669'],
  ['#F59E0B', '#D97706'], ['#8B5CF6', '#7C3AED'], ['#EC4899', '#DB2777'],
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  status?: 'online' | 'offline';
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar({ name, src, size = 40, status, className = '', style }: AvatarProps) {
  const [err, setErr] = React.useState(false);
  const [bg, fg] = getColor(name);
  const initials = getInitials(name);

  return (
    <span
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size, background: bg, ...style }}
    >
      {src && !err ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <span
          className="font-semibold leading-none select-none"
          style={{ fontSize: size * 0.38, color: fg === '#4F46E5' ? '#fff' : '#fff' }}
        >
          {initials}
        </span>
      )}
      {status === 'online' && (
        <span
          className="absolute bottom-0 right-0 rounded-full border-2 border-[var(--surface-card)] bg-[#10B981]"
          style={{ width: size * 0.26, height: size * 0.26 }}
        />
      )}
    </span>
  );
}
