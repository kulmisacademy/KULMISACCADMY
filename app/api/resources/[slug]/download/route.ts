import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { db, resources, resourcePurchases } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const resource = await db.query.resources.findFirst({ where: (r, { eq }) => eq(r.slug, params.slug) });
  if (!resource) return NextResponse.redirect(new URL('/resources', req.url));

  // Paid resources require a logged-in buyer.
  if (!resource.isFree) {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.redirect(new URL(`/sign-in?next=/resources/${resource.slug}`, req.url));
    const purchased = await db.select({ id: resourcePurchases.id }).from(resourcePurchases)
      .where(and(eq(resourcePurchases.userId, userId), eq(resourcePurchases.resourceId, resource.id))).limit(1);
    if (purchased.length === 0) return NextResponse.redirect(new URL(`/resources/${resource.slug}`, req.url));
  }

  // filePath is now a full ImageKit URL (https://...)
  if (resource.filePath) {
    await db.update(resources).set({ downloads: sql`${resources.downloads} + 1` }).where(eq(resources.id, resource.id));
    return NextResponse.redirect(resource.filePath);
  }

  // Fall back to an external link.
  if (resource.fileUrl) {
    await db.update(resources).set({ downloads: sql`${resources.downloads} + 1` }).where(eq(resources.id, resource.id));
    return NextResponse.redirect(resource.fileUrl);
  }

  return NextResponse.redirect(new URL(`/resources/${resource.slug}?missing=1`, req.url));
}
