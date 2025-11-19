export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { db } = await import('./db/client');
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    const path = await import('path');
    
    console.log('[Instrumentation] Running migrations...');
    migrate(db, { migrationsFolder: path.join(process.cwd(), 'src/db/migrations') });
    console.log('[Instrumentation] Migrations complete');
  }
}
