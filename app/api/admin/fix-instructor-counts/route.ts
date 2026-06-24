import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { instructors, courses } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';

export async function POST() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allInstructors = await db.select({ id: instructors.id }).from(instructors);
  for (const ins of allInstructors) {
    const [row] = await db.select({ n: count() }).from(courses).where(eq(courses.instructorId, ins.id));
    await db.update(instructors).set({ courseCount: row?.n ?? 0 }).where(eq(instructors.id, ins.id));
  }

  return NextResponse.json({ ok: true, updated: allInstructors.length });
}
