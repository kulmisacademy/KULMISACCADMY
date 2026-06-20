'use client';
import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  tone?: 'purple' | 'mint' | 'cyan';
  className?: string;
}

const toneColors = {
  purple: '#6366F1',
  mint: '#10B981',
  cyan: '#22D3EE',
};

export function ProgressBar({ value, max = 100, showLabel, tone = 'purple', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color = toneColors[tone];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[11px] font-semibold text-[var(--text-muted)] font-mono tabular-nums w-8 text-right">
          {pct}%
        </span>
      )}
    </div>
  );
}
