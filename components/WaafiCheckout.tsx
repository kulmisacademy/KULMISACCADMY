'use client';
import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { X, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PayState } from '@/app/actions/payment';

type Action = (prev: PayState, fd: FormData) => Promise<PayState>;

function PayButton({ amount }: { amount: string }) {
  const { pending } = useFormStatus();
  return (
    <Button variant="mint" size="lg" fullWidth type="submit" loading={pending}>
      {pending ? 'Approve on your phone…' : `Pay ${amount}`}
    </Button>
  );
}

export function WaafiCheckout({
  action, amount, triggerLabel, triggerVariant = 'primary', title,
}: {
  action: Action; amount: string; triggerLabel: string;
  triggerVariant?: 'primary' | 'mint' | 'secondary'; title: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<PayState, FormData>(action, {});

  return (
    <>
      <Button variant={triggerVariant} size="lg" fullWidth onClick={() => setOpen(true)}>{triggerLabel}</Button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setOpen(false)}>
          <div className="w-full max-w-[400px] rounded-2xl p-6 sm:p-7" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-2xl)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-mint)' }}><Smartphone size={18} color="#06222B" /></span>
                <div>
                  <div className="text-[15px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>Pay with WaafiPay</div>
                  <div className="text-[11px] text-[var(--text-muted)]">EVC Plus · WaafiPay Wallet</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-body)]" aria-label="Close"><X size={20} /></button>
            </div>

            <p className="text-[13px] text-[var(--text-muted)] mt-3 mb-4 m-0">{title}</p>

            <form action={formAction} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Mobile money number</span>
                <input
                  name="phone" required inputMode="tel" placeholder="0612345678"
                  className="h-12 px-4 rounded-md text-[15px] outline-none"
                  style={{ background: 'var(--surface-raised)', border: '1.5px solid var(--border-default)', color: 'var(--text-strong)' }}
                />
              </label>

              {state.error && (
                <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                  {state.error}
                </div>
              )}

              <div className="flex items-center justify-between text-[13px] py-1">
                <span className="text-[var(--text-muted)]">Total</span>
                <span className="text-[18px] font-bold text-[var(--text-strong)]" style={{ fontFamily: 'var(--font-display)' }}>{amount}</span>
              </div>

              <PayButton amount={amount} />

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-subtle)]">
                <ShieldCheck size={13} /> Secured by WaafiPay · approve the push on your phone
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
