import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, users } from '@/lib/db';

const COOKIE = 'kulmis_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secretKey() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('AUTH_SECRET is not set in .env.local');
  return new TextEncoder().encode(s);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Sign a JWT for the user and set it as an httpOnly cookie. */
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().delete(COOKIE);
}

/** Returns the userId from the session cookie, or null. */
export async function getSessionUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  plan: 'free' | 'pro';
};

/** Returns the current logged-in user (without password), or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  try {
    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    // DB temporarily unreachable (Neon cold-start / timeout) — treat as logged out
    return null;
  }
}
