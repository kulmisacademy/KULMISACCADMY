import { getAdminUsers } from '@/lib/queries';
import { AdminUsersClient } from './AdminUsersClient';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsers();
  return <AdminUsersClient users={users} />;
}
