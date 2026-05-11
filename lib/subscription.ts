// Subscription state helpers. Phase 3 stores the source of truth in Postgres.
// We still mirror the same metadata into Clerk so proxy.ts can keep doing a
// fast optimistic gate before route handlers perform authoritative DB checks.

import { auth, clerkClient } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db/client';
import { subscriptions } from '@/db/schema';
import { isActiveStatus } from './subscription-status';
export { isActiveStatus };
export type { SubscriptionMetadata, SubscriptionStatus } from './subscription-status';
import type { SubscriptionMetadata } from './subscription-status';

// Server-side: read the current user's subscription metadata via Clerk.
// Returns null if unauthenticated.
export async function getCurrentUserSubscription(): Promise<SubscriptionMetadata | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return getUserSubscription(userId);
}

export async function getUserSubscription(userId: string): Promise<SubscriptionMetadata | null> {
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const [row] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
      if (row) {
        return {
          subscriptionStatus: row.status,
          stripeCustomerId: row.stripeCustomerId ?? undefined,
          stripeSubscriptionId: row.stripeSubscriptionId ?? undefined,
          currentPeriodEnd: row.currentPeriodEnd ?? undefined,
        };
      }
    } catch (err) {
      console.error('Failed to read subscription from database; falling back to Clerk metadata.', err);
    }
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return (user.publicMetadata ?? {}) as SubscriptionMetadata;
}

export async function isCurrentUserSubscribed(): Promise<boolean> {
  const meta = await getCurrentUserSubscription();
  return isActiveStatus(meta?.subscriptionStatus ?? null);
}

// Used by webhook + post-checkout to write subscription state.
export async function setUserSubscription(
  userId: string,
  metadata: Partial<SubscriptionMetadata>,
): Promise<void> {
  if (isDatabaseConfigured()) {
    const db = getDb();
    await db
      .insert(subscriptions)
      .values({
        userId,
        status: metadata.subscriptionStatus,
        stripeCustomerId: metadata.stripeCustomerId,
        stripeSubscriptionId: metadata.stripeSubscriptionId,
        currentPeriodEnd: metadata.currentPeriodEnd,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: subscriptions.userId,
        set: {
          status: metadata.subscriptionStatus,
          stripeCustomerId: metadata.stripeCustomerId,
          stripeSubscriptionId: metadata.stripeSubscriptionId,
          currentPeriodEnd: metadata.currentPeriodEnd,
          updatedAt: new Date(),
        },
      });
  }

  const client = await clerkClient();
  // Merge with existing publicMetadata so we don't clobber other fields.
  const existing = (await client.users.getUser(userId)).publicMetadata ?? {};
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...existing, ...metadata },
  });
}
