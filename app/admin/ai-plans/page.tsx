import { getAdminAiPlans } from '@/lib/queries';
import { AdminAiPlansClient } from './AdminAiPlansClient';

export const dynamic = 'force-dynamic';

export default async function AdminAiPlansPage() {
  const plans = await getAdminAiPlans();
  return <AdminAiPlansClient plans={plans} />;
}
