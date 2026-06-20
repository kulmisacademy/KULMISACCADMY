import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: 'var(--surface-page)' }}>
        <Sidebar user={{ name: user.name, plan: user.plan }} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
