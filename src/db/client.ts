import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Use process.cwd() for reliable path resolution in Next.js
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'superhero-ttrpg.db');

let sqliteInstance: Database.Database | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function initDb() {
  if (!sqliteInstance) {
    console.log('[Database] Initializing SQLite database at:', dbPath);
    sqliteInstance = new Database(dbPath);
    sqliteInstance.pragma('journal_mode = WAL');
    dbInstance = drizzle(sqliteInstance, { schema });
  }
  return { sqlite: sqliteInstance!, db: dbInstance! };
}

// Lazy-loading proxies - only initialize when actually accessed
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(target, prop) {
    return initDb().db[prop as keyof typeof target];
  }
}) as ReturnType<typeof drizzle<typeof schema>>;

export const sqlite = new Proxy({} as Database.Database, {
  get(target, prop) {
    return initDb().sqlite[prop as keyof Database.Database];
  }
}) as Database.Database;