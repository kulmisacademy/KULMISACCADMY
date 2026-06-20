import { getAllCourses } from '@/lib/queries';
import { CatalogClient } from './CatalogClient';

export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const courses = await getAllCourses();
  return <CatalogClient courses={courses} />;
}
