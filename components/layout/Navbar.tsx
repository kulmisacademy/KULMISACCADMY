'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, ChevronDown, Check, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { KulmisLogoFull } from '@/components/KulmisLogoFull';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar } from '@/components/ui/Avatar';
import { useT } from '@/lib/i18n/context';
import { LANGS, type Lang } from '@/lib/i18n/translations';

type Me = { id: string; name: string; email: string; role: string } | null;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [me, setMe] = useState<Me>(undefined as unknown as Me);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { lang, setLang, t } = useT();

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(setMe).catch(() => setMe(null));
  }, []);

  const currentLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  const NAV_LINKS = [
    { labelKey: 'nav_courses' as const, href: '/courses' },
    { labelKey: 'nav_community' as const, href: '/community' },
    { labelKey: 'nav_resources' as const, href: '/resources' },
    { labelKey: 'nav_ai_studio' as const, href: '/ai' },
    { labelKey: 'nav_pricing' as const, href: '/pricing' },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [langOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    if (!userOpen) return;
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userOpen]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe(null);
    setUserOpen(false);
    window.location.href = '/';
  }

  function chooseLang(code: Lang) {
    setLang(code);
    setLangOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-50 flex items-center gap-6 transition-all duration-200"
      style={{
        padding: '0 clamp(20px, 5vw, 56px)',
        height: 64,
        background: scrolled ? 'var(--chrome-bg-blur)' : 'var(--chrome-bg)',
        backdropFilter: scrolled ? 'saturate(180%) blur(14px)' : 'none',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex-shrink-0 no-underline" style={{ color: 'var(--text-strong)' }}>
        <KulmisLogoFull height={36} className="hidden sm:block" />
        <KulmisLogoFull height={30} className="sm:hidden" />
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 ml-3">
        {NAV_LINKS.map(({ labelKey, href }) => (
          <Link
            key={href}
            href={href}
            className="px-3.5 py-2 rounded-pill text-[13px] font-semibold transition-colors duration-150"
            style={{
              color: pathname === href ? 'var(--purple-400)' : 'var(--text-body)',
              background: pathname === href ? 'var(--purple-50)' : 'transparent',
            }}
            onMouseEnter={e => { if (pathname !== href) (e.target as HTMLElement).style.background = 'var(--neutral-100)'; }}
            onMouseLeave={e => { if (pathname !== href) (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            {t(labelKey)}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">

        {/* Language switcher */}
        <div ref={langRef} className="relative hidden sm:block">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-[12px] font-semibold transition-colors"
            style={{
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)',
              background: langOpen ? 'var(--neutral-100)' : 'transparent',
            }}
          >
            <Globe size={14} /> {currentLang.native} <ChevronDown size={12} style={{ transition: 'transform .15s', transform: langOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {langOpen && (
            <div
              className="absolute top-full mt-2 right-0 rounded-xl overflow-hidden flex flex-col py-1"
              style={{
                minWidth: 160,
                background: 'var(--surface-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 999,
              }}
            >
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => chooseLang(l.code)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium transition-colors text-left w-full"
                  style={{
                    color: lang === l.code ? 'var(--purple-400)' : 'var(--text-body)',
                    background: lang === l.code ? 'var(--purple-50)' : 'transparent',
                    direction: l.rtl ? 'rtl' : 'ltr',
                  }}
                  onMouseEnter={e => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = 'var(--neutral-100)'; }}
                  onMouseLeave={e => { if (lang !== l.code) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span className="font-mono text-[11px] font-bold w-6 text-center flex-shrink-0">{l.native}</span>
                  <span className="flex-1">{l.label}</span>
                  {lang === l.code && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <ThemeToggle />

        {/* Auth area — logged-in shows avatar dropdown, logged-out shows sign-in/up */}
        {me === (undefined as unknown as Me) ? null : me ? (
          <div ref={userRef} className="relative hidden sm:block">
            <button
              onClick={() => setUserOpen(o => !o)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors"
              style={{ background: userOpen ? 'var(--neutral-100)' : 'transparent', border: '1px solid var(--border-subtle)' }}
            >
              <Avatar name={me.name} size={28} />
              <span className="text-[13px] font-semibold text-[var(--text-body)] max-w-[120px] truncate">{me.name}</span>
              <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: userOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }} />
            </button>

            {userOpen && (
              <div className="absolute top-full mt-2 right-0 rounded-xl overflow-hidden flex flex-col py-1"
                style={{ minWidth: 200, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', zIndex: 999 }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="text-[13px] font-semibold text-[var(--text-strong)] truncate">{me.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{me.email}</div>
                </div>
                <Link href="/dashboard" onClick={() => setUserOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[var(--text-body)] hover:bg-[var(--neutral-100)] transition-colors no-underline">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                {me.role === 'admin' && (
                  <Link href="/admin" onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[var(--text-body)] hover:bg-[var(--neutral-100)] transition-colors no-underline">
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--purple-400)' }}>Admin</span>
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium w-full text-left transition-colors"
                  style={{ color: '#F87171', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={14} /> {t('dash_signout')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" size="sm">{t('nav_signin')}</Button>
            </Link>
            <Link href="/sign-up" className="hidden sm:block">
              <Button variant="primary" size="sm">{t('nav_start_free')}</Button>
            </Link>
          </>
        )}
        <button
          className="md:hidden p-2 text-[var(--text-muted)]"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="absolute top-full left-0 right-0 border-t border-[var(--border-subtle)] p-4 flex flex-col gap-2 md:hidden"
          style={{ background: 'var(--chrome-bg)', backdropFilter: 'blur(12px)' }}
        >
          {NAV_LINKS.map(({ labelKey, href }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-3 rounded-lg text-[14px] font-semibold text-[var(--text-body)] hover:bg-[var(--neutral-100)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t(labelKey)}
            </Link>
          ))}

          {/* Language switcher in mobile */}
          <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => { chooseLang(l.code); setMobileOpen(false); }}
                className="flex-1 py-2 rounded-lg text-[12px] font-bold transition-colors"
                style={{
                  color: lang === l.code ? 'var(--purple-400)' : 'var(--text-muted)',
                  background: lang === l.code ? 'var(--purple-50)' : 'var(--neutral-100)',
                  border: lang === l.code ? '1px solid var(--purple-200)' : '1px solid transparent',
                }}
              >
                {l.native}
              </button>
            ))}
          </div>

          {me ? (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: 'var(--surface-raised)' }}>
                <Avatar name={me.name} size={32} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--text-strong)] truncate">{me.name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{me.email}</div>
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant="secondary" size="sm" fullWidth>Dashboard</Button>
              </Link>
              <button onClick={handleLogout} className="w-full py-2 rounded-lg text-[13px] font-semibold border-none cursor-pointer"
                style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                {t('dash_signout')}
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/sign-in" className="flex-1"><Button variant="secondary" size="sm" fullWidth>{t('nav_signin')}</Button></Link>
              <Link href="/sign-up" className="flex-1"><Button variant="primary" size="sm" fullWidth>{t('nav_start_free')}</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
