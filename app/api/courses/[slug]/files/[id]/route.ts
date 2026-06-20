import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { and, eq } from 'drizzle-orm';
import { db, courses, enrollments, courseResources } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed',
  psd: 'image/vnd.adobe.photoshop', ai: 'application/illustrator', pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  mp4: 'video/mp4', mp3: 'audio/mpeg', txt: 'text/plain', json: 'application/json', csv: 'text/csv',
};

export async function GET(req: NextRequest, { params }: { params: { slug: string; id: string } }) {
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, params.slug) });
  if (!course) return NextResponse.redirect(new URL('/courses', req.url));

  // Must be a logged-in, enrolled student.
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.redirect(new URL(`/sign-in?next=/courses/${course.slug}`, req.url));
  const enrolled = await db.select({ id: enrollments.id }).from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, course.id))).limit(1);
  if (enrolled.length === 0) return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));

  const file = await db.query.courseResources.findFirst({ where: (r, { eq }) => eq(r.id, params.id) });
  if (!file || file.courseId !== course.id) return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));

  if (file.filePath) {
    try {
      const base = path.resolve(process.cwd(), 'storage', 'files');
      const filePath = path.resolve(base, file.filePath);
      if (!filePath.startsWith(base + path.sep) && filePath !== base) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
      }
      const data = await readFile(filePath);
      const e = file.filePath.split('.').pop()?.toLowerCase() ?? '';
      const name = file.fileName || `${file.title}.${e}`;
      return new NextResponse(new Uint8Array(data), {
        headers: {
          'Content-Type': MIME[e] || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${name.replace(/"/g, '')}"`,
          'Content-Length': String(data.length),
        },
      });
    } catch {
      return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));
    }
  }
  if (file.fileUrl) return NextResponse.redirect(file.fileUrl);
  return NextResponse.redirect(new URL(`/courses/${course.slug}`, req.url));
}
