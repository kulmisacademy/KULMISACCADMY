import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, MessageSquare, CalendarDays } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { getSessionUserId } from '@/lib/auth';
import { getProfile, getFeed } from '@/lib/queries';
import { PostCard, ProfilePic } from '@/app/community/CommunityClient';

export const dynamic = 'force-dynamic';

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const profile = await getProfile(params.id);
  if (!profile) notFound();
  const viewerId = await getSessionUserId();
  const posts = await getFeed(viewerId, { authorId: params.id });
  const viewer = viewerId ? await import('@/lib/queries').then(m => m.getProfile(viewerId)) : null;
  const me = viewer ? { id: viewer.id, name: viewer.name, avatarUrl: viewer.avatarUrl } : null;

  return (
    <div style={{ background: 'var(--surface-page)', minHeight: '100vh' }}>
      <Navbar />

      {/* Profile header */}
      <div style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="mx-auto px-5 sm:px-8 py-10" style={{ maxWidth: 640 }}>
          <div className="flex items-start gap-4">
            <ProfilePic name={profile.name} avatarUrl={profile.avatarUrl} size={84} />
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[24px] font-bold text-[var(--text-strong)] m-0" style={{ fontFamily: 'var(--font-display)' }}>{profile.name}</h1>
                {profile.role === 'admin' && <Badge variant="ai">admin</Badge>}
                {profile.plan === 'pro' && <Badge variant="pro">pro</Badge>}
              </div>
              {profile.headline && <div className="text-[14px] text-[var(--text-body)] mt-0.5">{profile.headline}</div>}
              <div className="flex flex-wrap items-center gap-4 text-[12px] text-[var(--text-muted)] mt-2">
                <span className="flex items-center gap-1.5"><MessageSquare size={13} />{profile.posts} posts</span>
                <span className="flex items-center gap-1.5"><BookOpen size={13} />{profile.courses} courses</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={13} />Joined {profile.joined}</span>
              </div>
            </div>
          </div>
          {profile.bio && <p className="text-[14px] text-[var(--text-body)] leading-relaxed mt-4 mb-0">{profile.bio}</p>}
        </div>
      </div>

      <div className="mx-auto px-5 sm:px-8 py-8 flex flex-col gap-5" style={{ maxWidth: 640 }}>
        <div className="text-[13px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Posts</div>
        {posts.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-muted)] text-[14px]">No posts yet.</div>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} me={me} />)
        )}
        <Link href="/community" className="text-[13px] font-semibold no-underline text-center" style={{ color: 'var(--text-link)' }}>← Back to community</Link>
      </div>

      <Footer />
    </div>
  );
}
