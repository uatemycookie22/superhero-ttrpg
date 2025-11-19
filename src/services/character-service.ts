'use server'
import { db } from '@/db/client';
import { characters, type Character, type NewCharacter } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

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
  const [updated] = await db
    .update(characters)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(characters.id, id))
    .returning();
  
  return updated || null;
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