import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL!);
async function main() {
  const rows = await sql`SELECT slug, title FROM courses ORDER BY slug`;
  console.log('Courses in DB:', rows.length);
  rows.forEach((c: any) => console.log(' -', c.slug, '|', c.title));
}
main();
