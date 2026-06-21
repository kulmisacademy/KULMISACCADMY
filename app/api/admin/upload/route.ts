import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';
import { uploadToImageKit } from '@/lib/imagekit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'];
const FILE_EXT  = ['zip', 'rar', '7z', 'psd', 'ai', 'pdf', 'fig', 'sketch', 'xd', 'epub', 'docx', 'pptx', 'xlsx', 'txt', 'json', 'csv', 'mp4', 'mp3'];
const MAX = 80 * 1024 * 1024;

function ext(name: string) {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}
function human(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const kind = String(form.get('kind') || 'image');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: 'File too large (max 80 MB).' }, { status: 400 });
  }

  const e = ext(file.name);
  const buf = Buffer.from(await file.arrayBuffer());
  const safeName = `${randomUUID()}.${e}`;

  if (kind === 'image') {
    if (!IMAGE_EXT.includes(e)) {
      return NextResponse.json({ error: `Unsupported image type (.${e}).` }, { status: 400 });
    }
    try {
      const result = await uploadToImageKit(buf, safeName, '/kulmis/images');
      return NextResponse.json({ url: result.url });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
    }
  }

  // Resource file → private folder on ImageKit
  if (!FILE_EXT.includes(e)) {
    return NextResponse.json({ error: `Unsupported file type (.${e}).` }, { status: 400 });
  }
  try {
    const result = await uploadToImageKit(buf, safeName, '/kulmis/files');
    return NextResponse.json({
      path: result.url,        // stored as filePath in DB (full URL)
      name: file.name,
      size: file.size,
      label: `${e.toUpperCase()} · ${human(file.size)}`,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Upload failed' }, { status: 500 });
  }
}
