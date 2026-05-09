// Creates a Stripe Checkout Session and redirects the user to the
// Stripe-hosted payment page.
//
// Called via a <form action="/api/stripe/checkout" method="POST"> on the
// /pricing page. After payment, Stripe redirects to /api/stripe/post-checkout
// which writes subscription metadata to Clerk before sending the user to the
// dashboard (avoids the webhook-arrival race).

import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, PRICE_ID } from '@/lib/stripe';

const TRIAL_DAYS = 7;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.redirect(new URL('/sign-in', req.url), 303);
  }

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;
  const origin = new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: PRICE_ID, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { clerkUserId: userId },
    },
    metadata: { clerkUserId: userId },
    success_url: `${origin}/api/stripe/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
  });

  if (!session.url) {
    return new Response('Failed to create Checkout Session', { status: 500 });
  }
  return Response.redirect(session.url, 303);
}
