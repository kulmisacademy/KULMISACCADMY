/**
 * Seeds NeonDB with the current course catalog + demo accounts.
 * Run:  npm run db:seed
 *
 * Demo logins (password for all: "password123"):
 *   student → amina@kulmis.com
 *   admin   → admin@kulmis.com
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import bcrypt from 'bcryptjs';
import { db } from './index';
import {
  instructors, courses, lessons, users, enrollments, lessonProgress,
  reviews, bookmarks, certificates,
} from './schema';
import { COURSES, INSTRUCTORS, CURRICULUM, REVIEWS, ENROLLED, BOOKMARKS } from '../data';

// Placeholder lesson video — admins replace these with real YouTube/Vimeo URLs.
const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';

function genSections(count: number) {
  // Spread N lessons across a few named sections.
  const names = ['Introduction', 'Core concepts', 'Building', 'Ship it'];
  const out: { section: string; title: string; duration: string }[] = [];
  let n = 0;
  const per = Math.ceil(count / Math.min(names.length, Math.max(1, Math.ceil(count / 4))));
  for (let i = 0; i < count; i++) {
    const section = names[Math.min(names.length - 1, Math.floor(i / per))];
    out.push({ section, title: `Lesson ${i + 1}`, duration: `${6 + (i % 9)}:${String(10 + (i % 50)).padStart(2, '0')}` });
    n++;
  }
  return out;
}

async function main() {
  console.log('🌱 Seeding Kulmis Academy…');

  // Clear (FK-safe order)
  await db.delete(certificates);
  await db.delete(lessonProgress);
  await db.delete(bookmarks);
  await db.delete(reviews);
  await db.delete(enrollments);
  await db.delete(lessons);
  await db.delete(courses);
  await db.delete(users);
  await db.delete(instructors);

  // Instructors
  const insRows = await db.insert(instructors).values(
    Object.entries(INSTRUCTORS).map(([slug, i]) => ({
      slug, name: i.name, title: i.title, bio: i.bio,
      rating: i.rating, students: i.students, courseCount: i.courses,
    }))
  ).returning();
  const insBySlug = new Map(insRows.map((r) => [r.slug, r.id]));
  const slugForInstructor = (obj: unknown) =>
    Object.entries(INSTRUCTORS).find(([, v]) => v === obj)?.[0] ?? 'amina';
  console.log(`  ✓ ${insRows.length} instructors`);

  // Courses
  const courseRows = await db.insert(courses).values(
    COURSES.map((c) => ({
      slug: c.id, title: c.title, track: c.track, level: c.level,
      instructorId: insBySlug.get(slugForInstructor(c.instructor)) ?? null,
      duration: c.duration, hours: c.hours, rating: c.rating, reviewsCount: c.reviews,
      lessonCount: c.lessons, price: c.price, isFree: c.price === 'Free', langs: c.langs,
      description:
        "This course takes you from zero to shipping a real project. You'll learn by building, with AI assistance every step of the way.",
    }))
  ).returning();
  const courseBySlug = new Map(courseRows.map((r) => [r.slug, r]));
  console.log(`  ✓ ${courseRows.length} courses`);

  // Lessons (real curriculum for vibe-101, generated for the rest)
  for (const c of COURSES) {
    const course = courseBySlug.get(c.id)!;
    let rows: { courseId: string; section: string; title: string; orderIndex: number; duration: string; videoUrl: string; isFree: boolean }[] = [];
    if (c.id === 'vibe-101') {
      let idx = 0;
      for (const sec of CURRICULUM) {
        for (const l of sec.lessons) {
          rows.push({ courseId: course.id, section: sec.section, title: l.t, orderIndex: idx++, duration: l.d, videoUrl: SAMPLE_VIDEO, isFree: !!l.free || idx === 1 });
        }
      }
    } else {
      rows = genSections(c.lessons).map((l, i) => ({
        courseId: course.id, section: l.section, title: l.title, orderIndex: i,
        duration: l.duration, videoUrl: SAMPLE_VIDEO, isFree: i === 0,
      }));
    }
    await db.insert(lessons).values(rows);
  }
  console.log('  ✓ lessons for every course');

  // Reviews on vibe-101
  const vibe = courseBySlug.get('vibe-101')!;
  await db.insert(reviews).values(
    REVIEWS.map((r) => ({ courseId: vibe.id, authorName: r.name, rating: r.rating, text: r.text }))
  );
  console.log(`  ✓ ${REVIEWS.length} reviews`);

  // Users
  const pw = await bcrypt.hash('password123', 10);
  const userRows = await db.insert(users).values([
    { name: 'Amina Yusuf', email: 'amina@kulmis.com', passwordHash: pw, role: 'student', plan: 'free' },
    { name: 'Admin', email: 'admin@kulmis.com', passwordHash: pw, role: 'admin', plan: 'pro' },
    { name: 'Mohamed Ali', email: 'mali@example.com', passwordHash: pw, role: 'student', plan: 'free' },
    { name: 'Fatuma Hassan', email: 'fatuma@example.com', passwordHash: pw, role: 'student', plan: 'pro' },
    { name: 'Abdi Noor', email: 'abdi@example.com', passwordHash: pw, role: 'student', plan: 'free' },
    { name: 'Zahra Warsame', email: 'zahra@example.com', passwordHash: pw, role: 'instructor', plan: 'pro' },
  ]).returning();
  const student = userRows[0];
  console.log(`  ✓ ${userRows.length} users (demo: amina@kulmis.com / admin@kulmis.com — password123)`);

  // Enrollments + lesson progress + certificates for the demo student
  for (const e of ENROLLED) {
    const course = courseBySlug.get(e.id);
    if (!course) continue;
    const courseLessons = await db.query.lessons.findMany({
      where: (l, { eq }) => eq(l.courseId, course.id),
      orderBy: (l, { asc }) => asc(l.orderIndex),
    });
    const current = courseLessons[Math.min(e.lesson, courseLessons.length - 1)];
    await db.insert(enrollments).values({
      userId: student.id, courseId: course.id, progress: e.progress,
      currentLessonId: current?.id ?? null, completed: e.completed,
      completedAt: e.completed ? new Date() : null,
    });
    // mark the first `lesson` lessons complete
    const done = courseLessons.slice(0, e.lesson);
    if (done.length) {
      await db.insert(lessonProgress).values(done.map((l) => ({ userId: student.id, lessonId: l.id })));
    }
    if (e.completed) {
      await db.insert(certificates).values({
        userId: student.id, courseId: course.id,
        token: `KULMIS-${e.id.toUpperCase()}-2026`,
      });
    }
  }
  console.log('  ✓ enrollments, progress & certificates for amina@kulmis.com');

  // Bookmarks
  for (const slug of BOOKMARKS) {
    const course = courseBySlug.get(slug);
    if (course) await db.insert(bookmarks).values({ userId: student.id, courseId: course.id });
  }
  console.log('  ✓ bookmarks');

  console.log('✅ Seed complete.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
