import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AdminShell } from '@/components/layout/AdminShell';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Not logged in → dedicated admin login page
  if (!user) redirect('/admin-login');

  // Logged in but not admin → back to their dashboard
  if (user.role !== 'admin') redirect('/dashboard');

  return <AdminShell>{children}</AdminShell>;
}
