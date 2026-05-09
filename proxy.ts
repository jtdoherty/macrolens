// Clerk auth + Stripe subscription middleware.
//
// Filename note: Next.js 16 renamed `middleware.ts` → `proxy.ts`. Same code,
// just a different filename.
//
// Three tiers of access:
//
// 1. Public — no auth required:
//    /sign-in/*, /sign-up/*, /api/stripe/webhook
//
// 2. Authenticated, subscription not required:
//    /pricing, /api/stripe/checkout, /api/stripe/post-checkout
//
// 3. Authenticated AND subscribed (active or trialing):
//    Everything else (dashboard pages, /api/forecast)

import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isActiveStatus, type SubscriptionMetadata } from '@/lib/subscription';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stripe/webhook',
]);

// Auth required, but subscription is NOT required.
const isAuthOnlyRoute = createRouteMatcher([
  '/pricing',
  '/api/stripe/checkout',
  '/api/stripe/post-checkout',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  // From here down, sign-in is required.
  await auth.protect();

  // Routes that only need auth, not subscription.
  if (isAuthOnlyRoute(req)) return;

  // Subscription gate. Read publicMetadata via Clerk client. ~50ms per gated
  // request — acceptable for Phase 2. If this becomes a bottleneck, we can
  // promote subscriptionStatus into the session token via Clerk dashboard's
  // session token customization (one-time setup, near-zero overhead per call).
  const { userId } = await auth();
  if (!userId) return; // auth.protect() already redirected

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = (user.publicMetadata ?? {}) as SubscriptionMetadata;

  if (!isActiveStatus(meta.subscriptionStatus ?? null)) {
    // For API routes, return JSON 402 (Payment Required) so callers can handle
    // it programmatically. For pages, redirect to /pricing so browsers navigate.
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'subscription_required', message: 'Active MacroLens Pro subscription required.' },
        { status: 402 },
      );
    }
    return NextResponse.redirect(new URL('/pricing', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
