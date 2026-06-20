'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { db, communityPosts, postLikes, postComments, users } from '@/lib/db';
import { getCurrentUser, getSessionUserId } from '@/lib/auth';
import { ensureSchema } from '@/lib/db/migrate';

/* ─── Comment types ─── */
export type CommentView = {
  id: string; content: string; time: string; mine: boolean;
  author: { id: string; name: string; avatarUrl: string | null };
  replies: ReplyView[];
};
export type ReplyView = {
  id: string; content: string; time: string; mine: boolean;
  author: { id: string; name: string; avatarUrl: string | null };
};

function fmtTime(d: Date | string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Load comments for a post ─── */
export async function loadCommentsAction(postId: string): Promise<CommentView[]> {
  await ensureSchema();
  const userId = await getSessionUserId();

  // top-level comments
  const tops = await db.select({
    id: postComments.id, content: postComments.content, createdAt: postComments.createdAt,
    userId: postComments.userId,
    uName: users.name, uAvatar: users.avatarUrl,
  })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(and(eq(postComments.postId, postId), isNull(postComments.parentId)))
    .orderBy(asc(postComments.createdAt));

  // replies
  const reps = await db.select({
    id: postComments.id, content: postComments.content, createdAt: postComments.createdAt,
    parentId: postComments.parentId, userId: postComments.userId,
    uName: users.name, uAvatar: users.avatarUrl,
  })
    .from(postComments)
    .innerJoin(users, eq(postComments.userId, users.id))
    .where(and(eq(postComments.postId, postId)))
    .orderBy(asc(postComments.createdAt));

  const replyMap: Record<string, ReplyView[]> = {};
  for (const r of reps) {
    if (!r.parentId) continue;
    if (!replyMap[r.parentId]) replyMap[r.parentId] = [];
    replyMap[r.parentId].push({
      id: r.id, content: r.content, time: fmtTime(r.createdAt), mine: r.userId === userId,
      author: { id: r.userId, name: r.uName, avatarUrl: r.uAvatar },
    });
  }

  return tops.map((c) => ({
    id: c.id, content: c.content, time: fmtTime(c.createdAt), mine: c.userId === userId,
    author: { id: c.userId, name: c.uName, avatarUrl: c.uAvatar },
    replies: replyMap[c.id] ?? [],
  }));
}

/* ─── Add comment / reply ─── */
export async function addCommentAction(
  postId: string, content: string, parentId?: string,
): Promise<CommentView | ReplyView | { error: string }> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in?next=/community');
  const text = content.trim().slice(0, 1000);
  if (!text) return { error: 'Comment cannot be empty.' };

  await ensureSchema();
  const [row] = await db.insert(postComments)
    .values({ postId, userId, content: text, parentId: parentId ?? null })
    .returning({ id: postComments.id, createdAt: postComments.createdAt });

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, userId) });
  const author = { id: userId, name: user?.name ?? 'You', avatarUrl: user?.avatarUrl ?? null };

  if (parentId) {
    return { id: row.id, content: text, time: 'now', mine: true, author };
  }
  return { id: row.id, content: text, time: 'now', mine: true, author, replies: [] };
}

/* ─── Delete comment ─── */
export async function deleteCommentAction(commentId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const c = await db.query.postComments.findFirst({ where: (x, { eq }) => eq(x.id, commentId) });
  if (!c) return;
  if (c.userId !== user.id && user.role !== 'admin') return;
  await db.delete(postComments).where(eq(postComments.id, commentId));
}

function safeLink(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v.slice(0, 500);
  if (/^[\w-]+\.[\w.-]+/.test(v)) return `https://${v}`.slice(0, 500);
  return null;
}

export async function createPostAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in?next=/community');

  const text = String(formData.get('text') || '').trim().slice(0, 2000);
  const linkUrl = safeLink(String(formData.get('linkUrl') || ''));

  // images: JSON array of uploaded URLs (up to 4)
  let images: string[] = [];
  try { images = JSON.parse(String(formData.get('images') || '[]')); } catch {}
  images = images.filter((u) => typeof u === 'string' && u.startsWith('/')).slice(0, 4);

  const imageUrl = images[0] ?? null;
  if (!text && images.length === 0) return { error: 'Write something or add a photo.' };

  await db.insert(communityPosts).values({ userId, text, imageUrl, images, linkUrl });
  revalidatePath('/community');
  return {};
}

export async function toggleLikeAction(postId: string) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in?next=/community');
  const existing = await db.select({ id: postLikes.id }).from(postLikes)
    .where(and(eq(postLikes.userId, userId), eq(postLikes.postId, postId))).limit(1);
  if (existing.length) await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
  else await db.insert(postLikes).values({ userId, postId }).onConflictDoNothing();
  revalidatePath('/community');
}

export async function deletePostAction(postId: string) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const post = await db.query.communityPosts.findFirst({ where: (p, { eq }) => eq(p.id, postId) });
  if (!post) return;
  if (post.userId !== user.id && user.role !== 'admin') return; // only owner or admin
  await db.delete(communityPosts).where(eq(communityPosts.id, postId));
  revalidatePath('/community');
}

export async function updateProfileAction(_prev: { ok?: boolean; error?: string }, formData: FormData): Promise<{ ok?: boolean; error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  const name = String(formData.get('name') || '').trim();
  if (!name) return { error: 'Name is required.' };
  await db.update(users).set({
    name: name.slice(0, 80),
    headline: String(formData.get('headline') || '').trim().slice(0, 120),
    bio: String(formData.get('bio') || '').trim().slice(0, 600),
    avatarUrl: String(formData.get('avatarUrl') || '').trim() || null,
  }).where(eq(users.id, userId));
  revalidatePath('/dashboard/profile');
  revalidatePath('/community');
  return { ok: true };
}
