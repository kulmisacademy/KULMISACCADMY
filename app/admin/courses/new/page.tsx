import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getInstructors } from '@/lib/queries';
import { createCourseAction } from '@/app/actions/admin';
import { CourseForm } from '@/components/admin/CourseForm';

export const dynamic = 'force-dynamic';

export default async function NewCoursePage() {
  const instructors = await getInstructors();

  return (
    <div className="p-4 sm:p-7 flex flex-col gap-6" style={{ maxWidth: 760, margin: '0 auto' }}>
      <div>
        <Link href="/admin/courses" className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline mb-3" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={14} /> Back to courses
        </Link>
        <h1 className="text-[26px] font-bold text-[var(--text-strong)] m-0 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Create course</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1 m-0">Add a new course. You can add lessons after creating it.</p>
      </div>

      <div className="p-6 rounded-lg" style={{ background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
        <CourseForm action={createCourseAction} instructors={instructors.map((i) => ({ id: i.id, name: i.name }))} submitLabel="Create course" />
      </div>
    </div>
  );
}
