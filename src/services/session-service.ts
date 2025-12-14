'use server'
import { db } from '@/db/client';
import { gameSessions, type GameSession, type NewGameSession } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { now, toDate } from '@/lib/temporal';

/**
 * Create a new game session
 */
export async function createSession(data: {
  campaignId: string;
  state?: GameSession['state'];
}): Promise<GameSession> {
  const id = nanoid();
  
  const [session] = await db
    .insert(gameSessions)
    .values({
      id,
      ...data,
      isActive: true,
    })
    .returning();
  
  return session;
}

/**
 * Get active session for a campaign
 */
export async function getActiveSession(campaignId: string): Promise<GameSession | null> {
  const [session] = await db
    .select()
    .from(gameSessions)
    .where(and(eq(gameSessions.campaignId, campaignId), eq(gameSessions.isActive, true)))
    .limit(1);
  
  return session || null;
}

/**
 * Get a session by ID
 */
export async function getSession(id: string): Promise<GameSession | null> {
  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, id))
    .limit(1);
  
  return session || null;
}

/**
 * Update session state (for real-time updates)
 */
export async function updateSessionState(
  id: string,
  state: GameSession['state']
): Promise<GameSession | null> {
  const [updated] = await db
    .update(gameSessions)
    .set({ state })
    .where(eq(gameSessions.id, id))
    .returning();
  
  return updated || null;
}

/**
 * End a session
 */
export async function endSession(id: string): Promise<GameSession | null> {
  const [updated] = await db
    .update(gameSessions)
    .set({
      isActive: false,
      endedAt: toDate(now()),
    })
    .where(eq(gameSessions.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Get all sessions for a campaign (active and inactive)
 */
export async function listSessionsByCampaign(campaignId: string): Promise<GameSession[]> {
  return db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.campaignId, campaignId))
    .all();
}
