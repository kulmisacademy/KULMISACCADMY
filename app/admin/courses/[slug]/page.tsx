import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';
import { getInstructors } from '@/lib/queries';
import { updateCourseAction, deleteCourseAction } from '@/app/actions/admin';
import { CourseForm } from '@/components/admin/CourseForm';
import { LessonsManager } from '@/components/admin/LessonsManager';
import { CourseFilesManager } from '@/components/admin/CourseFilesManager';

export const dynamic = 'force-dynamic';

export default async function EditCoursePage({ params }: { params: { slug: string } }) {
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, params.slug) });
  if (!course) notFound();

  const courseLessons = await db.query.lessons.findMany({
    where: (l, { eq }) => eq(l.courseId, course.id),
    orderBy: (l, { asc }) => asc(l.orderIndex),
  });
  const courseFiles = await db.query.courseResources.findMany({
    where: (r, { eq }) => eq(r.courseId, course.id),
    orderBy: (r, { asc }) => asc(r.orderIndex),
  });
  const instructors = await getInstructors();

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 820, margin: '0 auto' }}>
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline mb-3" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={14} /> Back to courses
          </Link>
          <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight truncate" style={{ fontFamily: 'var(--font-display)' }}>{course.title}</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Edit course details and manage lessons</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/courses/${course.slug}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-semibold no-underline" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-body)' }}>
            <ExternalLink size={14} /> View
          </Link>
          <form action={deleteCourseAction.bind(null, course.slug)}>
            <button type="submit" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-semibold" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171' }}>
              <Trash2 size={14} /> Delete
            </button>
          </form>
        </div>
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <CourseForm
          action={updateCourseAction.bind(null, course.slug)}
          defaults={{
            title: course.title, track: course.track, level: course.level, instructorId: course.instructorId,
            price: course.price, duration: course.duration, hours: course.hours, langs: course.langs, description: course.description,
            learnPoints: course.learnPoints, requirements: course.requirements,
          }}
          instructors={instructors.map((i) => ({ id: i.id, name: i.name }))}
          submitLabel="Save changes"
        />
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <LessonsManager courseSlug={course.slug} lessons={courseLessons.map((l) => ({ id: l.id, section: l.section, title: l.title, duration: l.duration, videoUrl: l.videoUrl, isFree: l.isFree }))} />
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <CourseFilesManager courseSlug={course.slug} files={courseFiles.map((f) => ({ id: f.id, title: f.title, fileLabel: f.fileLabel }))} />
      </div>
    </div>
  );
}
