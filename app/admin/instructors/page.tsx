import { TopBar } from '@/components/layout/TopBar';
import { getInstructors } from '@/lib/queries';
import { AdminInstructorsClient } from './AdminInstructorsClient';

export const dynamic = 'force-dynamic';

export default async function AdminInstructorsPage() {
  const instructors = await getInstructors();
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--surface-page)' }}>
      <TopBar title="Instructors" />
      <AdminInstructorsClient instructors={instructors} />
    </div>
  );
}
