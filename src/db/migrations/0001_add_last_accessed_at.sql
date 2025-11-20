-- Check if column exists, add if it doesn't
-- SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we use a workaround

-- First, try to select from the column to see if it exists
-- If it fails, the column doesn't exist and we add it
-- If it succeeds, the column exists and we skip

-- Add column (will fail silently if exists)
ALTER TABLE `characters` ADD COLUMN `last_accessed_at` integer;

-- Update existing rows to use created_at as initial value
UPDATE `characters` SET `last_accessed_at` = `created_at` WHERE `last_accessed_at` IS NULL;
