import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download, Share2, ExternalLink } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/Button';
import { getCurrentUser } from '@/lib/auth';
import { getCertificates } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export default async function CertificatesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const certs = await getCertificates(user.id);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar title="Certificates" />
      <div className="p-4 sm:p-7" style={{ maxWidth: 980, margin: '0 auto' }}>
        {certs.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-3">
            <span className="text-5xl">🏆</span>
            <div className="text-[18px] font-semibold text-[var(--text-strong)]">No certificates yet</div>
            <div className="text-[14px] text-[var(--text-muted)]">Complete a course to earn your first certificate</div>
            <Link href="/courses"><Button variant="primary" size="sm" className="mt-2">Browse courses</Button></Link>
          </div>
        ) : (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))' }}>
            {certs.map(({ course, date, token }) => (
              <div key={token} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
                <div className="relative p-8 flex flex-col items-center text-center gap-3" style={{ background: 'linear-gradient(135deg, #14132B 0%, #1A1740 55%, #241B52 100%)', minHeight: 220 }}>
                  <div aria-hidden className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(400px 300px at 50% -20%, rgba(99,102,241,0.8), transparent 70%)' }} />
                  <div className="relative">
                    <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#818CF8] mb-2">Certificate of Completion</div>
                    <div className="text-[22px] font-bold text-white leading-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</div>
                    <div className="text-[13px] text-[var(--indigo-100)]">{user.name}</div>
                    <div className="text-[12px] mt-2" style={{ color: 'var(--indigo-200)' }}>{date}</div>
                    <div className="mt-3 px-3 py-1 rounded-pill text-[10px] font-mono text-[#22D3EE]" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.3)' }}>{token}</div>
                  </div>
                </div>
                <div className="p-4 flex gap-2" style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--border-subtle)' }}>
                  <Button variant="secondary" size="sm" iconLeft={<Download size={14} />} className="flex-1">Download</Button>
                  <Button variant="secondary" size="sm" iconLeft={<Share2 size={14} />} className="flex-1">Share</Button>
                  <Button variant="ghost" size="sm" iconLeft={<ExternalLink size={14} />}>Verify</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
