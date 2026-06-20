'use client';
import React from 'react';

type BadgeVariant = 'free' | 'pro' | 'ai' | 'new' | 'beginner' | 'intermediate' | 'advanced' | 'all' | 'success' | 'warning' | 'danger' | 'default';

const styles: Record<BadgeVariant, string> = {
  free: 'bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
  pro: 'bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)]',
  ai: 'bg-[rgba(34,211,238,0.12)] text-[#22D3EE] border border-[rgba(34,211,238,0.3)]',
  new: 'bg-[rgba(99,102,241,0.15)] text-[#818CF8] border border-[rgba(99,102,241,0.3)]',
  beginner: 'bg-[rgba(16,185,129,0.12)] text-[#10B981]',
  intermediate: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
  advanced: 'bg-[rgba(239,68,68,0.12)] text-[#F87171]',
  all: 'bg-[rgba(99,102,241,0.12)] text-[#818CF8]',
  success: 'bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.3)]',
  warning: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border border-[rgba(245,158,11,0.3)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.3)]',
  default: 'bg-[var(--neutral-100)] text-[var(--text-muted)]',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] font-mono text-[11px] font-500 tracking-wide uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
