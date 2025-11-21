import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Campaigns table
 * Stores campaign information for the TTRPG game
 */
export const campaigns = sqliteTable('campaigns', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull(), // Will be user ID when auth is added
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Characters table
 * Stores character information with flexible JSON attributes
 */
export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  // Flexible JSON structure for game system customization
  attributes: text('attributes', { mode: 'json' }).$type<{
    stats?: Record<string, number>;
    description?: string;
    background?: string;
    health?: { current: number; max: number };
    resources?: Record<string, { current: number; max: number }>;
    equipment?: Array<{ name: string; description: string }>;
    abilities?: Array<{ name: string; description: string; level?: number }>;
    [key: string]: unknown;
  }>(),
  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  lastAccessedAt: integer('last_accessed_at', { mode: 'timestamp' }),
});

/**
 * Sessions table
 * Tracks active game sessions for real-time collaboration
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  campaignId: text('campaign_id')
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' }),
  startedAt: integer('started_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  // Store real-time session state (turn order, current player, etc.)
  state: text('state', { mode: 'json' }).$type<{
    currentTurn?: string;
    turnOrder?: string[];
    notes?: string;
    [key: string]: unknown;
  }>(),
});

/**
 * Weaknesses table
 * Stores character weaknesses
 */
export const weaknesses = sqliteTable('weaknesses', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
});

// Type exports for use in the application
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Weakness = typeof weaknesses.$inferSelect;
export type NewWeakness = typeof weaknesses.$inferInsert;