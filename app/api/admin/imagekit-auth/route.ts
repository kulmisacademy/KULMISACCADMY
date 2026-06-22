import { NextResponse } from 'next/server';
import { createHmac, randomUUID } from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY ?? '';
  if (!privateKey) {
    return NextResponse.json({ error: 'ImageKit not configured' }, { status: 500 });
  }

  const token  = randomUUID();
  // ImageKit requires expire < 1 hour from now (strict), not exactly +3600s.
  const expire = Math.floor(Date.now() / 1000) + 1800; // 30 minutes — plenty for an upload
  const signature = createHmac('sha1', privateKey)
    .update(token + String(expire))
    .digest('hex');

  return NextResponse.json({ token, expire, signature });
}
