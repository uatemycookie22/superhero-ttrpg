ALTER TABLE `characters` ADD COLUMN `last_accessed_at` integer;--> statement-breakpoint
UPDATE `characters` SET `last_accessed_at` = `created_at` WHERE `last_accessed_at` IS NULL;
