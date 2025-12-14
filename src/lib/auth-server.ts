"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { user, passkey } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return null; // Don't redirect, just return null
  }
  return session;
}

export async function deleteOrphanedUser(userId: string) {
  const session = await getSession();
  
  // Only allow deleting your own account, and only if it has no passkeys
  if (!session || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }
  
  // Check if user has any passkeys
  const userPasskeys = await db.select().from(passkey).where(eq(passkey.userId, userId));
  
  if (userPasskeys.length > 0) {
    throw new Error("Cannot delete user with passkeys");
  }
  
  // Delete user (cascades to sessions, accounts)
  await db.delete(user).where(eq(user.id, userId));
}
