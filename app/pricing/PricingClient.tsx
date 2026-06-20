'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { WaafiCheckout } from '@/components/WaafiCheckout';
import { subscribeProAction } from '@/app/actions/payment';
import { useT } from '@/lib/i18n/context';

export function PricingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useT();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const PLANS = [
    {
      key: 'free' as const,
      name: t('pricing_plan_free'), price: { monthly: '$0', yearly: '$0' }, period: t('pricing_per_forever'),
      cta: t('pricing_cta_free'), variant: 'secondary' as const, featured: false,
      features: [t('pricing_free_f1'), t('pricing_free_f2'), t('pricing_free_f3'), t('pricing_free_f4'), t('pricing_free_f5')],
    },
    {
      key: 'monthly' as const,
      name: t('pricing_plan_pro_monthly'), price: { monthly: '$19', yearly: '$19' }, period: t('pricing_per_month'),
      cta: t('pricing_cta_start_pro'), variant: 'primary' as const, featured: true,
      features: [t('pricing_pro_f1'), t('pricing_pro_f2'), t('pricing_pro_f3'), t('pricing_pro_f4'), t('pricing_pro_f5'), t('pricing_pro_f6')],
    },
    {
      key: 'yearly' as const,
      name: t('pricing_plan_pro_yearly'), price: { monthly: '$149', yearly: '$149' }, period: t('pricing_per_year'),
      cta: t('pricing_cta_best_value'), variant: 'mint' as const, featured: false, badge: t('pricing_save'),
      features: [t('pricing_year_f1'), t('pricing_year_f2'), t('pricing_year_f3'), t('pricing_year_f4'), t('pricing_year_f5')],
    },
  ];

  const FAQS = [
    { q: t('pricing_faq_1_q'), a: t('pricing_faq_1_a') },
    { q: t('pricing_faq_2_q'), a: t('pricing_faq_2_a') },
    { q: t('pricing_faq_3_q'), a: t('pricing_faq_3_a') },
    { q: t('pricing_faq_4_q'), a: t('pricing_faq_4_a') },
  ];

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      <section style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 text-center" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: '#818CF8' }}>{t('pricing_label')}</div>
          <h1 className="text-[40px] font-bold text-[var(--text-strong)] m-0 mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('pricing_heading')}</h1>
          <p className="text-[17px] text-[var(--text-muted)] m-0 mb-8">{t('pricing_subtitle')}</p>

          <div className="inline-flex items-center gap-0 rounded-pill p-1" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
            {(['monthly', 'yearly'] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} className="px-5 py-2 rounded-pill text-[13px] font-semibold cursor-pointer transition-all border-none" style={{ background: billing === b ? '#6366F1' : 'transparent', color: billing === b ? '#fff' : 'var(--text-muted)' }}>
                {b === 'monthly' ? t('pricing_monthly') : t('pricing_yearly')} {b === 'yearly' && <span className="text-[10px] font-mono ml-1" style={{ color: billing === 'yearly' ? '#10B981' : 'var(--text-muted)' }}>{t('pricing_save')}</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {PLANS.map((plan) => (
              <div key={plan.key} className="flex flex-col p-7 rounded-xl" style={{ background: 'var(--surface-card)', border: plan.featured ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)', boxShadow: plan.featured ? 'var(--glow-purple)' : 'var(--shadow-sm)' }}>
                {plan.featured && (
                  <div className="text-center mb-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-bold uppercase font-mono" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}><Zap size={11} /> {t('pricing_popular')}</span></div>
                )}
                {plan.badge && (
                  <div className="text-center mb-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-bold uppercase font-mono" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}>{plan.badge}</span></div>
                )}

                <div className="mb-1">
                  <div className="text-[14px] font-semibold text-[var(--text-muted)]">{plan.name}</div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-[40px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{plan.price[billing]}</span>
                    <span className="text-[14px] text-[var(--text-muted)]">{plan.period}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 my-6 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-[13px] text-[var(--text-body)]"><Check size={15} color="#10B981" className="mt-0.5 flex-shrink-0" />{f}</div>
                  ))}
                </div>

                {plan.key === 'free' ? (
                  <Link href="/sign-up"><Button variant={plan.variant} size="md" fullWidth>{plan.cta}</Button></Link>
                ) : !isLoggedIn ? (
                  <Link href="/sign-up?next=/pricing"><Button variant={plan.variant === 'mint' ? 'mint' : 'primary'} size="md" fullWidth>{plan.cta}</Button></Link>
                ) : (
                  <WaafiCheckout
                    action={subscribeProAction.bind(null, plan.key === 'yearly' ? 'yearly' : 'monthly')}
                    amount={plan.price[billing]}
                    triggerLabel={plan.cta}
                    triggerVariant={plan.variant === 'mint' ? 'mint' : 'primary'}
                    title={t('pricing_upgrade_title').replace('{plan}', plan.name)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16" style={{ maxWidth: 720 }}>
          <h2 className="text-[28px] font-bold text-[var(--text-strong)] text-center mb-10" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{t('pricing_faq_heading')}</h2>
          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer border-none bg-transparent">
                  <span className="text-[14px] font-semibold text-[var(--text-strong)]">{faq.q}</span>
                  <ChevronDown size={16} color="var(--text-muted)" className="flex-shrink-0 transition-transform" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)' }} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-[13px] text-[var(--text-body)] leading-relaxed" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="pt-3">{faq.a}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
