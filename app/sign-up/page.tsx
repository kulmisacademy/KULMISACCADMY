'use client';
import { useState, useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { NeuralMesh } from '@/components/NeuralMesh';
import { Avatar } from '@/components/ui/Avatar';
import { signUpAction, verifyOtpAction, type AuthState } from '@/app/actions/auth';
import { useT } from '@/lib/i18n/context';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <Button variant="primary" size="lg" fullWidth loading={pending} type="submit">{label}</Button>;
}

function Field({ label, name, type = 'text', placeholder, icon, value, onChange }: {
  label: string; name: string; type?: string; placeholder: string; icon?: React.ReactNode;
  value: string; onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[var(--text-strong)]">{label}</span>
      <span className="flex items-center gap-2.5 h-12 px-4 rounded-md transition-all" style={{ background: 'var(--surface-card)', border: focus ? '1.5px solid #6366F1' : '1.5px solid var(--border-default)', boxShadow: focus ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none' }}>
        {icon && <span className="text-[var(--text-subtle)]">{icon}</span>}
        <input name={name} type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          className="flex-1 bg-transparent border-none outline-none text-[14px] text-[var(--text-strong)] placeholder:text-[var(--text-muted)]" />
      </span>
    </label>
  );
}

/* ── OTP digit input ─────────────────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !refs[i].current?.value && i > 0) refs[i - 1].current?.focus();
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const arr = value.padEnd(6, ' ').split('');
    arr[i] = digit || ' ';
    const next = arr.join('').trimEnd();
    onChange(next);
    if (digit && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) { onChange(pasted); refs[Math.min(pasted.length, 5)].current?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-12 h-14 text-center text-[22px] font-bold rounded-xl outline-none transition-all"
          style={{
            background: 'var(--surface-card)',
            border: value[i] ? '2px solid #6366F1' : '2px solid var(--border-default)',
            color: 'var(--text-strong)',
            boxShadow: value[i] ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

/* ── OTP verify form ──────────────────────────────────────────────── */
function VerifyStep({ email, onBack }: { email: string; onBack: () => void }) {
  const { t } = useT();
  const [otp, setOtp] = useState('');
  const [state, formAction] = useFormState<AuthState, FormData>(verifyOtpAction, { step: 'verify', email });

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <ShieldCheck size={26} color="#818CF8" />
        </div>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          {t('auth_otp_title')}
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] m-0">
          {t('auth_otp_sent')} <span className="font-semibold text-[var(--text-body)]">{email}</span>
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="otp" value={otp} />
        <OtpInput value={otp} onChange={setOtp} />

        {state?.error && (
          <div className="text-[13px] px-3.5 py-2.5 rounded-md text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
            {state.error}
          </div>
        )}

        <SubmitButton label={t('auth_otp_verify')} />
      </form>

      <p className="text-center text-[13px] text-[var(--text-muted)] m-0">
        {t('auth_otp_no_code')}{' '}
        <button onClick={onBack} className="font-bold bg-transparent border-none cursor-pointer p-0" style={{ color: 'var(--text-link)' }}>
          {t('auth_otp_resend')}
        </button>
      </p>
    </div>
  );
}

/* ── Main sign-up page ───────────────────────────────────────────── */
export default function SignUpPage() {
  const { t } = useT();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [next, setNext] = useState('');

  useEffect(() => { setNext(new URLSearchParams(window.location.search).get('next') || ''); }, []);

  const [state, formAction] = useFormState<AuthState, FormData>(signUpAction, {});

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ['var(--neutral-200)', '#EF4444', '#F59E0B', '#10B981'];
  const strengthLabels = ['', t('auth_pw_weak'), t('auth_pw_good'), t('auth_pw_strong')];

  const brandPanel = (
    <div className="relative overflow-hidden flex-col p-14 hidden lg:flex" style={{ background: '#0A0A0F', color: '#fff' }}>
      <NeuralMesh />
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(520px 320px at 18% 0%, rgba(34,211,238,0.10), transparent 70%), radial-gradient(440px 320px at 92% 100%, rgba(99,102,241,0.20), transparent 70%)' }} />
      <Link href="/" className="relative inline-block no-underline">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-dark.png" alt="Kulmis Academy" style={{ height: 38, width: 'auto' }} />
      </Link>
      <div className="relative mt-auto">
        <p className="text-[22px] font-bold leading-snug tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          "The AI tutor inside lessons is a game-changer — like having a mentor on call."
        </p>
        <div className="flex items-center gap-3">
          <Avatar name="Yusuf Warsame" size={44} />
          <div>
            <div className="font-semibold text-[14px]">Yusuf Warsame</div>
            <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Mastering ChatGPT & Claude</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (state.step === 'verify' && state.email) {
    return (
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%]">
        {brandPanel}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 min-h-screen" style={{ background: 'var(--surface-subtle)' }}>
          <VerifyStep email={state.email} onBack={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[40%_60%]">
      {brandPanel}

      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 min-h-screen" style={{ background: 'var(--surface-subtle)' }}>
        <div className="w-full max-w-[400px] flex flex-col gap-6">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--text-strong)] m-0 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('auth_signup_title')}
            </h1>
            <p className="text-[14px] text-[var(--text-muted)] m-0">{t('auth_signup_free_note')}</p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="next" value={next} />
            <Field label={t('auth_name')} name="name" placeholder="Amina Yusuf" icon={<User size={17} />} value={name} onChange={setName} />
            <Field label={t('auth_email')} name="email" type="email" placeholder="you@example.com" icon={<Mail size={17} />} value={email} onChange={setEmail} />
            <div>
              <Field label={t('auth_password')} name="password" type="password" placeholder={t('auth_pw_placeholder')} icon={<Lock size={17} />} value={password} onChange={setPassword} />
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ background: i <= strength ? strengthColors[strength] : 'var(--neutral-200)' }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold" style={{ color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5" />
              <span className="text-[12px] text-[var(--text-muted)] leading-relaxed">
                {t('auth_terms_agree')}{' '}
                <a href="#" className="font-semibold no-underline" style={{ color: 'var(--text-link)' }}>{t('auth_terms_tos')}</a>{' '}
                {t('auth_terms_and')}{' '}
                <a href="#" className="font-semibold no-underline" style={{ color: 'var(--text-link)' }}>{t('auth_terms_privacy')}</a>
              </span>
            </label>

            {state.error && (
              <div className="text-[13px] px-3.5 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
                {state.error}
              </div>
            )}
            <SubmitButton label={t('auth_signup_btn')} />
          </form>

          <p className="text-center text-[13px] text-[var(--text-muted)] m-0">
            {t('auth_has_account')}{' '}
            <Link href="/sign-in" className="font-bold no-underline" style={{ color: 'var(--text-link)' }}>{t('auth_signin_link')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
