'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Kulmis error]', error);
  }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 12px', fontFamily: 'var(--font-display, sans-serif)' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: '0 0 28px', lineHeight: 1.6 }}>
          The page encountered an error. This is usually a temporary database connection issue — try again in a moment.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={reset}
            style={{ padding: '10px 22px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: '#6366F1', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
          <Link href="/"
            style={{ padding: '10px 22px', borderRadius: 99, fontSize: 14, fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p style={{ marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
