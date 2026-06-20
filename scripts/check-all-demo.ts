import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const resources = await sql`SELECT slug, title FROM resources ORDER BY id`;
  const users = await sql`SELECT name, email, role FROM users ORDER BY id`;
  const aiPlans = await sql`SELECT slug, name FROM ai_plans ORDER BY id`;
  const instructors = await sql`SELECT name FROM instructors ORDER BY id`;

  console.log('\n=== RESOURCES ===', resources.length);
  resources.forEach((r: any) => console.log(' -', r.slug, '|', r.title));

  console.log('\n=== USERS ===', users.length);
  users.forEach((u: any) => console.log(' -', u.email, '|', u.role));

  console.log('\n=== AI PLANS ===', aiPlans.length);
  aiPlans.forEach((p: any) => console.log(' -', p.slug, '|', p.name));

  console.log('\n=== INSTRUCTORS ===', instructors.length);
  instructors.forEach((i: any) => console.log(' -', i.name));
}
main().catch((e) => { console.error(e); process.exit(1); });
