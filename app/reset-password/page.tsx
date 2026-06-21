'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { resetPasswordAction, type AuthState } from '@/app/actions/auth';

function SubmitBtn() {
  const { pending } = useFormStatus();
  return <Button variant="primary" size="lg" fullWidth loading={pending} type="submit">Set new password</Button>;
}

function ResetForm() {
  const params = useSearchParams();
  const token = params.get('t') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [focus1, setFocus1] = useState(false);
  const [focus2, setFocus2] = useState(false);
  const [state, action] = useFormState<AuthState, FormData>(resetPasswordAction, {});

  const mismatch = confirm.length > 0 && password !== confirm;
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const sColors = ['var(--neutral-200)', '#EF4444', '#F59E0B', '#10B981'];
  const sLabels = ['', 'Weak', 'Good', 'Strong'];

  if (!token) {
    return (
      <div className="text-center flex flex-col gap-4">
        <p className="text-[14px] text-[var(--text-muted)]">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="text-[13px] font-semibold no-underline" style={{ color: 'var(--text-link)' }}>Request new link →</Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      {/* Password */}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--text-strong)]">New password</span>
        <span className="flex items-center gap-2.5 h-12 px-4 rounded-md transition-all"
          style={{ background: 'var(--surface-card)', border: focus1 ? '1.5px solid #6366F1' : '1.5px solid var(--border-default)', boxShadow: focus1 ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
          <span className="text-[var(--text-subtle)]"><Lock size={17} /></span>
          <input name="password" type={show ? 'text' : 'password'} required placeholder="At least 8 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocus1(true)} onBlur={() => setFocus1(false)}
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
          <button type="button" onClick={() => setShow(s => !s)} className="text-[var(--text-subtle)] hover:text-[var(--text-body)]">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </span>
        {password.length > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? sColors[strength] : 'var(--neutral-200)' }} />)}
            </div>
            <span className="text-[11px] font-semibold" style={{ color: sColors[strength] }}>{sLabels[strength]}</span>
          </div>
        )}
      </label>

      {/* Confirm */}
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-semibold text-[var(--text-strong)]">Confirm password</span>
        <span className="flex items-center gap-2.5 h-12 px-4 rounded-md transition-all"
          style={{ background: 'var(--surface-card)', border: focus2 ? '1.5px solid #6366F1' : (mismatch ? '1.5px solid #EF4444' : '1.5px solid var(--border-default)'), boxShadow: focus2 ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
          <span className="text-[var(--text-subtle)]"><Lock size={17} /></span>
          <input type={show ? 'text' : 'password'} placeholder="Repeat password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            onFocus={() => setFocus2(true)} onBlur={() => setFocus2(false)}
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
        </span>
        {mismatch && <span className="text-[12px] text-[#F87171]">Passwords do not match</span>}
      </label>

      {state.error && (
        <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
          {state.error}
        </div>
      )}

      <SubmitBtn />
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--surface-subtle)' }}>
      <div className="w-full max-w-[400px] flex flex-col gap-6">
        <Link href="/sign-in" className="text-[13px] font-semibold no-underline flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Set new password</h1>
          <p className="text-[14px] text-[var(--text-muted)] m-0">Choose a strong password for your account.</p>
        </div>
        <Suspense fallback={<div className="text-[14px] text-[var(--text-muted)]">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
