'use client';
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, BookOpen, Package, Sparkles, Users, BarChart2, Settings, Menu, X } from 'lucide-react';
import { KulmisLogoFull } from '@/components/KulmisLogoFull';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/resources', label: 'Resources', icon: Package },
  { href: '/admin/ai-plans', label: 'AI Plans', icon: Sparkles },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-page)' }}>
      <div
        onClick={() => setOpen(false)}
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        aria-hidden
      />

      <aside
        className={`flex flex-col flex-shrink-0 z-50 transition-transform duration-200 fixed inset-y-0 left-0 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 220, background: 'var(--surface-card)', borderRight: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', height: 64, color: 'var(--text-strong)' }}>
          <div className="flex flex-col items-start justify-center">
            <KulmisLogoFull height={26} />
            <div className="text-[10px] text-[var(--text-subtle)] font-mono uppercase tracking-wide mt-0.5 pl-0.5">Admin panel</div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ color: 'var(--text-muted)' }} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold no-underline transition-colors hover:text-[var(--text-strong)]" style={{ color: 'var(--text-muted)' }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 flex-shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/dashboard" className="text-[12px] font-semibold no-underline" style={{ color: 'var(--text-muted)' }}>← Back to app</Link>
          <ThemeToggle />
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 flex-shrink-0" style={{ height: 56, background: 'var(--chrome-bg-blur)', backdropFilter: 'saturate(180%) blur(10px)', borderBottom: '1px solid var(--border-subtle)' }}>
          <button onClick={() => setOpen(true)} className="w-9 h-9 -ml-1 rounded-md flex items-center justify-center" style={{ color: 'var(--text-body)' }} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <KulmisLogoFull height={24} />
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
