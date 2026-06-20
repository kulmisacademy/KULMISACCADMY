'use server';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { db, users } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '@/lib/auth';

export type AuthState = { error?: string };

/** Only allow same-site relative redirects (open-redirect protection). */
function safeNext(raw: FormDataEntryValue | null): string | null {
  const n = String(raw || '');
  return n.startsWith('/') && !n.startsWith('//') ? n : null;
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!name || !email || !password) return { error: 'All fields are required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: 'An account with this email already exists.' };

  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning({ id: users.id });
  await createSession(user.id);
  redirect(safeNext(formData.get('next')) ?? '/onboarding');
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) return { error: 'Email and password are required.' };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Slow down brute-force attempts
    await new Promise((r) => setTimeout(r, 300));
    return { error: 'Invalid email or password.' };
  }
  await createSession(user.id);
  redirect(safeNext(formData.get('next')) ?? '/dashboard');
}

export async function signOutAction() {
  destroySession();
  redirect('/');
}

/** Admin-only login — requires email + password + ADMIN_KEY env secret. */
export async function adminSignInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email')    || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const key      = String(formData.get('admin_key')|| '');

  if (!email || !password || !key) return { error: 'All three fields are required.' };

  // 1 — verify admin key first (fail fast, no DB hit if key wrong)
  const expectedKey = process.env.ADMIN_KEY ?? '';
  if (!expectedKey || key !== expectedKey) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  // 2 — verify email + password
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  // 3 — verify admin role
  if (user.role !== 'admin') {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  await createSession(user.id);
  redirect('/admin');
}
