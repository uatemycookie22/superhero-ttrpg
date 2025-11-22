'use server'
import { db } from '@/db/client';
import { characters, type Character, type NewCharacter } from '@/db/schema';
import { eq, and, lt, sql, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { now, toDate, daysAgo } from '@/lib/temporal';
import { z } from 'zod';

const editableCharacterSchema = z.object({
  name: z.string(),
  attributes: z.any(),
}).partial();

/**
 * Create a new character
 */
export async function createCharacter(data: {
  campaignId: string;
  name: string;
  attributes?: Character['attributes'];
  createdBy: string;
}): Promise<Character> {
  const id = nanoid();
  
  const [character] = await db
    .insert(characters)
    .values({
      id,
      ...data,
      lastAccessedAt: toDate(now()),
    })
    .returning();
  
  return character;
}

/**
 * Get all characters for a campaign
 */
export async function listCharactersByCampaign(campaignId: string): Promise<Character[]> {
  return db
    .select()
    .from(characters)
    .where(eq(characters.campaignId, campaignId))
    .all();
}

/**
 * Get a single character by ID
 */
export async function getCharacter(id: string): Promise<Character | null> {
  const [character] = await db
    .select()
    .from(characters)
    .where(eq(characters.id, id))
    .limit(1);
  
  return character || null;
}

/**
 * Get multiple characters by IDs
 */
export async function getCharacters(ids: string[]): Promise<Character[]> {
  if (ids.length === 0) return [];
  
  return await db
    .select()
    .from(characters)
    .where(inArray(characters.id, ids))
    .all();
}

/**
 * Get a character by ID and verify it belongs to the campaign
 */
export async function getCharacterInCampaign(
  id: string,
  campaignId: string
): Promise<Character | null> {
  const [character] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.campaignId, campaignId)))
    .limit(1);
  
  return character || null;
}

/**
 * Update a character
 */
export async function updateCharacter(
  id: string,
  data: Partial<Pick<Character, 'name' | 'attributes'>>
): Promise<Character | null> {
  const updateData = editableCharacterSchema.parse(data);
  
  const [updated] = await db
    .update(characters)
    .set({
      ...updateData,
      updatedAt: toDate(now()),
    })
    .where(eq(characters.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Touch character's lastAccessedAt timestamp
 */
export async function touchCharacter(id: string): Promise<void> {
  await db
    .update(characters)
    .set({ lastAccessedAt: toDate(now()) })
    .where(eq(characters.id, id));
}

/**
 * Delete a character
 */
export async function deleteCharacter(id: string): Promise<boolean> {
  const result = await db
    .delete(characters)
    .where(eq(characters.id, id));
  
  return result.changes > 0;
}

/**
 * Delete characters not accessed in 30 days
 */
export async function deleteStaleCharacters(): Promise<number> {
  const result = await db
    .delete(characters)
    .where(lt(characters.lastAccessedAt, toDate(daysAgo(30))));
  
  return result.changes;
}