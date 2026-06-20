/**
 * Usage:  npx tsx scripts/make-admin.ts <email> [password]
 *
 * If the user already exists  → promotes them to admin role.
 * If the user does not exist  → creates a new admin account (password required).
 */
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const [, , email, password] = process.argv;

if (!email) {
  console.error('Usage: npx tsx scripts/make-admin.ts <email> [password]');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const [existing] = await sql`SELECT id, name, role FROM users WHERE email = ${email}`;

  if (existing) {
    await sql`UPDATE users SET role = 'admin' WHERE id = ${existing.id}`;
    console.log(`✅  ${existing.name} (${email}) has been promoted to admin.`);
  } else {
    if (!password) {
      console.error('User not found. Provide a password to create a new admin account.');
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, 10);
    const name = email.split('@')[0];
    await sql`
      INSERT INTO users (name, email, password_hash, role, plan)
      VALUES (${name}, ${email}, ${hash}, 'admin', 'pro')
    `;
    console.log(`✅  Admin account created: ${email}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
