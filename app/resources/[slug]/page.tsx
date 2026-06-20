import { notFound } from 'next/navigation';
import { getResource, hasPurchasedResource } from '@/lib/queries';
import { getSessionUserId } from '@/lib/auth';
import { ResourceDetailClient } from './ResourceDetailClient';

export const dynamic = 'force-dynamic';

export default async function ResourceDetailPage({ params }: { params: { slug: string } }) {
  const resource = await getResource(params.slug);
  if (!resource) notFound();

  const userId = await getSessionUserId();
  const purchased = userId ? await hasPurchasedResource(userId, params.slug) : false;

  return <ResourceDetailClient resource={resource} isLoggedIn={!!userId} purchased={purchased} />;
}
