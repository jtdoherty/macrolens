import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

declare global {
  var __macrolensDb: DbClient | undefined;
  var __macrolensPool: Pool | undefined;
}

export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

export function getDb(): DbClient {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  if (!globalThis.__macrolensPool) {
    globalThis.__macrolensPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  if (!globalThis.__macrolensDb) {
    globalThis.__macrolensDb = drizzle(globalThis.__macrolensPool, { schema });
  }

  return globalThis.__macrolensDb;
}
