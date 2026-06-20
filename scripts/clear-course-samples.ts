import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  await sql`UPDATE courses SET learn_points = '{}', requirements = '{}'`;
  const rows = await sql`SELECT slug, title FROM courses`;
  console.log('Cleared learnPoints & requirements for:');
  rows.forEach((r: any) => console.log(' -', r.slug, '|', r.title));
}
main().catch((e) => { console.error(e); process.exit(1); });
