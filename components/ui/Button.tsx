'use client';
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'mint' | 'ghost' | 'ai' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-[#6366F1] text-white hover:bg-[#4F46E5] shadow-[var(--glow-purple)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.5)]',
  secondary: 'bg-transparent text-[var(--text-strong)] border border-[var(--border-default)] hover:border-[#6366F1] hover:bg-[rgba(99,102,241,0.06)]',
  mint: 'bg-[#10B981] text-white hover:bg-[#059669] shadow-[var(--glow-mint)]',
  ghost: 'bg-transparent text-[var(--text-body)] hover:bg-[var(--neutral-100)]',
  ai: 'bg-[rgba(34,211,238,0.12)] text-[#22D3EE] border border-[rgba(34,211,238,0.3)] hover:bg-[rgba(34,211,238,0.2)]',
  danger: 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.2)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-[13px] gap-1.5',
  md: 'px-5 py-2.5 text-[14px] gap-2',
  lg: 'px-6 py-3 text-[15px] gap-2',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth,
  loading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold rounded-pill
        transition-all duration-200 cursor-pointer select-none
        active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
}
