import { neon } from '@neondatabase/serverless';

let _promise: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (_promise) return _promise;
  _promise = (async () => {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`ALTER TABLE community_posts ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}'`;
      await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url text`;
      await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS demo_user text`;
      await sql`ALTER TABLE resources ADD COLUMN IF NOT EXISTS demo_pass text`;
      await sql`
        CREATE TABLE IF NOT EXISTS ai_conversations (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title text NOT NULL DEFAULT 'New conversation',
          mode text NOT NULL DEFAULT 'prompt',
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS post_comments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          parent_id uuid REFERENCES post_comments(id) ON DELETE CASCADE,
          content text NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS ai_messages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
          role text NOT NULL,
          content text NOT NULL,
          tokens integer NOT NULL DEFAULT 0,
          created_at timestamptz NOT NULL DEFAULT now()
        )`;
      // Payment audit log — records every payment attempt (success or failure)
      await sql`
        CREATE TABLE IF NOT EXISTS payment_logs (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          reference text NOT NULL UNIQUE,
          type text NOT NULL,
          target_id text,
          phone text NOT NULL,
          amount real NOT NULL,
          status text NOT NULL DEFAULT 'pending',
          transaction_id text,
          error_msg text,
          created_at timestamptz NOT NULL DEFAULT now()
        )`;
    } catch {
      // column already exists or DB not reachable — queries will surface real errors
    }
  })();
  return _promise;
}
