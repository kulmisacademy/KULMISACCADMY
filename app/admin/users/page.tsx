import { getAdminUsers } from '@/lib/queries';
import { db } from '@/lib/db';
import { courses } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const [users, courseRows] = await Promise.all([
    getAdminUsers(),
    db.select({ id: courses.id, title: courses.title, price: courses.price }).from(courses).orderBy(asc(courses.title)),
  ]);
  return <AdminUsersClient users={users} courses={courseRows.map(c => ({ id: c.id, title: c.title, price: c.price }))} />;
}
