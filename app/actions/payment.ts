'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { asc, eq, sql } from 'drizzle-orm';
import { db, courses, lessons, enrollments, users, resources, resourcePurchases, aiPlans, aiUsage, paymentLogs } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { waafiPurchase, normalizePhone } from '@/lib/waafipay';
import { ensureSchema } from '@/lib/db/migrate';

async function logPayment(
  userId: string, reference: string, type: string, targetId: string | null,
  phone: string, amount: number,
  result: Awaited<ReturnType<typeof waafiPurchase>>,
) {
  try {
    await db.insert(paymentLogs).values({
      userId, reference, type, targetId,
      phone: normalizePhone(phone) ?? phone,
      amount,
      status: result.ok ? 'approved' : 'failed',
      transactionId: result.ok ? result.transactionId : null,
      errorMsg: result.ok ? null : result.error,
    }).onConflictDoNothing();
  } catch { /* log failure must never break the payment flow */ }
}

export type PayState = { error?: string };

function ref(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Pay for a paid course with WaafiPay, then enroll and open the first lesson. */
export async function payAndEnrollAction(courseSlug: string, _prev: PayState, formData: FormData): Promise<PayState> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  await ensureSchema();

  const phone = String(formData.get('phone') || '');
  const course = await db.query.courses.findFirst({ where: (c, { eq }) => eq(c.slug, courseSlug) });
  if (!course) return { error: 'Course not found.' };

  const amount = parseFloat(course.price.replace(/[^0-9.]/g, '')) || 0;
  if (amount > 0) {
    const reference = ref('CRS');
    const result = await waafiPurchase({
      phone, amount,
      description: `Kulmis Academy — ${course.title}`,
      reference,
    });
    await logPayment(userId, reference, 'course', course.slug, phone, amount, result);
    if (!result.ok) return { error: result.error };
  }

  const first = await db.query.lessons.findFirst({
    where: (l, { eq }) => eq(l.courseId, course.id),
    orderBy: (l, { asc }) => asc(l.orderIndex),
  });
  await db.insert(enrollments)
    .values({ userId, courseId: course.id, currentLessonId: first?.id ?? null })
    .onConflictDoNothing({ target: [enrollments.userId, enrollments.courseId] });

  revalidatePath('/dashboard');
  redirect(first ? `/learn/${courseSlug}/${first.id}` : '/dashboard');
}

/** Pay for a Pro subscription with WaafiPay, then upgrade the user's plan. */
export async function subscribeProAction(plan: 'monthly' | 'yearly', _prev: PayState, formData: FormData): Promise<PayState> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  await ensureSchema();

  const phone = String(formData.get('phone') || '');
  const amount = plan === 'yearly' ? 149 : 19;
  const reference = ref('PRO');

  const result = await waafiPurchase({
    phone, amount,
    description: `Kulmis Academy Pro — ${plan}`,
    reference,
  });
  await logPayment(userId, reference, 'pro', plan, phone, amount, result);
  if (!result.ok) return { error: result.error };

  await db.update(users).set({ plan: 'pro' }).where(eq(users.id, userId));
  revalidatePath('/dashboard');
  redirect('/dashboard?upgraded=1');
}

/** Pay for a paid resource with WaafiPay, then unlock the download. */
export async function payForResourceAction(resourceSlug: string, _prev: PayState, formData: FormData): Promise<PayState> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  await ensureSchema();

  const phone = String(formData.get('phone') || '');
  const resource = await db.query.resources.findFirst({ where: (r, { eq }) => eq(r.slug, resourceSlug) });
  if (!resource) return { error: 'Resource not found.' };

  if (!resource.isFree) {
    const amount = parseFloat(resource.price.replace(/[^0-9.]/g, '')) || 0;
    const reference = ref('RES');
    const result = await waafiPurchase({
      phone, amount,
      description: `Kulmis Academy — ${resource.title}`,
      reference,
    });
    await logPayment(userId, reference, 'resource', resource.slug, phone, amount, result);
    if (!result.ok) return { error: result.error };
  }

  await db.insert(resourcePurchases)
    .values({ userId, resourceId: resource.id })
    .onConflictDoNothing({ target: [resourcePurchases.userId, resourcePurchases.resourceId] });

  revalidatePath(`/resources/${resourceSlug}`);
  redirect(`/resources/${resourceSlug}?purchased=1`);
}

/** Buy an AI plan with WaafiPay → top up the user's AI credits. */
export async function payAiPlanAction(planSlug: string, _prev: PayState, formData: FormData): Promise<PayState> {
  const userId = await getSessionUserId();
  if (!userId) redirect('/sign-in');
  await ensureSchema();

  const phone = String(formData.get('phone') || '');
  const plan = await db.query.aiPlans.findFirst({ where: (p, { eq }) => eq(p.slug, planSlug) });
  if (!plan || !plan.active) return { error: 'Plan not available.' };

  const amount = parseFloat(plan.price.replace(/[^0-9.]/g, '')) || 0;
  const reference = ref('AI');
  const result = await waafiPurchase({ phone, amount, description: `Kulmis AI — ${plan.name}`, reference });
  await logPayment(userId, reference, 'ai_plan', plan.slug, phone, amount, result);
  if (!result.ok) return { error: result.error };

  // ensure a usage row, then add credits (-1 plan = unlimited)
  await db.insert(aiUsage).values({ userId, credits: 0 }).onConflictDoNothing({ target: aiUsage.userId });
  if (plan.credits === -1) {
    await db.update(aiUsage).set({ credits: -1, updatedAt: new Date() }).where(eq(aiUsage.userId, userId));
  } else {
    await db.update(aiUsage).set({
      credits: sql`CASE WHEN ${aiUsage.credits} = -1 THEN -1 ELSE ${aiUsage.credits} + ${plan.credits} END`,
      updatedAt: new Date(),
    }).where(eq(aiUsage.userId, userId));
  }

  revalidatePath('/ai');
  redirect('/ai?topup=1');
}
