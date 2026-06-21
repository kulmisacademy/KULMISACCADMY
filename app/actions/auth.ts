'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { db, users } from '@/lib/db';
import { hashPassword, verifyPassword, createSession, destroySession } from '@/lib/auth';
import { sendOtpEmail, sendResetEmail } from '@/lib/email';

export type AuthState = { error?: string; step?: 'verify'; email?: string };

function safeNext(raw: FormDataEntryValue | null): string | null {
  const n = String(raw || '');
  return n.startsWith('/') && !n.startsWith('//') ? n : null;
}

/* ── OTP cookie helpers ─────────────────────────────────────────── */
const COOKIE = 'kulmis_pending_reg';
const SECRET = process.env.AUTH_SECRET ?? 'fallback-secret';
const OTP_TTL = 10 * 60 * 1000; // 10 minutes

function signPayload(payload: string): string {
  return createHmac('sha256', SECRET).update(payload).digest('hex');
}

function writePendingCookie(data: {
  name: string; email: string; passwordHash: string; otp: string; next: string;
}) {
  const payload = JSON.stringify({ ...data, exp: Date.now() + OTP_TTL });
  const mac = signPayload(payload);
  cookies().set(COOKIE, `${Buffer.from(payload).toString('base64')}.${mac}`, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/',
  });
}

function readPendingCookie(): {
  name: string; email: string; passwordHash: string; otp: string; next: string; exp: number;
} | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 0) return null;
  const b64 = raw.slice(0, dot);
  const mac = raw.slice(dot + 1);
  const payload = Buffer.from(b64, 'base64').toString('utf8');
  const expected = signPayload(payload);
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  const data = JSON.parse(payload);
  if (Date.now() > data.exp) return null;
  return data;
}

function clearPendingCookie() {
  cookies().delete(COOKIE);
}

/* ── Sign-up step 1: validate + send OTP ───────────────────────── */
export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name     = String(formData.get('name')     || '').trim();
  const email    = String(formData.get('email')    || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const next     = String(formData.get('next')     || '');

  if (!name || !email || !password) return { error: 'All fields are required.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Enter a valid email address.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { error: 'An account with this email already exists.' };

  const passwordHash = await hashPassword(password);
  const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit

  writePendingCookie({ name, email, passwordHash, otp, next });

  try {
    await sendOtpEmail(email, name, otp);
  } catch {
    return { error: 'Failed to send verification email. Please try again.' };
  }

  return { step: 'verify', email };
}

/* ── Sign-up step 2: verify OTP + create account ───────────────── */
export async function verifyOtpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const entered = String(formData.get('otp') || '').replace(/\s/g, '');

  const pending = readPendingCookie();
  if (!pending) return { error: 'Verification code expired. Please start again.', step: undefined };

  if (entered !== pending.otp) return { error: 'Incorrect code. Please try again.', step: 'verify', email: pending.email };

  // Double-check email not taken (race condition guard)
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, pending.email)).limit(1);
  if (existing.length) {
    clearPendingCookie();
    return { error: 'An account with this email already exists.' };
  }

  const [user] = await db.insert(users)
    .values({ name: pending.name, email: pending.email, passwordHash: pending.passwordHash })
    .returning({ id: users.id });

  clearPendingCookie();
  await createSession(user.id);
  redirect(safeNext(pending.next) ?? '/onboarding');
}

/* ── Sign-in ────────────────────────────────────────────────────── */
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email')    || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) return { error: 'Email and password are required.' };

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
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

/* ── Forgot password: send reset link ──────────────────────────── */
export async function forgotPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  if (!email) return { error: 'Enter your email address.' };

  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1);
  // Always show success — don't leak whether email exists
  if (!user) return { step: 'verify' };

  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  const token = await new SignJWT({ sub: email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);

  try {
    await sendResetEmail(email, user.name, token);
  } catch {
    return { error: 'Failed to send email. Please try again.' };
  }

  return { step: 'verify' };
}

/* ── Reset password: verify token + save new password ──────────── */
export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token    = String(formData.get('token')    || '');
  const password = String(formData.get('password') || '');

  if (!token) return { error: 'Invalid or missing reset link.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };

  let email: string;
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    email = String(payload.sub);
  } catch {
    return { error: 'Reset link is invalid or has expired. Please request a new one.' };
  }

  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!user) return { error: 'Account not found.' };

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));

  redirect('/sign-in?reset=1');
}

/* ── Admin login ─────────────────────────────────────────────────── */
export async function adminSignInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email    = String(formData.get('email')    || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const key      = String(formData.get('admin_key')|| '');

  if (!email || !password || !key) return { error: 'All three fields are required.' };

  const expectedKey = process.env.ADMIN_KEY ?? '';
  if (!expectedKey || key !== expectedKey) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  if (user.role !== 'admin') {
    await new Promise((r) => setTimeout(r, 500));
    return { error: 'Access denied.' };
  }

  await createSession(user.id);
  redirect('/admin');
}
