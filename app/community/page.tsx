import { count, desc, inArray, ne } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, communityPosts } from '@/lib/db/schema';
import { getFeed } from '@/lib/queries';
import { ensureSchema } from '@/lib/db/migrate';
import { CommunityClient } from './CommunityClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Community — Kulmis Academy',
  description: 'Share projects, wins and lessons with the Kulmis learning community.',
};

export default async function CommunityPage() {
  await ensureSchema();
  const user = await getCurrentUser();

  let me = null;
  if (user) {
    const u = await db.query.users.findFirst({ where: (x, { eq }) => eq(x.id, user.id) });
    me = u ? { id: u.id, name: u.name, avatarUrl: u.avatarUrl } : null;
  }

  // Only users who have posted at least once, excluding admins
  const posterRows = await db
    .selectDistinct({ userId: communityPosts.userId })
    .from(communityPosts);

  const posterIds = posterRows.map((r) => r.userId);

  const [posts, memberRows, [{ value: memberCount } = { value: 0 }]] = await Promise.all([
    getFeed(user?.id ?? null),
    posterIds.length > 0
      ? db.select({ id: users.id, name: users.name, headline: users.headline, avatarUrl: users.avatarUrl, plan: users.plan, role: users.role, createdAt: users.createdAt })
          .from(users)
          .where(inArray(users.id, posterIds))
          .orderBy(desc(users.createdAt))
          .limit(100)
      : Promise.resolve([]),
    db.select({ value: count() }).from(users).where(ne(users.role, 'admin')),
  ]);

  // Exclude admins from members list
  const members = memberRows
    .filter((u) => u.role !== 'admin')
    .map((u) => ({
      id: u.id,
      name: u.name,
      headline: u.headline ?? '',
      avatarUrl: u.avatarUrl,
      plan: u.plan,
      role: u.role,
      joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    }));

  return <CommunityClient me={me} posts={posts} memberCount={Number(memberCount)} members={members} />;
}
