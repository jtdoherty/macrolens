// Stripe webhook handler.
//
// Stripe POSTs subscription lifecycle events here. We verify the signature
// (so only Stripe can write to user metadata), then update Clerk publicMetadata
// based on the event type.
//
// Local dev: install the Stripe CLI and run
//   stripe listen --forward-to localhost:3000/api/stripe/webhook
// It prints a `whsec_…` value — paste into STRIPE_WEBHOOK_SECRET in .env.local
// and restart the dev server.
//
// Production: in Stripe Dashboard → Developers → Webhooks → Add endpoint,
// point at https://your-domain.com/api/stripe/webhook, subscribe to:
//   - checkout.session.completed
//   - customer.subscription.updated
//   - customer.subscription.deleted
// Copy the resulting signing secret into Vercel env vars as STRIPE_WEBHOOK_SECRET.

import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { setUserSubscription, type SubscriptionStatus } from '@/lib/subscription';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not set — refusing webhook.');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  // Important: use raw body bytes for signature verification. Don't JSON.parse first.
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('Webhook signature verification failed:', message);
    return new Response(`Invalid signature: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clerkUserId = session.client_reference_id ?? session.metadata?.clerkUserId;
        if (!clerkUserId) {
          console.warn('checkout.session.completed missing clerkUserId — ignoring.');
          break;
        }
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
        // Default to 'trialing' since we configure a 7-day trial; the
        // subscription.updated event will overwrite when the trial ends.
        await setUserSubscription(clerkUserId, {
          subscriptionStatus: 'trialing',
          stripeCustomerId: customerId,
          stripeSubscriptionId: subId,
        });
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const sub = event.data.object;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) {
          console.warn(`${event.type} missing clerkUserId metadata — ignoring.`);
          break;
        }
        await setUserSubscription(clerkUserId, {
          subscriptionStatus: sub.status as SubscriptionStatus,
          stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
          stripeSubscriptionId: sub.id,
          currentPeriodEnd: sub.items.data[0]?.current_period_end,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const clerkUserId = sub.metadata?.clerkUserId;
        if (!clerkUserId) break;
        await setUserSubscription(clerkUserId, {
          subscriptionStatus: 'canceled',
        });
        break;
      }

      // Other event types ignored — extend as needed.
    }

    return new Response('OK', { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error(`Webhook handler error for ${event.type}:`, message);
    // Return 500 so Stripe retries. Use 200 to acknowledge and skip retries.
    return new Response(`Handler error: ${message}`, { status: 500 });
  }
}
