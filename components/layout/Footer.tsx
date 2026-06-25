'use client';
import Link from 'next/link';
import { Globe, MessageCircle, AtSign, Sparkles } from 'lucide-react';
import { useT } from '@/lib/i18n/context';

const EMAIL = 'kulmisacademyso@gmail.com';
const WHATSAPP = 'https://wa.me/252613609678';

const SOCIALS = [
  { icon: Globe, href: '/' },
  { icon: Sparkles, href: '/ai' },
  { icon: MessageCircle, href: WHATSAPP },
  { icon: AtSign, href: `mailto:${EMAIL}` },
];

export function Footer() {
  const { t } = useT();

  const COLS = [
    { h: t('footer_tracks'), items: [
      { label: t('track_vibe_title'), href: '/courses?track=vibe-coding' },
      { label: t('track_traditional_title'), href: '/courses?track=traditional-coding' },
      { label: t('track_aitools_title'), href: '/courses?track=ai-tools' },
      { label: t('track_aiagents_title'), href: '/courses?track=ai-agents' },
    ]},
    { h: t('footer_explore'), items: [
      { label: t('footer_all_courses'), href: '/courses' },
      { label: t('nav_community'), href: '/community' },
      { label: t('nav_resources'), href: '/resources' },
      { label: t('nav_ai_studio'), href: '/ai' },
    ]},
    { h: t('footer_support'), items: [
      { label: t('footer_help'), href: WHATSAPP },
      { label: 'Contact: +252 61 360 9678', href: WHATSAPP },
      { label: EMAIL, href: `mailto:${EMAIL}` },
      { label: t('footer_my_dashboard'), href: '/dashboard' },
    ]},
  ];

  return (
    <footer style={{ background: '#13132B', color: '#fff' }}>
      <div
        className="grid gap-8 lg:gap-10 py-12 sm:py-16 px-5 sm:px-8 mx-auto grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
        style={{ maxWidth: 'var(--container-max)' }}
      >
        {/* Brand col */}
        <div className="col-span-2 lg:col-span-1">
          <Link href="/" className="inline-block no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-dark.png" alt="Kulmis Academy" style={{ height: 34, width: 'auto' }} />
          </Link>
          <p className="mt-4 max-w-[280px] text-[13px] leading-relaxed" style={{ color: '#94A3B8', fontFamily: 'var(--font-sans)' }}>
            {t('footer_desc')}
          </p>
          <div className="flex gap-2.5 mt-4">
            {SOCIALS.map(({ icon: Icon, href }, i) => (
              <Link
                key={i}
                href={href}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/15 no-underline"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                aria-label="Kulmis link"
              >
                <Icon size={16} />
              </Link>
            ))}
          </div>
        </div>

        {/* Link cols */}
        {COLS.map((col) => (
          <div key={col.h}>
            <div className="text-[11px] font-bold uppercase tracking-[0.10em] mb-3.5" style={{ color: '#A5B4FC', fontFamily: 'var(--font-sans)' }}>
              {col.h}
            </div>
            {col.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block py-1.5 text-[13px] opacity-85 hover:opacity-100 transition-opacity"
                style={{ color: '#fff', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="mx-auto px-5 sm:px-8 py-5 flex justify-between flex-wrap gap-3 items-center text-[12px]" style={{ maxWidth: 'var(--container-max)', color: '#94A3B8' }}>
          <span>{t('footer_rights')}</span>
          <span className="flex gap-4 items-center">
            <Link href="/pricing" className="hover:text-white transition-colors" style={{ color: 'inherit' }}>{t('nav_pricing')}</Link>
            <Link href={WHATSAPP} className="hover:text-white transition-colors" style={{ color: 'inherit' }}>WhatsApp</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
