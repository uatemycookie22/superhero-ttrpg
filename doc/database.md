# Database

## Overview

This project uses **SQLite** with **Drizzle ORM** for type-safe database operations. The database runs in **WAL (Write-Ahead Logging) mode** for better concurrency.

## Setup

### SQLite Configuration

**Location**: `src/db/client.ts`

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const dbPath = process.env.DATABASE_PATH || 
  path.join(process.cwd(), 'data', 'superhero-ttrpg.db');

const sqliteInstance = new Database(dbPath);
sqliteInstance.pragma('journal_mode = WAL');
const db = drizzle(sqliteInstance, { schema });
```

**Key Features:**
- **Driver**: `better-sqlite3` (synchronous, faster than async drivers)
- **WAL Mode**: Allows simultaneous reads during writes
- **Lazy Loading**: Proxy pattern prevents database access during Next.js build

> [!IMPORTANT]
> The database file is automatically created if it doesn't exist. No manual setup required.

---

## Schema Definition

**Location**: `src/db/schema.ts`

Define tables using Drizzle's schema builder:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  attributes: text('attributes', { mode: 'json' }).$type<{
    stats?: Record<string, number>;
    abilities?: Array<{ name: string; description: string }>;
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }),
});
```

**Column Types:**
- `text()` - String values
- `integer()` - Numbers and timestamps
- `integer({ mode: 'boolean' })` - Boolean values (0/1)
- `integer({ mode: 'timestamp' })` - JavaScript Date objects
- `text({ mode: 'json' })` - JSON objects with TypeScript types

---

## Database Management Scripts

```bash
# Generate migration files from schema changes
npm run db:generate

# Push schema changes directly to database (no migration files)
npm run db:push

# Generate + push (combined)
npm run db:migrate

# Open Drizzle Studio (database GUI at http://localhost:4983)
npm run db:studio
```

**Script Definitions** (`package.json`):
```json
{
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "db:migrate": "drizzle-kit generate && drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```

---

## Migrations

### Location

- **Migration Files**: `src/db/migrations/*.sql`
- **Metadata**: `src/db/migrations/meta/`

### Automatic Execution

Migrations run automatically on server startup via `src/instrumentation.ts`:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { db } = await import('./db/client');
    const { migrate } = await import('drizzle-orm/better-sqlite3/migrator');
    
    migrate(db, { 
      migrationsFolder: path.join(process.cwd(), 'src/db/migrations') 
    });
  }
}
```

> [!NOTE]
> Migrations run before the app serves requests. No manual execution needed.

### Creating Migrations

#### Step 1: Modify Schema

Edit `src/db/schema.ts`:

```typescript
export const characters = sqliteTable('characters', {
  // ... existing columns
  level: integer('level').notNull().default(1), // NEW COLUMN
});
```

#### Step 2: Generate Migration

```bash
npm run db:generate
```

This creates:
- `src/db/migrations/0002_add_level_column.sql`
- `src/db/migrations/meta/0002_snapshot.json`
- Updates `src/db/migrations/meta/_journal.json`

#### Step 3: Review Generated SQL

```sql
ALTER TABLE `characters` ADD COLUMN `level` integer DEFAULT 1 NOT NULL;
```

#### Step 4: Apply Migration

**Development:**
```bash
npm run dev  # Migrations run automatically on startup
```

**Production:**
```bash
# Rebuild Docker image (migrations included)
docker build -t superhero-ttrpg .
docker run -d -p 3000:3000 -v /data:/app/data superhero-ttrpg
```

> [!CAUTION]
> Multiple SQL statements in one migration file must be separated with `--> statement-breakpoint`:
> ```sql
> ALTER TABLE `characters` ADD COLUMN `level` integer;--> statement-breakpoint
> UPDATE `characters` SET `level` = 1 WHERE `level` IS NULL;
> ```

### Migration Examples

#### Add Column with Default Value

```sql
ALTER TABLE `characters` ADD COLUMN `experience` integer DEFAULT 0 NOT NULL;
```

#### Add Nullable Column

```sql
ALTER TABLE `characters` ADD COLUMN `notes` text;
```

#### Add Column + Backfill Data

```sql
ALTER TABLE `characters` ADD COLUMN `last_played` integer;--> statement-breakpoint
UPDATE `characters` SET `last_played` = `created_at` WHERE `last_played` IS NULL;
```

#### Create New Table

```sql
CREATE TABLE `items` (
  `id` text PRIMARY KEY NOT NULL,
  `character_id` text NOT NULL,
  `name` text NOT NULL,
  `quantity` integer DEFAULT 1 NOT NULL,
  FOREIGN KEY (`character_id`) REFERENCES `characters`(`id`) ON DELETE cascade
);
```

---

## Development vs Production

### Development (`npm run dev`)

**Database Location:**
```
./data/superhero-ttrpg.db
```

**Behavior:**
- Database created automatically on first run
- Migrations run on every server restart
- Hot reload preserves database state
- Use Drizzle Studio for inspection: `npm run db:studio`

**Workflow:**
1. Modify schema in `src/db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Restart dev server (migrations apply automatically)

> [!TIP]
> Use `npm run db:push` to skip migration files during rapid prototyping. This directly syncs schema to database.

---

### Development (Docker)

**Build & Run:**
```bash
docker build -t superhero-ttrpg .
docker run -d \
  -p 3000:3000 \
  -v /tmp/ttrpg-data:/app/data \
  superhero-ttrpg
```

**Database Location:**
```
/tmp/ttrpg-data/superhero-ttrpg.db  # On host
/app/data/superhero-ttrpg.db        # In container
```

**Behavior:**
- Database persists in mounted volume
- Migrations run on container start
- Rebuild image to apply new migrations

---

### Production

**Database Location:**
```
/var/lib/ttrpg-data/superhero-ttrpg.db  # Persistent volume
```

**Deployment:**
```bash
# GitHub Actions builds and pushes to ECR
# Lightsail pulls image and restarts container
docker run -d \
  -p 3000:3000 \
  -v /var/lib/ttrpg-data:/app/data \
  --restart unless-stopped \
  superhero-ttrpg
```

**Migration Process:**
1. Commit schema changes and migration files to git
2. Push to `main` branch
3. GitHub Actions builds Docker image
4. Image deployed to production
5. Container starts → migrations run automatically
6. App serves requests with new schema

> [!WARNING]
> Always test migrations locally before deploying to production. Destructive migrations (DROP COLUMN, DROP TABLE) cannot be rolled back in SQLite.

---

## Drizzle ORM Usage

### Queries

```typescript
import { db } from '@/db/client';
import { characters } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

// Select all
const allCharacters = await db.select().from(characters);

// Select with filter
const character = await db
  .select()
  .from(characters)
  .where(eq(characters.id, 'abc123'))
  .limit(1);

// Select with multiple conditions
const staleCharacters = await db
  .select()
  .from(characters)
  .where(
    and(
      eq(characters.campaignId, 'campaign-1'),
      lt(characters.lastAccessedAt, thirtyDaysAgo)
    )
  );
```

### Inserts

```typescript
const [newCharacter] = await db
  .insert(characters)
  .values({
    id: nanoid(),
    campaignId: 'campaign-1',
    name: 'Hero Name',
    attributes: { stats: { strength: 10 } },
    createdBy: 'user-1',
  })
  .returning();
```

### Updates

```typescript
const [updated] = await db
  .update(characters)
  .set({ 
    name: 'New Name',
    updatedAt: new Date() 
  })
  .where(eq(characters.id, 'abc123'))
  .returning();
```

### Deletes

```typescript
const result = await db
  .delete(characters)
  .where(eq(characters.id, 'abc123'));

console.log(`Deleted ${result.changes} row(s)`);
```

---

## Configuration

### Drizzle Kit Config

**Location**: `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_PATH || './data/superhero-ttrpg.db',
  },
});
```

### Environment Variables

```env
# Optional - defaults to ./data/superhero-ttrpg.db
DATABASE_PATH=./data/superhero-ttrpg.db
```

---

## Troubleshooting

### Migration Fails: "More than one statement"

**Error:**
```
RangeError: The supplied SQL string contains more than one statement
```

**Solution:**
Add `--> statement-breakpoint` between statements:
```sql
ALTER TABLE `characters` ADD COLUMN `level` integer;--> statement-breakpoint
UPDATE `characters` SET `level` = 1;
```

### Database Locked

**Error:**
```
SqliteError: database is locked
```

**Solution:**
- WAL mode reduces this issue
- Ensure only one process accesses the database
- Check for long-running transactions

### Schema Out of Sync

**Error:**
```
SqliteError: no such column: characters.new_column
```

**Solution:**
```bash
# Generate and apply migration
npm run db:generate
npm run dev  # Restart to apply
```

### Reset Database (Development Only)

```bash
rm -rf data/
npm run dev  # Database recreated with all migrations
```

> [!CAUTION]
> This deletes all data. Only use in development.
