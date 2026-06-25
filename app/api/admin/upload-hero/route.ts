import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToImageKit } from '@/lib/imagekit';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const heroPath = join(process.cwd(), 'public', 'hero.jpg');
  if (!existsSync(heroPath)) {
    return NextResponse.json({ error: 'public/hero.jpg not found — save the image there first' }, { status: 404 });
  }

  const buffer = readFileSync(heroPath);
  const result = await uploadToImageKit(buffer, 'hero.jpg', '/kulmis-academy');
  return NextResponse.json({ url: result.url });
}
