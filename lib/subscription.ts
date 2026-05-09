// Subscription state helpers.
//
// Phase 2 stores subscription state in Clerk's `publicMetadata`. The webhook
// + post-checkout handler write to it; the middleware + this helper read it.
// Phase 3 will move this to a Postgres `subscriptions` table; the public API
// of this file will stay the same so consumers don't change.

import { auth, clerkClient } from '@clerk/nextjs/server';

export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused'
  | null;

export type SubscriptionMetadata = {
  subscriptionStatus?: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: number; // unix seconds
};

// Statuses that grant dashboard access. Trialing users are full members.
const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export function isActiveStatus(status: SubscriptionStatus | undefined): boolean {
  return !!status && ACTIVE_STATUSES.includes(status);
}

// Server-side: read the current user's subscription metadata via Clerk.
// Returns null if unauthenticated.
export async function getCurrentUserSubscription(): Promise<SubscriptionMetadata | null> {
  const { userId } = await auth();
  if (!userId) return null;
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
  const client = await clerkClient();
  // Merge with existing publicMetadata so we don't clobber other fields.
  const existing = (await client.users.getUser(userId)).publicMetadata ?? {};
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { ...existing, ...metadata },
  });
}
