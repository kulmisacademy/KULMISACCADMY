import { getAdminResources } from '@/lib/queries';
import { AdminResourcesClient } from './AdminResourcesClient';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const resources = await getAdminResources();
  return <AdminResourcesClient resources={resources} />;
}
