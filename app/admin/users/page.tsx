import { getAdminUsers, getAllCourses } from '@/lib/queries';
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const [users, courses] = await Promise.all([getAdminUsers(), getAllCourses()]);
  return <AdminUsersClient users={users} courses={courses.map(c => ({ id: c.id, title: c.title, price: c.price }))} />;
}
