import { getSessionUserId } from '@/lib/auth';
import { PricingClient } from './PricingClient';

export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const userId = await getSessionUserId();
  return <PricingClient isLoggedIn={!!userId} />;
}
