'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, ChevronDown } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { WaafiCheckout } from '@/components/WaafiCheckout';
import { subscribeProAction } from '@/app/actions/payment';

const PLANS = [
  {
    name: 'Free', price: { monthly: '$0', yearly: '$0' }, period: 'forever',
    cta: 'Get started free', variant: 'secondary' as const, featured: false,
    features: ['All free courses', 'First lesson of paid courses', 'AI Tutor (10 messages/day)', '3 languages (EN, SO, AR)', 'Community access'],
  },
  {
    name: 'Pro Monthly', price: { monthly: '$19', yearly: '$19' }, period: '/month',
    cta: 'Start Pro', variant: 'primary' as const, featured: true,
    features: ['All 68+ courses', 'Unlimited AI Tutor', 'Certificates of completion', 'All 3 languages', 'Priority support', 'New courses monthly'],
  },
  {
    name: 'Pro Yearly', price: { monthly: '$149', yearly: '$149' }, period: '/year',
    cta: 'Best value', variant: 'mint' as const, featured: false, badge: 'Save 35%',
    features: ['Everything in Pro Monthly', 'Save $79 per year', 'Priority support', 'Early access to new courses', 'Download for offline viewing'],
  },
];

const FAQS = [
  { q: 'Can I buy individual courses?', a: 'Yes — paid courses can be purchased individually. Pro gives you unlimited access to everything.' },
  { q: 'What languages are supported?', a: 'Full UI and subtitles in English, Soomaali (Somali), and العربية (Arabic with RTL support).' },
  { q: 'Is there a refund policy?', a: 'Yes — 30-day money-back guarantee on all paid courses and Pro subscriptions, no questions asked.' },
  { q: 'How do certificates work?', a: 'Complete all lessons in a course and you earn a verifiable certificate. You can share a link or download it.' },
];

export function PricingClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      <section style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16 text-center" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="text-[12px] font-bold uppercase tracking-[0.10em] mb-3" style={{ color: '#818CF8' }}>Pricing</div>
          <h1 className="text-[40px] font-bold text-[var(--text-strong)] m-0 mb-3" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Simple, transparent pricing</h1>
          <p className="text-[17px] text-[var(--text-muted)] m-0 mb-8">Start free. Upgrade when you&apos;re ready.</p>

          <div className="inline-flex items-center gap-0 rounded-pill p-1" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)' }}>
            {(['monthly', 'yearly'] as const).map((b) => (
              <button key={b} onClick={() => setBilling(b)} className="px-5 py-2 rounded-pill text-[13px] font-semibold capitalize cursor-pointer transition-all border-none" style={{ background: billing === b ? '#6366F1' : 'transparent', color: billing === b ? '#fff' : 'var(--text-muted)' }}>
                {b} {b === 'yearly' && <span className="text-[10px] font-mono ml-1" style={{ color: billing === 'yearly' ? '#10B981' : 'var(--text-muted)' }}>save 35%</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--surface-page)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16" style={{ maxWidth: 'var(--container-max)' }}>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {PLANS.map((plan) => (
              <div key={plan.name} className="flex flex-col p-7 rounded-xl" style={{ background: 'var(--surface-card)', border: plan.featured ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)', boxShadow: plan.featured ? 'var(--glow-purple)' : 'var(--shadow-sm)' }}>
                {plan.featured && (
                  <div className="text-center mb-4"><span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill text-[11px] font-bold uppercase font-mono" style={{ background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' }}><Zap size={11} /> Most popular</span></div>
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

                {plan.name === 'Free' ? (
                  <Link href="/sign-up"><Button variant={plan.variant} size="md" fullWidth>{plan.cta}</Button></Link>
                ) : !isLoggedIn ? (
                  <Link href="/sign-up?next=/pricing"><Button variant={plan.variant === 'mint' ? 'mint' : 'primary'} size="md" fullWidth>{plan.cta}</Button></Link>
                ) : (
                  <WaafiCheckout
                    action={subscribeProAction.bind(null, plan.name === 'Pro Yearly' ? 'yearly' : 'monthly')}
                    amount={plan.price[billing]}
                    triggerLabel={plan.cta}
                    triggerVariant={plan.variant === 'mint' ? 'mint' : 'primary'}
                    title={`Upgrade to ${plan.name} — unlock all 68+ courses, unlimited AI Tutor, and certificates.`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--surface-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-16" style={{ maxWidth: 720 }}>
          <h2 className="text-[28px] font-bold text-[var(--text-strong)] text-center mb-10" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>Frequently asked questions</h2>
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
