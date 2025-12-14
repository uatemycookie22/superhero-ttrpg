'use server'
import { db } from '@/db/client';
import { characters, type Character, type NewCharacter } from '@/db/schema';
import { eq, and, lt, sql, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { now, toDate, daysAgo } from '@/lib/temporal';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { unstable_noStore as noStore } from 'next/cache';
import { characterStatsSchema, validateCharacterStats } from '@/lib/character-validation';
import { getSession } from '@/lib/auth-server';

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
}): Promise<Character> {
  const session = await getSession();
  
  const id = nanoid();
  
  const [character] = await db
    .insert(characters)
    .values({
      id,
      ...data,
      createdBy: session?.user.id || 'tmp',
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
  noStore();
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
  const session = await getSession();
  const existing = await getCharacter(id);
  
  if (!existing) throw new Error("Character not found");
  
  // If character is owned (not 'tmp'), only owner can edit
  if (existing.createdBy && existing.createdBy !== 'tmp' && (!session || existing.createdBy !== session.user.id)) {
    throw new Error("Forbidden");
  }
  
  const updateData = editableCharacterSchema.parse(data);
  
  // Validate stats if attributes are being updated
  if (updateData.attributes) {
    const validation = validateCharacterStats(updateData.attributes);
    if (!validation.success) {
      throw new Error(validation.error);
    }
  }
  
  console.log('SERVER: Updating character', id, 'with skills:', data.attributes?.skills);
  
  const [updated] = await db
    .update(characters)
    .set({
      ...updateData,
      updatedAt: toDate(now()),
    })
    .where(eq(characters.id, id))
    .returning();
  
  console.log('SERVER: Update result skills:', updated?.attributes?.skills);
  
  if (updated) {
    revalidatePath(`/character-sheet/${id}`);
  }
  
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
  const session = await getSession();
  const existing = await getCharacter(id);
  
  if (!existing) return false;
  
  // If character is owned (not 'tmp'), only owner can delete
  if (existing.createdBy && existing.createdBy !== 'tmp' && (!session || existing.createdBy !== session.user.id)) {
    throw new Error("Forbidden");
  }
  
  const result = await db
    .delete(characters)
    .where(eq(characters.id, id));
  
  return result.changes > 0;
}

/**
 * Delete characters not accessed in 30 days (only unowned characters)
 */
export async function deleteStaleCharacters(): Promise<number> {
  const result = await db
    .delete(characters)
    .where(and(
      lt(characters.lastAccessedAt, toDate(daysAgo(30))),
      eq(characters.createdBy, 'tmp')
    ));
  
  return result.changes;
}