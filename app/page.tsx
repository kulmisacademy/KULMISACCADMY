'use client';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, Code2, Wand2, Bot, Check, Zap, MessageSquare, Star, ChevronRight } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NeuralMesh } from '@/components/NeuralMesh';
import { CourseCard } from '@/components/CourseCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TRACK_META } from '@/lib/data';
import { useT } from '@/lib/i18n/context';
import { LANGS } from '@/lib/i18n/translations';
import { useState, useEffect, useRef } from 'react';

const HERO_IMG = 'https://ik.imagekit.io/mstsbs4el8/kulmis-academy/hero.jpg';

function useAnimatedCounter(from: number, to: number, stepMs = 2) {
  const [count, setCount] = useState(from);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    ref.current = setInterval(() => {
      setCount((prev) => {
        if (prev + 10 >= to) { clearInterval(ref.current!); return to; }
        return prev + 10;
      });
    }, stepMs);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [from, to, stepMs]);
  return count;
}
import type { CourseView } from '@/lib/queries';

export default function LandingPage() {
  const { t } = useT();
  const [featured, setFeatured] = useState<CourseView[]>([]);
  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then((all: CourseView[]) => setFeatured(all.slice(0, 3))).catch(() => {});
  }, []);
  const learnerCount = useAnimatedCounter(400, 12400, 2);

  const TRACKS = [
    { track: 'vibe-coding' as const, icon: Sparkles, title: t('track_vibe_title'), desc: t('track_vibe_desc') },
    { track: 'traditional-coding' as const, icon: Code2, title: t('track_traditional_title'), desc: t('track_traditional_desc') },
    { track: 'ai-tools' as const, icon: Wand2, title: t('track_aitools_title'), desc: t('track_aitools_desc') },
    { track: 'ai-agents' as const, icon: Bot, title: t('track_aiagents_title'), desc: t('track_aiagents_desc') },
  ];

  const HOW_STEPS = [
    { icon: Sparkles, title: t('how_1_title'), desc: t('how_1_desc') },
    { icon: Play, title: t('how_2_title'), desc: t('how_2_desc') },
    { icon: MessageSquare, title: t('how_3_title'), desc: t('how_3_desc') },
    { icon: Zap, title: t('how_4_title'), desc: t('how_4_desc') },
  ];

  const TESTIMONIALS = [
    { name: t('test_1_name'), course: t('test_1_course'), text: t('test_1_text'), rating: 5 },
    { name: t('test_2_name'), course: t('test_2_course'), text: t('test_2_text'), rating: 5 },
    { name: t('test_3_name'), course: t('test_3_course'), text: t('test_3_text'), rating: 4 },
  ];

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden" style={{ background: '#0A0A0F', color: '#fff' }}>
        <NeuralMesh />
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(700px 360px at 78% -10%, rgba(34,211,238,0.12), transparent 70%), radial-gradient(620px 380px at 8% 110%, rgba(99,102,241,0.18), transparent 70%)' }} />
        <div className="relative mx-auto grid items-center gap-10 lg:gap-14 grid-cols-1 lg:grid-cols-[1.15fr_0.85fr]"
          style={{ maxWidth: 'var(--container-max)', padding: 'clamp(56px, 8vw, 100px) clamp(20px, 5vw, 56px)' }}>
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-pill border text-[13px] font-semibold mb-5"
              style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'var(--border-on-dark)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              {t('hero_badge')}
            </span>

            <h1 className="font-extrabold text-white leading-[1.1]"
              style={{ margin: '0 0 20px', fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 6vw, 60px)', letterSpacing: '-0.02em' }}>
              <span style={{ display: 'block' }}>
                {t('hero_title_line1')}<span style={{ background: 'linear-gradient(90deg,#6366F1,#22D3EE)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t('hero_title_ai')}</span>.
              </span>
              <span style={{ display: 'block' }}>{t('hero_title_line2')}</span>
              <span style={{ display: 'block' }}>{t('hero_title_line3')}</span>
            </h1>

            <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-[500px]" style={{ color: '#CBD5E1', margin: '0 0 28px' }}>
              {t('hero_subtitle')}
            </p>

            <div className="flex flex-wrap gap-3 mb-7">
              <Link href="/sign-up">
                <Button variant="primary" size="lg" iconRight={<ArrowRight size={18} />}>{t('nav_start_free')}</Button>
              </Link>
              <Link href="/courses">
                <Button variant="secondary" size="lg" iconLeft={<Play size={16} />} className="!text-white !border-white/30 hover:!bg-white/10">
                  {t('hero_cta_secondary')}
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex">
                {['Amina Yusuf', 'Khalid Omar', 'Sara Ali', 'Mo Diriye'].map((name, i) => (
                  <Avatar key={name} name={name} size={34} style={{ marginLeft: i ? -10 : 0, boxShadow: '0 0 0 2px #0B0B12' }} />
                ))}
              </div>
              <span className="text-[13px]" style={{ color: 'var(--indigo-100)' }}>
                <strong className="text-white">{learnerCount.toLocaleString()}+</strong> {t('hero_social')}
              </span>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative rounded-2xl overflow-hidden self-center"
            style={{ boxShadow: '0 0 80px rgba(99,102,241,0.4), var(--shadow-2xl)', border: '1px solid rgba(99,102,241,0.35)' }}>
            {/* 3:2 matches the actual image ratio — no cropping */}
            <div className="relative" style={{ aspectRatio: '3/2', background: '#0A0810' }}>
              <img
                src={HERO_IMG}
                alt="Kulmis Academy — Student coding with AI"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              {/* Gradient overlay at bottom */}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-20"
                style={{ background: 'linear-gradient(to top, rgba(6,4,30,0.85) 0%, transparent 100%)' }} />

              {/* Floating badges */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl"
                  style={{ background: 'rgba(6,4,30,0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0 animate-pulse" style={{ boxShadow: '0 0 6px #10B981' }} />
                  <span className="text-[12px] font-bold text-white tabular-nums">400+ {t('hero_social')}</span>
                </div>
                <Link href="/courses">
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer transition-opacity hover:opacity-90"
                    style={{ background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(129,140,248,0.5)' }}>
                    <Play size={12} fill="#fff" color="#fff" />
                    <span className="text-[12px] font-bold text-white">{t('hero_cta_secondary')}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUST STRIP ─── */}
      <div style={{ background: '#13132B', color: '#fff' }}>
        <div className="mx-auto flex flex-wrap gap-6 justify-between py-5 px-5 sm:px-8" style={{ maxWidth: 'var(--container-max)' }}>
          {[
            ['12,400+', t('trust_learners')],
            ['68', t('trust_courses')],
            ['4', t('trust_tracks')],
            ['3', t('trust_languages')],
          ].map(([n, l]) => (
            <div key={l} className="flex flex-col">
              <span className="text-[24px] font-bold leading-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{n}</span>
              <span className="text-[13px]" style={{ color: '#A5B4FC' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TRACKS ─── */}
      <section id="tracks" style={{ background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 sm:py-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="mb-10">
            <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>{t('tracks_label')}</div>
            <h2 className="text-[32px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('tracks_heading')}</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {TRACKS.map(({ track, icon: Icon, title, desc }) => {
              const meta = TRACK_META[track];
              return (
                <Link key={track} href={`/courses?track=${track}`} className="flex flex-col p-6 rounded-lg border transition-all duration-200 no-underline" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-subtle)' }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = meta.color + '60'; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--border-subtle)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: meta.bg }}>
                    <Icon size={22} color="#fff" />
                  </div>
                  <h3 className="text-[15px] font-bold text-[var(--text-strong)] mb-2 m-0" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                  <p className="text-[13px] text-[var(--text-muted)] leading-relaxed m-0 flex-1">{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-[12px] font-semibold" style={{ color: meta.color }}>
                    {t('track_explore')} <ChevronRight size={13} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── FEATURED COURSES ─── */}
      <section style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 sm:py-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>{t('popular_label')}</div>
              <h2 className="text-[32px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('popular_heading')}</h2>
            </div>
            <Link href="/courses" className="text-[13px] font-semibold text-[var(--text-link)] hover:underline flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              {t('popular_view_all')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {featured.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14, gridColumn: '1/-1' }}>No courses yet — check back soon.</p>
            ) : featured.map(course => (
              <Link key={course.id} href={`/courses/${course.id}`} className="no-underline">
                <CourseCard course={course} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section style={{ background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 sm:py-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-center mb-14">
            <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>{t('how_label')}</div>
            <h2 className="text-[32px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('how_heading')}</h2>
          </div>
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {HOW_STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 relative" style={{ background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.3)' }}>
                  <Icon size={24} color="#818CF8" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#6366F1' }}>{i + 1}</span>
                </div>
                <h3 className="text-[15px] font-bold text-[var(--text-strong)] mb-2 m-0" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed m-0">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI TUTOR HIGHLIGHT ─── */}
      <section style={{ background: '#0A0A0F' }}>
        <div className="mx-auto px-5 sm:px-8 py-20 grid items-center gap-10 lg:gap-16 grid-cols-1 lg:grid-cols-2" style={{ maxWidth: 'var(--container-max)' }}>
          {/* Mockup */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--cyan-border)', boxShadow: 'var(--glow-cyan)' }}>
            <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ background: '#1A1A26', borderBottom: '1px solid var(--border-subtle)', borderLeft: '3px solid #22D3EE' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--gradient-mint)' }}>
                <Sparkles size={14} color="#06222B" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-[var(--text-strong)]">AI Tutor</div>
                <div className="text-[11px]" style={{ color: '#22D3EE' }}>{t('ai_tutor_label')}</div>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-3" style={{ background: 'var(--surface-card)', minHeight: 260 }}>
              <div className="flex gap-3 max-w-[88%]">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--gradient-mint)' }}><Sparkles size={13} color="#06222B" /></div>
                <div className="px-3.5 py-2.5 rounded-lg text-[13px] leading-relaxed text-[var(--text-body)]" style={{ background: 'var(--surface-raised)', borderLeft: '2px solid #22D3EE' }}>
                  {t('ai_tutor_f1')}
                </div>
              </div>
              <div className="flex gap-3 max-w-[88%] ml-auto flex-row-reverse">
                <Avatar name="Amina Yusuf" size={28} />
                <div className="px-3.5 py-2.5 rounded-lg text-[13px] text-white" style={{ background: '#6366F1' }}>
                  {t('ai_tutor_f3')}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--gradient-mint)' }}><Sparkles size={13} color="#06222B" /></div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: '#22D3EE', animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                {[t('how_3_title'), t('ai_tutor_f3'), t('ai_tutor_f4')].map(p => (
                  <button key={p} className="px-3 py-1.5 rounded-pill text-[11px] font-semibold cursor-pointer" style={{ background: 'rgba(34,211,238,0.1)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}>{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: '#22D3EE' }}>{t('ai_tutor_label')}</div>
            <h2 className="text-[36px] font-bold leading-tight tracking-tight mb-4 text-white" style={{ fontFamily: 'var(--font-display)', whiteSpace: 'pre-line' }}>{t('ai_tutor_heading')}</h2>
            <p className="text-[16px] leading-relaxed mb-6" style={{ color: '#CBD5E1' }}>{t('ai_tutor_desc')}</p>
            <div className="flex flex-col gap-3 mb-8">
              {([t('ai_tutor_f1'), t('ai_tutor_f2'), t('ai_tutor_f3'), t('ai_tutor_f4')] as string[]).map(f => (
                <div key={f} className="flex items-center gap-3 text-[13px]" style={{ color: '#CBD5E1' }}>
                  <Check size={16} color="#10B981" className="flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-pill text-[12px] font-semibold" style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.3)' }}>
              <Sparkles size={14} /> {t('ai_tutor_label')}
            </span>
          </div>
        </div>
      </section>

      {/* ─── LANGUAGE SUPPORT ─── */}
      <section style={{ background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 sm:py-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-center mb-12">
            <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>{t('lang_label')}</div>
            <h2 className="text-[32px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('lang_heading')}</h2>
          </div>
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {LANGS.map(lang => (
              <div key={lang.code} className="flex flex-col items-center p-7 rounded-lg text-center gap-3" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                <span className="text-[40px] font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-subtle)' }}>{lang.native}</span>
                <div>
                  <div className="text-[16px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{lang.label}</div>
                </div>
                <div className="text-[12px] text-[var(--text-muted)]">{t('lang_ui')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 sm:py-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-center mb-12">
            <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-2.5" style={{ color: '#818CF8' }}>{t('test_label')}</div>
            <h2 className="text-[32px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('test_heading')}</h2>
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {TESTIMONIALS.map((tm, idx) => (
              <div key={idx} className="p-6 rounded-lg flex flex-col gap-4" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill={i < tm.rating ? '#F59E0B' : 'transparent'} color={i < tm.rating ? '#F59E0B' : 'var(--neutral-300)'} />
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-[var(--text-body)] m-0 flex-1 italic">"{tm.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar name={tm.name} size={36} />
                  <div>
                    <div className="text-[13px] font-semibold text-[var(--text-strong)]">{tm.name}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{tm.course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto px-5 sm:px-8 py-6 pb-20" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="rounded-2xl p-6 sm:p-12 flex flex-col items-center text-center gap-5 text-white" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #818CF8 100%)', boxShadow: 'var(--glow-purple)' }}>
            <h2 className="text-[26px] sm:text-[32px] font-bold m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{t('cta_heading')}</h2>
            <p className="text-[16px] opacity-85 m-0">{t('cta_sub')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/sign-up">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-pill text-[15px] font-semibold bg-white text-[#4F46E5] hover:bg-white/90 transition-colors cursor-pointer border-none">
                  {t('cta_create')}
                </button>
              </Link>
              <Link href="/pricing">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-pill text-[15px] font-semibold bg-transparent text-white border border-white/30 hover:bg-white/10 transition-colors cursor-pointer">
                  {t('cta_pricing')}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
