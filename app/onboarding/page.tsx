'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/i18n/context';
import type { Lang } from '@/lib/i18n/translations';

const LANGS: { code: Lang; flag: string; name: string; native: string; dir?: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English', native: 'English' },
  { code: 'so', flag: '🇸🇴', name: 'Somali', native: 'Soomaali' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية', dir: 'rtl' },
];

export default function OnboardingPage() {
  const { t, lang, setLang } = useT();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('');
  const [goals, setGoals] = useState<string[]>([]);

  const LEVELS = [
    { id: 'beginner', emoji: '🌱', title: t('level_beginner'), desc: t('ob_lvl_beg_desc') },
    { id: 'intermediate', emoji: '🔥', title: t('level_intermediate'), desc: t('ob_lvl_int_desc') },
    { id: 'advanced', emoji: '⚡', title: t('level_advanced'), desc: t('ob_lvl_adv_desc') },
  ];
  const GOALS = [t('ob_goal_1'), t('ob_goal_2'), t('ob_goal_3'), t('ob_goal_4'), t('ob_goal_5'), t('ob_goal_6')];
  const STEPS = [t('ob_step_lang'), t('ob_step_exp'), t('ob_step_goals')];

  const toggleGoal = (g: string) => setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ background: 'var(--surface-page)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-brand)' }}>
          <span className="text-white font-bold text-[15px]">K</span>
        </div>
        <span className="font-bold text-[20px] text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>Kulmis Academy</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex justify-between text-[12px] text-[var(--text-muted)] mb-2">
          {STEPS.map((s, i) => (
            <span key={s} className={i <= step ? 'text-[#818CF8] font-semibold' : ''}>{s}</span>
          ))}
        </div>
        <div className="h-1.5 rounded-full bg-[var(--neutral-200)] overflow-hidden">
          <div className="h-full rounded-full bg-[#6366F1] transition-all duration-500" style={{ width: `${((step + 1) / 3) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-2xl p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)' }}>
        {step === 0 && (
          <div>
            <h2 className="text-[24px] font-bold text-[var(--text-strong)] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('ob_lang_q')}
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] mb-6 m-0">{t('ob_lang_sub')}</p>
            <div className="flex flex-col gap-3">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all text-left"
                  style={{
                    background: lang === l.code ? 'rgba(99,102,241,0.08)' : 'var(--surface-raised)',
                    borderColor: lang === l.code ? '#6366F1' : 'var(--border-subtle)',
                  }}
                  dir={l.dir}
                >
                  <span className="text-3xl">{l.flag}</span>
                  <div>
                    <div className="font-bold text-[15px] text-[var(--text-strong)]">{l.name}</div>
                    <div className="text-[12px] text-[var(--text-muted)]">{l.native}</div>
                  </div>
                  {lang === l.code && <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center bg-[#6366F1]"><Check size={12} color="white" /></div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-[24px] font-bold text-[var(--text-strong)] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('ob_exp_q')}
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] mb-6 m-0">{t('ob_exp_sub')}</p>
            <div className="flex flex-col gap-3">
              {LEVELS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all text-left"
                  style={{ background: level === l.id ? 'rgba(99,102,241,0.08)' : 'var(--surface-raised)', borderColor: level === l.id ? '#6366F1' : 'var(--border-subtle)' }}
                >
                  <span className="text-3xl">{l.emoji}</span>
                  <div>
                    <div className="font-bold text-[15px] text-[var(--text-strong)]">{l.title}</div>
                    <div className="text-[12px] text-[var(--text-muted)]">{l.desc}</div>
                  </div>
                  {level === l.id && <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center bg-[#6366F1]"><Check size={12} color="white" /></div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-[24px] font-bold text-[var(--text-strong)] mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('ob_goals_q')}
            </h2>
            <p className="text-[14px] text-[var(--text-muted)] mb-6 m-0">{t('ob_goals_sub')}</p>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map(g => {
                const on = goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all text-left"
                    style={{ background: on ? 'rgba(99,102,241,0.08)' : 'var(--surface-raised)', borderColor: on ? '#6366F1' : 'var(--border-subtle)' }}
                  >
                    <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors" style={{ background: on ? '#6366F1' : 'transparent', borderColor: on ? '#6366F1' : 'var(--border-default)' }}>
                      {on && <Check size={11} color="white" />}
                    </div>
                    <span className="text-[13px] font-medium text-[var(--text-body)]">{g}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {step > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)}>{t('btn_back')}</Button>
          ) : <div />}
          {step < 2 ? (
            <Button variant="primary" size="md" onClick={() => setStep(s => s + 1)}>{t('ob_continue')}</Button>
          ) : (
            <Link href="/dashboard">
              <Button variant="primary" size="md">{t('ob_go_dashboard')}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
