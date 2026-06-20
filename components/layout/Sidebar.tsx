'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BookOpen, TrendingUp, Award, Compass, Sparkles, Zap, X, Users
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { KulmisLogoFull } from '@/components/KulmisLogoFull';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useSidebar } from '@/components/layout/SidebarContext';
import { signOutAction } from '@/app/actions/auth';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'mycourses', label: 'My Courses', icon: BookOpen, href: '/dashboard/courses' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, href: '/dashboard/progress' },
  { id: 'certificates', label: 'Certificates', icon: Award, href: '/dashboard/certificates' },
  { id: 'community', label: 'Community', icon: Users, href: '/community' },
  { id: 'catalog', label: 'Browse Courses', icon: Compass, href: '/courses' },
];

export function Sidebar({ user }: { user?: { name: string; plan: string } }) {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();
  const displayName = user?.name ?? 'Guest';
  const planLabel = user?.plan === 'pro' ? 'Pro plan' : 'Free plan';

  const asideClass =
    'w-[244px] flex-shrink-0 flex flex-col h-full overflow-y-auto z-50 transition-transform duration-200 fixed inset-y-0 left-0 lg:static lg:translate-x-0 ' +
    (open ? 'translate-x-0' : '-translate-x-full');

  const overlayClass =
    'lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ' +
    (open ? 'opacity-100' : 'opacity-0 pointer-events-none');

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={() => setOpen(false)}
        className={overlayClass}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        aria-hidden
      />

      <aside
        className={asideClass}
        style={{
          background: 'var(--surface-card)',
          borderRight: '1px solid var(--border-subtle)',
          padding: '20px 16px',
        }}
      >
        {/* Logo + theme toggle */}
        <div className="flex items-center justify-between px-2 pb-5">
          <Link href="/" className="no-underline" style={{ color: 'var(--text-strong)' }} onClick={() => setOpen(false)}>
            <KulmisLogoFull height={30} />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--neutral-100)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 rounded-lg" style={{ background: 'var(--surface-raised)' }}>
          <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 min-w-0 flex-1 no-underline">
            <Avatar name={displayName} size={36} status="online" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-[var(--text-strong)] truncate">{displayName}</div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">Edit profile →</div>
            </div>
          </Link>
          <form action={signOutAction}>
            <button type="submit" className="w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--neutral-100)]" style={{ color: 'var(--text-muted)' }} aria-label="Sign out" title="Sign out">
              <LogOut size={15} />
            </button>
          </form>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          {NAV.map(({ id, label, icon: Icon, href }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-md text-[13px] font-semibold transition-all duration-150"
                style={{
                  background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                  color: active ? '#818CF8' : 'var(--text-body)',
                  borderLeft: active ? '2.5px solid #6366F1' : '2.5px solid transparent',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* AI Tutor shortcut */}
        <Link
          href="/learn/vibe-101/lesson-4"
          onClick={() => setOpen(false)}
          className="mt-4 flex items-center gap-2.5 px-3.5 py-3 rounded-md text-[13px] font-bold transition-all duration-150"
          style={{
            background: 'var(--cyan-soft)',
            border: '1.5px solid var(--cyan-border)',
            color: 'var(--cyan-400)',
          }}
        >
          <Sparkles size={17} /> AI Tutor
        </Link>

        {/* Upgrade banner */}
        <div
          className="mt-auto rounded-lg p-5 text-white"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <div className="flex items-center gap-2 text-[13px] font-bold mb-1.5">
            <Zap size={15} color="var(--mint-400)" /> Go Pro
          </div>
          <p className="text-[11px] mb-3 leading-relaxed" style={{ color: 'var(--indigo-100)' }}>
            Unlock all courses, unlimited AI Tutor, and certificates.
          </p>
          <Link href="/pricing">
            <Button variant="mint" size="sm" fullWidth>Upgrade</Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
