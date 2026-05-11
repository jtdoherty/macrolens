import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import type { ForecastPayload } from '@/lib/types';
import type { SubscriptionStatus } from '@/lib/subscription-status';

export const subscriptions = pgTable('subscriptions', {
  userId: text('user_id').primaryKey(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').$type<SubscriptionStatus>(),
  currentPeriodEnd: integer('current_period_end'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const forecasts = pgTable('forecasts', {
  ticker: text('ticker').primaryKey(),
  payload: jsonb('payload').$type<ForecastPayload>().notNull(),
  isCore: boolean('is_core').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type ForecastRow = typeof forecasts.$inferSelect;
