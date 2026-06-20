import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { and, eq, sql } from 'drizzle-orm';
import { db, resources, resourcePurchases } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed',
  psd: 'image/vnd.adobe.photoshop', ai: 'application/illustrator', pdf: 'application/pdf',
  epub: 'application/epub+zip', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4', mp3: 'audio/mpeg', txt: 'text/plain', json: 'application/json', csv: 'text/csv',
};

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

  // Stream the privately-stored uploaded file.
  if (resource.filePath) {
    try {
      const base = path.resolve(process.cwd(), 'storage', 'files');
      const filePath = path.resolve(base, resource.filePath);
      // Path traversal guard — resolved path must stay within storage/files/
      if (!filePath.startsWith(base + path.sep) && filePath !== base) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const data = await readFile(filePath);
      const e = resource.filePath.split('.').pop()?.toLowerCase() ?? '';
      const downloadName = resource.fileName || `${resource.slug}.${e}`;
      await db.update(resources).set({ downloads: sql`${resources.downloads} + 1` }).where(eq(resources.id, resource.id));
      return new NextResponse(new Uint8Array(data), {
        headers: {
          'Content-Type': MIME[e] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${downloadName.replace(/"/g, '')}"`,
          'Content-Length': String(data.length),
        },
      });
    } catch {
      return NextResponse.redirect(new URL(`/resources/${resource.slug}?missing=1`, req.url));
    }
  }

  // Fall back to an external link.
  if (resource.fileUrl) {
    await db.update(resources).set({ downloads: sql`${resources.downloads} + 1` }).where(eq(resources.id, resource.id));
    return NextResponse.redirect(resource.fileUrl);
  }

  return NextResponse.redirect(new URL(`/resources/${resource.slug}?missing=1`, req.url));
}
