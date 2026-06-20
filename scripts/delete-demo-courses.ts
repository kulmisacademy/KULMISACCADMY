/**
 * Deletes all demo/seed courses (and their lessons, enrollments, reviews, etc.)
 * and demo instructors from the database.
 * Run: npx tsx scripts/delete-demo-courses.ts
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const DEMO_SLUGS = [
  'vibe-101', 'vibe-saas', 'js-zero', 'py-real', 'ai-chat',
  'ai-media', 'agents-101', 'agents-rag', 'git-flow', 'prompt-eng',
  'react-ai', 'data-py',
];

const DEMO_INSTRUCTORS = ['Amina Yusuf', 'Mo Diriye', 'Sara Ali', 'Khalid Omar'];

async function main() {
  console.log('Deleting demo courses…');

  for (const slug of DEMO_SLUGS) {
    const [course] = await sql`SELECT id, title FROM courses WHERE slug = ${slug}`;
    if (!course) { console.log(`  skip: ${slug} (not found)`); continue; }

    // Cascade deletes: lessons → lesson_progress, reviews, enrollments, bookmarks, certificates, course_resources
    await sql`DELETE FROM reviews WHERE course_id = ${course.id}`;
    await sql`DELETE FROM bookmarks WHERE course_id = ${course.id}`;
    await sql`DELETE FROM certificates WHERE course_id = ${course.id}`;
    await sql`DELETE FROM course_resources WHERE course_id = ${course.id}`;

    const courseLessons = await sql`SELECT id FROM lessons WHERE course_id = ${course.id}`;
    for (const l of courseLessons) {
      await sql`DELETE FROM lesson_progress WHERE lesson_id = ${l.id}`;
    }

    const courseEnrollments = await sql`SELECT id FROM enrollments WHERE course_id = ${course.id}`;
    for (const e of courseEnrollments) {
      await sql`DELETE FROM enrollments WHERE id = ${e.id}`;
    }

    await sql`DELETE FROM lessons WHERE course_id = ${course.id}`;
    await sql`DELETE FROM courses WHERE id = ${course.id}`;
    console.log(`  ✅ Deleted: ${course.title}`);
  }

  console.log('\nDeleting demo instructors…');
  for (const name of DEMO_INSTRUCTORS) {
    const [ins] = await sql`SELECT id FROM instructors WHERE name = ${name}`;
    if (!ins) { console.log(`  skip: ${name} (not found)`); continue; }
    await sql`DELETE FROM instructors WHERE id = ${ins.id}`;
    console.log(`  ✅ Deleted instructor: ${name}`);
  }

  console.log('\nDone. Database is clean — ready for real courses.');
}

main().catch((e) => { console.error(e); process.exit(1); });
