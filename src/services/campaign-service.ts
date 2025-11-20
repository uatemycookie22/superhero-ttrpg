'use server'
import { db } from '@/db/client';
import { campaigns, type Campaign, type NewCampaign } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { now, toDate } from '@/lib/temporal';

/**
 * Create a new campaign
 */
export async function createCampaign(data: {
  name: string;
  description?: string;
  createdBy: string;
  overrideId?: string,
}): Promise<Campaign> {
  const id = data.overrideId ?? nanoid();
  
  const [campaign] = await db
    .insert(campaigns)
    .values({
      id,
      ...data,
    })
    .returning();
  
  return campaign;
}

/**
 * Get all campaigns
 * TODO: Add pagination when needed
 */
export async function listCampaigns(): Promise<Campaign[]> {
  return db.select().from(campaigns).all();
}

/**
 * Get a single campaign by ID
 */
export async function getCampaign(id: string): Promise<Campaign | null> {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);
  
  return campaign || null;
}

/**
 * Update a campaign
 */
export async function updateCampaign(
  id: string,
  data: Partial<Pick<Campaign, 'name' | 'description'>>
): Promise<Campaign | null> {
  const [updated] = await db
    .update(campaigns)
    .set({
      ...data,
      updatedAt: toDate(now()),
    })
    .where(eq(campaigns.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Delete a campaign
 * Note: This will cascade delete all associated characters and sessions
 */
export async function deleteCampaign(id: string): Promise<boolean> {
  const result = await db
    .delete(campaigns)
    .where(eq(campaigns.id, id));
  
  return result.changes > 0;
}