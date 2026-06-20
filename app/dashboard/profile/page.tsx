import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const u = await getCurrentUser();
  if (!u) redirect('/sign-in');
  const user = await db.query.users.findFirst({ where: (x, { eq }) => eq(x.id, u.id) });
  if (!user) redirect('/sign-in');

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar title="Profile" />
      <div className="p-4 sm:p-7" style={{ maxWidth: 680, margin: '0 auto' }}>
        <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[18px] font-bold text-[var(--text-strong)] m-0 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Your profile</h2>
          <p className="text-[13px] text-[var(--text-muted)] m-0 mb-5">This is how you appear across the community.</p>
          <ProfileForm user={{ id: user.id, name: user.name, headline: user.headline, bio: user.bio, avatarUrl: user.avatarUrl }} />
        </div>
      </div>
    </div>
  );
}
