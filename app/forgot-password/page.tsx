'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { forgotPasswordAction, type AuthState } from '@/app/actions/auth';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <Button variant="primary" size="lg" fullWidth loading={pending} type="submit">Send reset link</Button>;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [state, action] = useFormState<AuthState, FormData>(forgotPasswordAction, {});
  const [focus, setFocus] = useState(false);

  if (state.step === 'verify') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--surface-subtle)' }}>
        <div className="w-full max-w-[400px] text-center flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <CheckCircle2 size={30} color="#10B981" />
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Check your email</h1>
            <p className="text-[14px] text-[var(--text-muted)] m-0 leading-relaxed">
              If an account exists for <strong className="text-[var(--text-body)]">{email}</strong>, we've sent a password reset link. Check your inbox and spam folder.
            </p>
          </div>
          <Link href="/sign-in" className="text-[13px] font-semibold no-underline flex items-center gap-1.5" style={{ color: 'var(--text-link)' }}>
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--surface-subtle)' }}>
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <Link href="/sign-in" className="text-[13px] font-semibold no-underline flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>

        <div>
          <h1 className="text-[28px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Forgot password?</h1>
          <p className="text-[14px] text-[var(--text-muted)] m-0">Enter your email and we'll send you a reset link.</p>
        </div>

        <form action={action} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold text-[var(--text-strong)]">Email</span>
            <span className="flex items-center gap-2.5 h-12 px-4 rounded-md transition-all"
              style={{ background: 'var(--surface-card)', border: focus ? '1.5px solid #6366F1' : '1.5px solid var(--border-default)', boxShadow: focus ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
              <span className="text-[var(--text-subtle)]"><Mail size={17} /></span>
              <input name="email" type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
            </span>
          </label>

          {state.error && (
            <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              {state.error}
            </div>
          )}

          <SubmitBtn />
        </form>
      </div>
    </div>
  );
}
