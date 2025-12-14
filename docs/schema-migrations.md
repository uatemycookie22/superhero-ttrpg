# Schema Migrations Guide

Lessons learned from implementing auth and managing database migrations.

## The Golden Rule

**NEVER DELETE COMMITTED MIGRATION FILES**

Migrations are append-only. Once committed, they're permanent history.

## Drizzle Commands

### `db:push` - Development Only
- Directly modifies database schema
- No migration files created
- Fast iteration
- Can't rollback
- **Use for:** Local development, rapid prototyping

### `db:generate` - Production
- Creates migration SQL files
- Version controlled
- Reviewable
- Can rollback
- **Use for:** Production deployments

### `db:migrate` - Alias
- Runs `generate` + `push`
- Convenience command

## Proper Workflow

### 1. Development
```bash
# Make schema changes in src/db/schema.ts
# Test with push (no migration files)
npm run db:push
```

### 2. Before Deployment
```bash
# Generate migration files
npm run db:generate

# Review the SQL in src/db/migrations/
# Commit the migration files
git add src/db/migrations/
git commit -m "Add auth tables migration"
```

### 3. Production
```bash
# Server runs migrations on startup via instrumentation.ts
# Drizzle checks __drizzle_migrations table
# Only runs new migrations
```

## How Drizzle Tracks Migrations

### The `__drizzle_migrations` Table
```sql
CREATE TABLE __drizzle_migrations (
  hash TEXT PRIMARY KEY,
  created_at INTEGER
);
```

Each migration file gets a hash. When `migrate()` runs:
1. Reads migration files
2. Checks which hashes exist in `__drizzle_migrations`
3. Runs only the new ones
4. Inserts their hashes

### The Journal File
`src/db/migrations/meta/_journal.json` tracks:
- Migration sequence (idx: 0, 1, 2, 3...)
- Filenames (0000_neat_ink, 0001_add_last_accessed_at...)
- Timestamps

**This file must stay in sync with actual migration files.**

## Common Mistakes

### ❌ Deleting Migration Files
```bash
# DON'T DO THIS
rm src/db/migrations/0003_*.sql
npm run db:generate  # Creates 0003 again, but different content
```

**Result:** Journal out of sync, Drizzle confused, production breaks.

### ❌ Using `push` in Production
```bash
# DON'T DO THIS IN PROD
npm run db:push
```

**Result:** No migration history, can't rollback, team can't review changes.

### ❌ Editing Migration Files
```bash
# DON'T DO THIS
vim src/db/migrations/0003_auth.sql  # Manual edits
```

**Result:** Hash mismatch, Drizzle won't recognize it.

## Correct Patterns

### ✅ Adding a New Feature
```bash
# 1. Make schema changes
vim src/db/schema.ts

# 2. Test locally with push
npm run db:push

# 3. When ready for prod, generate migration
npm run db:generate

# 4. Test the migration on a prod DB copy
cp prod-backup.db test.db
DATABASE_PATH=./test.db npm run dev

# 5. Verify data preserved
sqlite3 test.db "SELECT COUNT(*) FROM my_table;"

# 6. Commit
git add src/db/migrations/
git commit -m "Add new feature schema"
```

### ✅ Testing Migrations Before Deploy
```bash
# 1. Download production database
scp user@server:/path/to/prod.db ./data/prod-backup.db

# 2. Use it as local DB
cp data/prod-backup.db data/superhero-ttrpg.db

# 3. Generate migration
npm run db:generate

# 4. Test with server startup (runs instrumentation.ts)
DATABASE_PATH=./data/prod-backup.db npm run dev

# 5. Verify data
sqlite3 data/prod-backup.db "SELECT COUNT(*) FROM important_table;"
```

### ✅ Fixing a Broken Migration State
```bash
# 1. Reset to clean state
git checkout main
git reset --hard HEAD
git clean -fd

# 2. Download fresh prod DB
scp user@server:/path/to/prod.db ./data/prod.db

# 3. Use prod DB as local
cp data/prod.db data/superhero-ttrpg.db

# 4. Generate migration (Drizzle sees prod's migration history)
npm run db:generate

# 5. Test it
DATABASE_PATH=./data/prod.db npm run dev
```

## SQLite Limitations

### Can't ALTER COLUMN
SQLite doesn't support:
- Changing column type
- Adding NOT NULL to existing column
- Removing NOT NULL from column

**Drizzle's workaround:**
1. Create `__new_table` with new schema
2. `INSERT INTO __new_table SELECT * FROM old_table`
3. `DROP TABLE old_table`
4. `ALTER TABLE __new_table RENAME TO old_table`

**This can fail if:**
- Foreign key constraints are ON during INSERT
- Data doesn't match new constraints

**Solution:** Match production schema exactly. Don't change column constraints.

## Our Mistake Timeline

1. ✅ Generated 0003 for auth tables
2. ❌ Deleted 0003 due to error
3. ❌ Generated 0004 (should have been 0003)
4. ❌ Deleted everything and regenerated
5. ❌ New 0000 assumed empty DB
6. ❌ Tried to CREATE tables that exist in prod
7. ✅ Used prod DB as local → correct 0003 generated

## Key Takeaways

1. **Migrations are append-only** - Never delete
2. **Test against prod DB copy** - Before deploying
3. **Match prod schema exactly** - Don't change constraints unnecessarily
4. **Use push for dev, generate for prod** - Different tools for different stages
5. **Journal must match files** - If out of sync, restore from git
6. **Production DB is source of truth** - Use it to generate migrations

## Emergency Recovery

If migrations are completely broken:

```bash
# 1. Reset to last known good state
git checkout main
git reset --hard origin/main

# 2. Download fresh prod DB
scp user@server:/path/to/prod.db ./data/prod.db

# 3. Make schema changes
vim src/db/schema.ts

# 4. Use prod DB as local
cp data/prod.db data/superhero-ttrpg.db

# 5. Generate ONE migration
npm run db:generate

# 6. Test it
DATABASE_PATH=./data/prod.db npm run dev

# 7. Verify, then commit
git add src/db/migrations/
git commit -m "Add schema changes"
```

## Production Deployment Checklist

- [ ] Migration files committed
- [ ] Tested against prod DB copy
- [ ] Data preservation verified
- [ ] No manual edits to migration SQL
- [ ] Journal file in sync
- [ ] instrumentation.ts runs migrate() on startup
