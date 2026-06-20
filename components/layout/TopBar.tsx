'use client';
import { Search, Bell, Flame, Menu } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useSidebar } from '@/components/layout/SidebarContext';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const { setOpen } = useSidebar();
  return (
    <header
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-7 flex-shrink-0 sticky top-0 z-30"
      style={{
        height: 68,
        background: 'var(--chrome-bg-blur)',
        backdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden w-9 h-9 -ml-1 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ color: 'var(--text-body)' }}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h1
        className="text-[16px] sm:text-[18px] font-bold text-[var(--text-strong)] m-0 truncate"
        style={{ fontFamily: 'var(--font-display)', letterSpacing: 'var(--tracking-tight)' }}
      >
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-3.5">
        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 h-9 px-3.5 rounded-pill text-[12px] text-[var(--text-subtle)] w-52 cursor-text"
          style={{ background: 'var(--neutral-100)', border: '1px solid var(--border-subtle)' }}
        >
          <Search size={15} />
          <span>Search courses...</span>
        </div>

        {/* Streak */}
        <span
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[12px] font-bold font-mono"
          style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}
        >
          <Flame size={14} /> 7
        </span>

        {/* Notifications */}
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
          style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-card)' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
        </button>

        <Avatar name="Amina Yusuf" size={36} status="online" />
      </div>
    </header>
  );
}
