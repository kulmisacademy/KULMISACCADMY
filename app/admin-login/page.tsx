'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Shield, Eye, EyeOff, KeyRound, Mail, Lock } from 'lucide-react';
import { adminSignInAction } from '@/app/actions/auth';
import { useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        marginTop: 4, height: 46, borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: pending ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #4338CA, #6366F1)',
        color: '#fff', border: 'none', cursor: pending ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
        boxShadow: pending ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
        transition: 'opacity 0.15s',
      }}
    >
      {pending ? (
        <>
          <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          Verifying…
        </>
      ) : (
        <><Shield size={16} /> Secure Sign In</>
      )}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, action] = useFormState(adminSignInAction, {});
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey]   = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #080811 0%, #0D0D1F 50%, #080811 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(99,102,241,0.12), transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Shield badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #4338CA, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px rgba(99,102,241,0.4)', marginBottom: 14,
          }}>
            <Shield size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
            Admin Access
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '6px 0 0', textAlign: 'center' }}>
            Restricted — authorised personnel only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: 32, backdropFilter: 'blur(12px)',
        }}>
          <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input name="email" type="email" required autoComplete="email" placeholder="admin@example.com"
                  style={{ width: '100%', height: 44, paddingLeft: 38, paddingRight: 14, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input name="password" type={showPass ? 'text' : 'password'} required autoComplete="current-password" placeholder="••••••••"
                  style={{ width: '100%', height: 44, paddingLeft: 38, paddingRight: 44, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Admin Secret Key */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Admin Secret Key
              </label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input name="admin_key" type={showKey ? 'text' : 'password'} required autoComplete="off" placeholder="••••••••••••••••"
                  style={{ width: '100%', height: 44, paddingLeft: 38, paddingRight: 44, borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                />
                <button type="button" onClick={() => setShowKey(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2 }}>
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {state.error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Shield size={14} /> {state.error}
              </div>
            )}

            <SubmitButton />
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.18)', marginTop: 20 }}>
          All access attempts are logged and monitored.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.2); }
        input:focus { border-color: rgba(99,102,241,0.6) !important; background: rgba(99,102,241,0.07) !important; }
      `}</style>
    </div>
  );
}
