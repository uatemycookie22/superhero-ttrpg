import { db } from '@/db/client';
import { sessions, type Session, type NewSession } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * Create a new game session
 */
export async function createSession(data: {
  campaignId: string;
  state?: Session['state'];
}): Promise<Session> {
  const id = nanoid();
  
  const [session] = await db
    .insert(sessions)
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
export async function getActiveSession(campaignId: string): Promise<Session | null> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.campaignId, campaignId), eq(sessions.isActive, true)))
    .limit(1);
  
  return session || null;
}

/**
 * Get a session by ID
 */
export async function getSession(id: string): Promise<Session | null> {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .limit(1);
  
  return session || null;
}

/**
 * Update session state (for real-time updates)
 */
export async function updateSessionState(
  id: string,
  state: Session['state']
): Promise<Session | null> {
  const [updated] = await db
    .update(sessions)
    .set({ state })
    .where(eq(sessions.id, id))
    .returning();
  
  return updated || null;
}

/**
 * End a session
 */
export async function endSession(id: string): Promise<Session | null> {
  const [updated] = await db
    .update(sessions)
    .set({
      isActive: false,
      endedAt: new Date(),
    })
    .where(eq(sessions.id, id))
    .returning();
  
  return updated || null;
}

/**
 * Get all sessions for a campaign (active and inactive)
 */
export async function listSessionsByCampaign(campaignId: string): Promise<Session[]> {
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.campaignId, campaignId))
    .all();
}