import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db, courses, enrollments } from '@/lib/db';
import { getCourseDetail } from '@/lib/queries';
import { getSessionUserId } from '@/lib/auth';
import { CourseDetailClient } from './CourseDetailClient';

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const detail = await getCourseDetail(params.slug);
  if (!detail) notFound();

  let enrolled = false;
  const userId = await getSessionUserId();
  if (userId) {
    const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, params.slug) });
    if (course) {
      const e = await db.select({ id: enrollments.id }).from(enrollments)
        .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id))).limit(1);
      enrolled = e.length > 0;
    }
  }

  return <CourseDetailClient detail={detail} enrolled={enrolled} isLoggedIn={!!userId} />;
}
