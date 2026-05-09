// Stripe redirects here after successful Checkout.
//
// Why this exists separately from the webhook: webhook delivery is async and
// can take seconds. Without this route, the user would land on /pricing
// (because their metadata isn't yet active), see the subscribe button, and be
// confused. This route fetches the Checkout Session synchronously, writes
// subscription metadata to Clerk, then redirects to the dashboard. The webhook
// still handles ongoing events (renewals, cancellations).

import { auth } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe';
import { setUserSubscription, type SubscriptionStatus } from '@/lib/subscription';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.redirect(new URL('/sign-in', req.url), 303);
  }

  const sessionId = new URL(req.url).searchParams.get('session_id');
  if (!sessionId) {
    return Response.redirect(new URL('/pricing?error=missing_session', req.url), 303);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription'],
  });

  // Confirm session belongs to this user (defense in depth).
  if (session.client_reference_id !== userId) {
    return Response.redirect(new URL('/pricing?error=mismatched_session', req.url), 303);
  }

  if (session.status !== 'complete') {
    return Response.redirect(new URL('/pricing?error=incomplete', req.url), 303);
  }

  const subscription = typeof session.subscription === 'object' ? session.subscription : null;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  await setUserSubscription(userId, {
    subscriptionStatus: (subscription?.status as SubscriptionStatus) ?? 'active',
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription?.id,
    currentPeriodEnd: subscription?.items.data[0]?.current_period_end,
  });

  return Response.redirect(new URL('/?subscribed=1', req.url), 303);
}
