import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);

const REAL_ADMIN_EMAIL = 'kulmisacademyso@gmail.com';

const DEMO_RESOURCE_SLUGS = [
  'vibe-coding-prompt-pack',
  'prompt-engineering-cheatsheet',
  'saas-prd-template',
  'ai-agent-system-prompt',
  'startup-landing-notion',
  'ship-your-first-app-ebook',
];

const DEMO_USER_EMAILS = [
  'fatuma@example.com',
  'admin@kulmis.com',
  'amina@kulmis.com',
  'zahra@example.com',
  'mali@example.com',
  'abdi@example.com',
];

async function main() {
  // Delete demo resources + purchases
  console.log('Deleting demo resources…');
  for (const slug of DEMO_RESOURCE_SLUGS) {
    const [r] = await sql`SELECT id, title FROM resources WHERE slug = ${slug}`;
    if (!r) { console.log(`  skip: ${slug} (not found)`); continue; }
    await sql`DELETE FROM resource_purchases WHERE resource_id = ${r.id}`;
    await sql`DELETE FROM resources WHERE id = ${r.id}`;
    console.log(`  ✅ Deleted resource: ${r.title}`);
  }

  // Delete demo users + all their data
  console.log('\nDeleting demo users…');
  for (const email of DEMO_USER_EMAILS) {
    const [u] = await sql`SELECT id, name FROM users WHERE email = ${email}`;
    if (!u) { console.log(`  skip: ${email} (not found)`); continue; }
    // cascade: enrollments, lesson_progress, bookmarks, certificates, posts, etc.
    await sql`DELETE FROM lesson_progress WHERE user_id = ${u.id}`;
    await sql`DELETE FROM bookmarks WHERE user_id = ${u.id}`;
    await sql`DELETE FROM certificates WHERE user_id = ${u.id}`;
    await sql`DELETE FROM resource_purchases WHERE user_id = ${u.id}`;
    await sql`DELETE FROM enrollments WHERE user_id = ${u.id}`;
    await sql`DELETE FROM community_posts WHERE user_id = ${u.id}`;
    await sql`DELETE FROM users WHERE id = ${u.id}`;
    console.log(`  ✅ Deleted user: ${u.name} (${email})`);
  }

  console.log('\n✅ All demo data removed.');
  console.log(`   Kept: ${REAL_ADMIN_EMAIL} (your admin account)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
