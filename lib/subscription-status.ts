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

const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'trialing'];

export function isActiveStatus(status: SubscriptionStatus | undefined): boolean {
  return !!status && ACTIVE_STATUSES.includes(status);
}
