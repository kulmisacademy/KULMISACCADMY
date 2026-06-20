import { getAdminCourses } from '@/lib/queries';
import { AdminCoursesClient } from './AdminCoursesClient';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses();
  return <AdminCoursesClient courses={courses} />;
}
