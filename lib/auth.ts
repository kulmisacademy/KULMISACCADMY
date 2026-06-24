import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db, users } from '@/lib/db';
import { userSessions } from '@/lib/db/schema';

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

/** Sign a JWT for the user and set it as an httpOnly cookie.
 *  Also records the session key in DB — invalidates any other device. */
export async function createSession(userId: string) {
  const sessionKey = randomUUID();

  const token = await new SignJWT({ sub: userId, sid: sessionKey })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  // Upsert: one row per user, replaces previous session key → kicks other device
  try {
    await db.insert(userSessions)
      .values({ userId, sessionKey, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: userSessions.userId,
        set: { sessionKey, updatedAt: new Date() },
      });
  } catch { /* ignore — device limit is best-effort if user_sessions table not yet created */ }

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

/** Returns the current logged-in user (without password), or null.
 *  Also enforces 1-device limit by verifying the session key against the DB. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.sub as string;
    const sid    = payload.sid as string | undefined;

    // 1-device check: if the JWT has a session key, verify it matches DB
    if (sid) {
      const row = await db
        .select({ sessionKey: userSessions.sessionKey })
        .from(userSessions)
        .where(eq(userSessions.userId, userId))
        .limit(1)
        .catch(() => [] as { sessionKey: string }[]);

      // If DB has a key but it doesn't match → another device has logged in
      if (row.length > 0 && row[0].sessionKey !== sid) {
        cookies().delete(COOKIE); // clear stale cookie
        return null;
      }
    }

    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role, plan: users.plan })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}
