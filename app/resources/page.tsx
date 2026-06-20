import { getAllResources } from '@/lib/queries';
import { ResourcesClient } from './ResourcesClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resources — Kulmis Academy',
  description: 'PRDs, prompt packs, system prompts, eBooks and Notion kits. Free and premium downloads.',
};

export default async function ResourcesPage() {
  const resources = await getAllResources();
  return <ResourcesClient resources={resources} />;
}
