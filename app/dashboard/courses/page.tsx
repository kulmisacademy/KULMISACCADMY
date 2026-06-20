import { redirect } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { getCurrentUser } from '@/lib/auth';
import { getMyCourses } from '@/lib/queries';
import { MyCoursesClient } from './MyCoursesClient';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const data = await getMyCourses(user.id);

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar title="My Courses" />
      <MyCoursesClient inProgress={data.inProgress} completed={data.completed} bookmarked={data.bookmarked} />
    </div>
  );
}
