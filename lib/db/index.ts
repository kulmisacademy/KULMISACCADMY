import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { setDefaultResultOrder } from 'node:dns';
import * as schema from './schema';

// Prefer IPv4: Node's default IPv6-first ordering intermittently times out
// (ETIMEDOUT) reaching Neon's host when the IPv6 route is unreachable.
try { setDefaultResultOrder('ipv4first'); } catch { /* not available on edge */ }

// Retry transient network failures (ETIMEDOUT / "fetch failed" / Neon cold-start).
// Neon free-tier instances pause after inactivity and take up to ~5s to wake up.
neonConfig.fetchFunction = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let lastErr: unknown;
  // delays: 300ms, 800ms, 1500ms, 2500ms, 4000ms — enough for a Neon cold-start
  const delays = [300, 800, 1500, 2500, 4000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const res = await fetch(input, init);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < delays.length) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }
  throw lastErr;
};

type DB = NeonHttpDatabase<typeof schema>;

let _db: DB | null = null;
function getDb(): DB {
  if (_db) return _db;
  const cs = process.env.DATABASE_URL;
  if (!cs) throw new Error('DATABASE_URL is not set. Add your NeonDB connection string to .env.local.');
  _db = drizzle(neon(cs), { schema });
  return _db;
}

// Lazy proxy: importing `db` never connects; the first query triggers the connection.
export const db = new Proxy({} as DB, {
  get(_t, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const v = real[prop];
    return typeof v === 'function' ? (v as (...a: unknown[]) => unknown).bind(real) : v;
  },
});

export * from './schema';
