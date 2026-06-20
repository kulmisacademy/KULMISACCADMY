'use client';
import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NeuralMesh } from '@/components/NeuralMesh';
import { Avatar } from '@/components/ui/Avatar';
import { signInAction, type AuthState } from '@/app/actions/auth';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button variant="primary" size="lg" fullWidth loading={pending} type="submit">Sign in</Button>;
}

function Field({ label, name, type = 'text', placeholder, icon, value, onChange }: {
  label: string; name: string; type?: string; placeholder: string; icon?: React.ReactNode;
  value: string; onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[var(--text-strong)]">{label}</span>
      <span
        className="flex items-center gap-2.5 h-12 px-4 rounded-md transition-all"
        style={{
          background: 'var(--surface-card)',
          border: focus ? '1.5px solid #6366F1' : '1.5px solid var(--border-default)',
          boxShadow: focus ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
        }}
      >
        {icon && <span className="text-[var(--text-subtle)]">{icon}</span>}
        <input
          name={name} type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]"
        />
      </span>
    </label>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [next, setNext] = useState('');
  useEffect(() => { setNext(new URLSearchParams(window.location.search).get('next') || ''); }, []);
  const [state, formAction] = useFormState<AuthState, FormData>(signInAction, {});

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%]">
      {/* Brand panel */}
      <div className="relative overflow-hidden flex-col p-14 hidden lg:flex" style={{ background: '#0A0A0F', color: '#fff' }}>
        <NeuralMesh />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(520px 320px at 18% 0%, rgba(34,211,238,0.10), transparent 70%), radial-gradient(440px 320px at 92% 100%, rgba(99,102,241,0.20), transparent 70%)' }} />
        <Link href="/" className="relative inline-block no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.png" alt="Kulmis Academy" style={{ height: 38, width: 'auto' }} />
        </Link>
        <div className="relative mt-auto">
          <div className="flex gap-1 text-[#10B981] text-xl mb-4">{'★★★★★'}</div>
          <p className="text-[22px] font-bold leading-snug tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            "I built and shipped my first app in a weekend. Best learning experience I've had."
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Avatar name="Hodan Abdi" size={44} />
            <div>
              <div className="font-semibold text-[14px]">Hodan Abdi</div>
              <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Shipped her first app in a weekend</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 min-h-screen" style={{ background: 'var(--surface-subtle)' }}>
        <div className="w-full max-w-[400px] flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Welcome back
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] m-0">Sign in to continue learning</p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <Field label="Email" name="email" type="email" placeholder="you@example.com" icon={<Mail size={17} />} value={email} onChange={setEmail} />
            <div>
              <Field label="Password" name="password" type="password" placeholder="••••••••" icon={<Lock size={17} />} value={password} onChange={setPassword} />
              <a href="#" className="block text-right mt-2 text-[12px] font-semibold no-underline" style={{ color: 'var(--text-link)' }}>Forgot password?</a>
            </div>
            {state.error && (
              <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                {state.error}
              </div>
            )}
            <SubmitButton />
          </form>

          <p className="text-center text-[13px] text-[var(--text-muted)] m-0">
            Don't have an account?{' '}
            <Link href="/sign-up" className="font-bold no-underline" style={{ color: 'var(--text-link)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
