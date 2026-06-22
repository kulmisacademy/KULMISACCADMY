import 'server-only';
import { and, asc, desc, eq, inArray, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { ensureSchema } from '@/lib/db/migrate';
import {
  courses, instructors, lessons, enrollments, lessonProgress,
  reviews, bookmarks, certificates, users, resources, resourcePurchases,
  aiPlans, aiUsage, communityPosts, postLikes,
} from '@/lib/db/schema';

/* ─────────── Community feed ─────────── */
export type PostView = {
  id: string; text: string; imageUrl: string | null; images: string[]; linkUrl: string | null; time: string;
  author: { id: string; name: string; headline: string; avatarUrl: string | null };
  likes: number; likedByMe: boolean; mine: boolean;
};

function postTime(d: Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function getFeed(viewerId: string | null, opts?: { authorId?: string }): Promise<PostView[]> {
  await ensureSchema();
  const rows = await db.query.communityPosts.findMany({
    where: opts?.authorId ? (p, { eq }) => eq(p.userId, opts.authorId!) : undefined,
    with: { user: true, likes: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit: 100,
  });
  return rows.map((p) => {
    const imgs: string[] = (p.images ?? []).length ? (p.images ?? []) : (p.imageUrl ? [p.imageUrl] : []);
    return {
      id: p.id, text: p.text, imageUrl: imgs[0] ?? p.imageUrl, images: imgs, linkUrl: p.linkUrl, time: postTime(p.createdAt),
      author: { id: p.user.id, name: p.user.name, headline: p.user.headline, avatarUrl: p.user.avatarUrl },
      likes: p.likes.length,
      likedByMe: !!viewerId && p.likes.some((l) => l.userId === viewerId),
      mine: !!viewerId && p.userId === viewerId,
    };
  });
}

export async function getProfile(userId: string) {
  const u = await db.query.users.findFirst({ where: (x, { eq }) => eq(x.id, userId) });
  if (!u) return null;
  const [{ value: postCount } = { value: 0 }] = await db.select({ value: count() }).from(communityPosts).where(eq(communityPosts.userId, userId));
  const enrs = await db.select({ id: enrollments.id }).from(enrollments).where(eq(enrollments.userId, userId));
  return {
    id: u.id, name: u.name, headline: u.headline, bio: u.bio, avatarUrl: u.avatarUrl,
    joined: fmtDate(u.createdAt), posts: Number(postCount), courses: enrs.length, plan: u.plan, role: u.role,
  };
}

/* ─────────── AI Prompt Studio ─────────── */
export const AI_FREE_LIMIT = 5;          // free short-prompt generations
export const AI_LONG_THRESHOLD = 600;    // chars over which a prompt is "long" (always costs a credit)

export type AiStatus = { used: number; freeLeft: number; credits: number; unlimited: boolean; freeLimit: number };

export async function getAiStatus(userId: string): Promise<AiStatus> {
  const row = await db.query.aiUsage.findFirst({ where: (u, { eq }) => eq(u.userId, userId) });
  const used = row?.used ?? 0;
  const credits = row?.credits ?? 0;
  return { used, freeLeft: Math.max(0, AI_FREE_LIMIT - used), credits, unlimited: credits === -1, freeLimit: AI_FREE_LIMIT };
}

export type AiPlanView = { id: string; name: string; price: string; credits: number; description: string };

export async function getAiPlans(): Promise<AiPlanView[]> {
  const rows = await db.select().from(aiPlans).where(eq(aiPlans.active, true)).orderBy(asc(aiPlans.createdAt));
  return rows.map((p) => ({ id: p.slug, name: p.name, price: p.price, credits: p.credits, description: p.description }));
}

export async function getAdminAiPlans() {
  const rows = await db.select().from(aiPlans).orderBy(asc(aiPlans.createdAt));
  return rows.map((p) => ({ id: p.slug, name: p.name, price: p.price, credits: p.credits, description: p.description, active: p.active }));
}

/* ─────────── Resources marketplace ─────────── */
export type ResourceView = {
  id: string; // slug
  title: string; type: string; description: string; highlights: string[];
  price: string; isFree: boolean; imageUrl: string | null; images: string[]; fileLabel: string; downloads: number;
  demoUser: string | null; demoPass: string | null;
};

function toResourceView(r: typeof resources.$inferSelect): ResourceView {
  const images = r.images?.length ? r.images : (r.imageUrl ? [r.imageUrl] : []);
  return {
    id: r.slug, title: r.title, type: r.type, description: r.description, highlights: r.highlights,
    price: r.price, isFree: r.isFree, imageUrl: r.imageUrl ?? images[0] ?? null, images, fileLabel: r.fileLabel, downloads: r.downloads,
    demoUser: r.demoUser ?? null,
    demoPass: r.demoPass ?? null,
  };
}

export async function getAllResources(): Promise<ResourceView[]> {
  await ensureSchema();
  const rows = await db.select().from(resources).orderBy(desc(resources.createdAt));
  return rows.map(toResourceView);
}

export async function getResource(slug: string): Promise<ResourceView | null> {
  await ensureSchema();
  const r = await db.query.resources.findFirst({ where: (x, { eq }) => eq(x.slug, slug) });
  return r ? toResourceView(r) : null;
}

export async function hasPurchasedResource(userId: string, resourceSlug: string): Promise<boolean> {
  const r = await db.query.resources.findFirst({ where: (x, { eq }) => eq(x.slug, resourceSlug) });
  if (!r) return false;
  const p = await db.select({ id: resourcePurchases.id }).from(resourcePurchases)
    .where(and(eq(resourcePurchases.userId, userId), eq(resourcePurchases.resourceId, r.id))).limit(1);
  return p.length > 0;
}

export async function getAdminResources(): Promise<ResourceView[]> {
  return getAllResources();
}

/* UI-friendly course shape (mirrors the old mock `Course`). */
export type CourseView = {
  id: string; // slug
  title: string;
  track: 'vibe-coding' | 'traditional-coding' | 'ai-tools' | 'ai-agents';
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  lessons: number;
  duration: string;
  hours: number;
  rating: number;
  reviews: number;
  price: string;
  langs: string[];
  description: string;
  learnPoints: string[];
  requirements: string[];
  thumbnailUrl: string | null;
  instructor: { name: string; title: string; rating: number; students: number; courses: number; bio: string };
};

function toCourseView(c: typeof courses.$inferSelect, ins?: typeof instructors.$inferSelect | null): CourseView {
  return {
    id: c.slug,
    title: c.title,
    track: c.track,
    level: c.level,
    lessons: c.lessonCount,
    duration: c.duration,
    hours: c.hours,
    rating: c.rating,
    reviews: c.reviewsCount,
    price: c.price,
    langs: c.langs,
    description: c.description,
    learnPoints: c.learnPoints,
    requirements: c.requirements,
    thumbnailUrl: c.thumbnailUrl ?? null,
    instructor: ins
      ? { name: ins.name, title: ins.title, rating: ins.rating, students: ins.students, courses: ins.courseCount, bio: ins.bio }
      : { name: 'Kulmis Instructor', title: 'Instructor', rating: 0, students: 0, courses: 0, bio: '' },
  };
}

/* ─────────── Public catalog ─────────── */
export async function getAllCourses(): Promise<CourseView[]> {
  const rows = await db.query.courses.findMany({
    with: { instructor: true },
    orderBy: (c, { desc }) => desc(c.reviewsCount),
  });
  return rows.map((r) => toCourseView(r, r.instructor));
}

export async function getCourseDetail(slug: string) {
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.slug, slug),
    with: { instructor: true },
  });
  if (!course) return null;

  const courseLessons = await db.query.lessons.findMany({
    where: (l, { eq }) => eq(l.courseId, course.id),
    orderBy: (l, { asc }) => asc(l.orderIndex),
  });

  const courseReviews = await db.query.reviews.findMany({
    where: (r, { eq }) => eq(r.courseId, course.id),
    orderBy: (r, { desc }) => desc(r.createdAt),
  });

  const courseFiles = await db.query.courseResources.findMany({
    where: (r, { eq }) => eq(r.courseId, course.id),
    orderBy: (r, { asc }) => asc(r.orderIndex),
  });

  // group lessons into curriculum sections
  const sections: { section: string; lessons: { id: string; t: string; d: string; free: boolean }[] }[] = [];
  for (const l of courseLessons) {
    let sec = sections.find((s) => s.section === l.section);
    if (!sec) { sec = { section: l.section, lessons: [] }; sections.push(sec); }
    sec.lessons.push({ id: l.id, t: l.title, d: l.duration, free: l.isFree });
  }

  return {
    course: toCourseView(course, course.instructor),
    curriculum: sections,
    reviews: courseReviews.map((r) => ({ name: r.authorName, date: timeAgo(r.createdAt), rating: r.rating, text: r.text })),
    files: courseFiles.map((f) => ({ id: f.id, title: f.title, fileLabel: f.fileLabel })),
  };
}

/* ─────────── Lesson player ─────────── */
export async function getLessonPlayer(courseSlug: string, userId: string | null) {
  const course = await db.query.courses.findFirst({
    where: (c, { eq }) => eq(c.slug, courseSlug),
    with: { instructor: true },
  });
  if (!course) return null;

  const courseLessons = await db.query.lessons.findMany({
    where: (l, { eq }) => eq(l.courseId, course.id),
    orderBy: (l, { asc }) => asc(l.orderIndex),
  });

  let doneIds = new Set<string>();
  let enrollment: typeof enrollments.$inferSelect | undefined;
  if (userId) {
    const lp = await db.select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
    doneIds = new Set(lp.map((r) => r.lessonId));
    enrollment = await db.query.enrollments.findFirst({
      where: (e, { and, eq }) => and(eq(e.userId, userId), eq(e.courseId, course.id)),
    });
  }

  const sections: { section: string; lessons: { id: string; t: string; d: string; videoUrl: string | null; s: 'completed' | 'active' | 'default'; free: boolean }[] }[] = [];
  const currentId = enrollment?.currentLessonId ?? courseLessons[0]?.id;
  for (const l of courseLessons) {
    let sec = sections.find((s) => s.section === l.section);
    if (!sec) { sec = { section: l.section, lessons: [] }; sections.push(sec); }
    sec.lessons.push({
      id: l.id, t: l.title, d: l.duration, videoUrl: l.videoUrl,
      s: doneIds.has(l.id) ? 'completed' : l.id === currentId ? 'active' : 'default',
      free: l.isFree,
    });
  }

  const courseFiles = await db.query.courseResources.findMany({
    where: (r, { eq }) => eq(r.courseId, course.id),
    orderBy: (r, { asc }) => asc(r.orderIndex),
  });

  return {
    course: toCourseView(course, course.instructor),
    sections,
    lessons: courseLessons,
    currentLessonId: currentId,
    enrolled: !!enrollment,
    doneCount: doneIds.size,
    files: courseFiles.map((f) => ({
      id: f.id,
      title: f.title,
      fileLabel: f.fileLabel,
      fileName: f.fileName,
      fileUrl: f.fileUrl,
    })),
  };
}

/* ─────────── Dashboard ─────────── */
export async function getDashboard(userId: string) {
  const enrs = await db.query.enrollments.findMany({
    where: (e, { eq }) => eq(e.userId, userId),
    with: { course: { with: { instructor: true } } },
    orderBy: (e, { desc }) => desc(e.createdAt),
  });

  const enrolledIds = new Set(enrs.map((e) => e.courseId));
  const certs = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.userId, userId));
  const [{ value: doneLessons } = { value: 0 }] = await db
    .select({ value: count() }).from(lessonProgress).where(eq(lessonProgress.userId, userId));

  // recommend courses not yet enrolled
  const all = await getAllCourses();
  const recommended = all.filter((c) => {
    const e = enrs.find((x) => x.course.slug === c.id);
    return !e;
  }).slice(0, 3);

  return {
    enrollments: enrs.map((e) => ({
      course: toCourseView(e.course, e.course.instructor),
      progress: e.progress,
      completed: e.completed,
      completedDate: e.completedAt ? fmtDate(e.completedAt) : undefined,
      currentLessonId: e.currentLessonId,
    })),
    recommended,
    stats: {
      inProgress: enrs.filter((e) => !e.completed).length,
      certificates: certs.length,
      lessonsCompleted: Number(doneLessons),
      hoursWatched: Math.round(enrs.reduce((s, e) => s + (e.course.hours * e.progress) / 100, 0)),
    },
  };
}

export async function getMyCourses(userId: string) {
  const enrs = await db.query.enrollments.findMany({
    where: (e, { eq }) => eq(e.userId, userId),
    with: { course: { with: { instructor: true } } },
  });
  const bms = await db.query.bookmarks.findMany({
    where: (b, { eq }) => eq(b.userId, userId),
    with: { course: { with: { instructor: true } } },
  });
  return {
    inProgress: enrs.filter((e) => !e.completed).map(mapEnr),
    completed: enrs.filter((e) => e.completed).map(mapEnr),
    bookmarked: bms.map((b) => toCourseView(b.course, b.course.instructor)),
  };
}

function mapEnr(e: any) {
  return {
    course: toCourseView(e.course, e.course.instructor),
    progress: e.progress, lesson: 0, completed: e.completed,
    completedDate: e.completedAt ? fmtDate(e.completedAt) : undefined,
  };
}

export async function getCertificates(userId: string) {
  const rows = await db.query.certificates.findMany({
    where: (c, { eq }) => eq(c.userId, userId),
    with: { },
  });
  // join course
  const out = [];
  for (const c of rows) {
    const course = await db.query.courses.findFirst({ where: (x, { eq }) => eq(x.id, c.courseId), with: { instructor: true } });
    if (course) out.push({ course: toCourseView(course, course.instructor), date: fmtDate(c.issuedAt), token: c.token });
  }
  return out;
}

export async function getProgress(userId: string) {
  const enrs = await db.query.enrollments.findMany({
    where: (e, { eq }) => eq(e.userId, userId),
    with: { course: true },
  });
  const certs = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.userId, userId));
  const [{ value: doneLessons } = { value: 0 }] = await db
    .select({ value: count() }).from(lessonProgress).where(eq(lessonProgress.userId, userId));
  return {
    courses: enrs.map((e) => ({ title: e.course.title, progress: e.progress })),
    stats: {
      hours: Math.round(enrs.reduce((s, e) => s + (e.course.hours * e.progress) / 100, 0)),
      lessonsCompleted: Number(doneLessons),
      certificates: certs.length,
    },
  };
}

/* ─────────── Admin ─────────── */
export async function getAdminStats() {
  const [{ value: userCount } = { value: 0 }] = await db.select({ value: count() }).from(users);
  const [{ value: courseCount } = { value: 0 }] = await db.select({ value: count() }).from(courses);
  const [{ value: certCount } = { value: 0 }] = await db.select({ value: count() }).from(certificates);
  return { users: Number(userCount), courses: Number(courseCount), certificates: Number(certCount) };
}

export async function getAdminCourses() {
  return getAllCourses();
}

export async function getAdminUsers() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, plan: u.plan, joined: fmtDate(u.createdAt) }));
}

export async function getInstructors() {
  return db.select().from(instructors);
}

export async function getAnalytics() {
  const enrs = await db.query.enrollments.findMany({ with: { course: true } });
  const allUsers = await db.select({ plan: users.plan, createdAt: users.createdAt }).from(users);

  const byTrack: Record<string, number> = { 'vibe-coding': 0, 'traditional-coding': 0, 'ai-tools': 0, 'ai-agents': 0 };
  let revenue = 0;
  const perCourse: Record<string, { title: string; count: number }> = {};
  for (const e of enrs) {
    byTrack[e.course.track] = (byTrack[e.course.track] ?? 0) + 1;
    if (!e.course.isFree) revenue += parseFloat(e.course.price.replace(/[^0-9.]/g, '')) || 0;
    const k = e.course.id;
    perCourse[k] = { title: e.course.title, count: (perCourse[k]?.count ?? 0) + 1 };
  }

  const proUsers = allUsers.filter((u) => u.plan === 'pro').length;
  const topCourses = Object.values(perCourse).sort((a, b) => b.count - a.count).slice(0, 6);

  // signups in last 6 months
  const now = new Date();
  const months: { label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'short' });
    const count = allUsers.filter((u) => {
      const c = new Date(u.createdAt);
      return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
    }).length;
    months.push({ label, count });
  }

  return {
    totalEnrollments: enrs.length,
    completions: enrs.filter((e) => e.completed).length,
    revenue: Math.round(revenue),
    users: allUsers.length,
    proUsers,
    freeUsers: allUsers.length - proUsers,
    byTrack,
    topCourses,
    months,
  };
}

/* ─────────── Activity feed ─────────── */
export type ActivityItem = { icon: string; text: string; time: string; tone: string };

export async function getActivity(userId: string): Promise<ActivityItem[]> {
  const items: ActivityItem[] = [];

  // Completed lessons
  const lpRows = await db
    .select({ lessonTitle: lessons.title, completedAt: lessonProgress.completedAt })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(eq(lessonProgress.userId, userId))
    .orderBy(desc(lessonProgress.completedAt))
    .limit(8);
  for (const p of lpRows) {
    items.push({ icon: 'check-circle', text: `Completed "${p.lessonTitle}"`, time: timeAgo(p.completedAt), tone: 'mint' });
  }

  // Enrollments
  const enrRows = await db
    .select({ courseTitle: courses.title, enrolledAt: enrollments.createdAt })
    .from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt))
    .limit(5);
  for (const e of enrRows) {
    items.push({ icon: 'book-open', text: `Enrolled in "${e.courseTitle}"`, time: timeAgo(e.enrolledAt), tone: 'purple' });
  }

  // Certificates
  const certRows = await db
    .select({ courseTitle: courses.title, issuedAt: certificates.issuedAt })
    .from(certificates)
    .innerJoin(courses, eq(courses.id, certificates.courseId))
    .where(eq(certificates.userId, userId))
    .orderBy(desc(certificates.issuedAt))
    .limit(5);
  for (const c of certRows) {
    items.push({ icon: 'award', text: `Earned certificate · ${c.courseTitle}`, time: timeAgo(c.issuedAt), tone: 'indigo' });
  }

  return items;
}

/* ─────────── helpers ─────────── */
function fmtDate(d: Date) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function timeAgo(d: Date) {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
