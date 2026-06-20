import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { getSessionUserId } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
const MAX = 12 * 1024 * 1024; // 12 MB

export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No image provided.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'Image too large (max 12 MB).' }, { status: 400 });

  const e = (file.name.split('.').pop() || '').toLowerCase();
  if (!IMAGE_EXT.includes(e)) return NextResponse.json({ error: 'Please upload an image.' }, { status: 400 });

  const dir = path.join(process.cwd(), 'public', 'uploads', 'img');
  await mkdir(dir, { recursive: true });
  const fname = `${randomUUID()}.${e}`;
  await writeFile(path.join(dir, fname), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/img/${fname}` });
}
