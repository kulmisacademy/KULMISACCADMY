'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, eq, count, asc } from 'drizzle-orm';
import { db, courses, lessons, enrollments, lessonProgress, bookmarks } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

async function requireUser() {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  return userId;
}

/** Enroll the current user in a FREE course, then open the first lesson.
 *  Paid courses must go through payAndEnrollAction in payment.ts. */
export async function enrollAction(courseSlug: string) {
  const userId = await requireUser();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) redirect('/courses');

  // Security: block paid-course bypass — enrollment only allowed for free courses
  if (!course.isFree) redirect(`/courses/${courseSlug}?mustpay=1`);

  const first = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.courseId, course.id),
    orderBy: (l, { asc }) => asc(l.orderIndex),
  });

  await db.insert(enrollments)
    .values({ userId, courseId: course.id, currentLessonId: first?.id ?? null })
    .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });

  revalidatePath('/dashboard');
  redirect(first ? `/learn/${courseSlug}/${first.id}` : '/dashboard');
}

export async function toggleBookmarkAction(courseSlug: string) {
  const userId = await requireUser();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) return;

  const existing = await db.select({ id: bookmarks.id }).from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.courseId, course.id))).limit(1);

  if (existing.length) {
    await db.delete(bookmarks).where(eq(bookmarks.id, existing[0].id));
  } else {
    await db.insert(bookmarks).values({ userId, courseId: course.id }).onConflictDoNothing();
  }
  revalidatePath('/dashboard/courses');
}

/** Mark a lesson complete, recompute course progress, advance current lesson. */
export async function completeLessonAction(courseSlug: string, lessonId: string) {
  const userId = await requireUser();
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) return;

  // Security: only enrolled users can mark lessons complete
  const enrollment = await db.select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)))
    .limit(1);
  if (!enrollment.length) return;

  await db.insert(lessonProgress)
    .values({ userId, lessonId })
    .onConflictDoNothing({ target: [lessonProgress.userId, lessonProgress.lessonId] });

  // recompute progress
  const courseLessons = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.courseId, course.id)).orderBy(asc(lessons.orderIndex));
  const total = courseLessons.length || 1;
  const ids = courseLessons.map((l) => l.id);
  const done = ids.length
    ? (await db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress).where(eq(lessonProgress.userId, userId)))
        .filter((r) => ids.includes(r.lessonId)).length
    : 0;
  const progress = Math.round((done / total) * 100);
  const completed = progress >= 100;

  // next lesson
  const currentIdx = courseLessons.findIndex((l) => l.id === lessonId);
  const next = courseLessons[currentIdx + 1]?.id ?? lessonId;

  await db.update(enrollments)
    .set({ progress, completed, completedAt: completed ? new Date() : null, currentLessonId: next })
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id)));

  revalidatePath(`/learn/${courseSlug}`, 'layout');
  revalidatePath('/dashboard');
}
