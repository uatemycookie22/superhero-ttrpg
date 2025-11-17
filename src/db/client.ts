import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Use process.cwd() for reliable path resolution in Next.js
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'superhero-ttrpg.db');

console.log('[Database] Initializing SQLite database at:', dbPath);

// Create SQLite connection
const sqlite = new Database(dbPath);

// Enable WAL mode for better concurrent access
sqlite.pragma('journal_mode = WAL');

// Create Drizzle instance with schema
export const db = drizzle(sqlite, { schema });

// Export the raw sqlite instance for advanced use cases
export { sqlite };