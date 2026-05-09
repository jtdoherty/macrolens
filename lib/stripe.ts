// Stripe SDK client — server-side only.
//
// We don't pin apiVersion. The installed `stripe` SDK ships with a default
// API version it's tested against; pinning ourselves is only needed when we
// upgrade and want to defer behavior changes. For Phase 2 the default is fine.

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set. See .env.local.');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const PRICE_ID = process.env.STRIPE_PRICE_ID;
if (!PRICE_ID) {
  throw new Error('STRIPE_PRICE_ID is not set. See .env.local.');
}
