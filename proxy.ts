// Clerk auth middleware.
//
// Filename note: Next.js 16 renamed `middleware.ts` → `proxy.ts` as part of a
// breaking change in routing internals. Earlier Next.js versions use
// `middleware.ts`. Same code, just a different filename.
//
// Default behavior: gate every route. Public exceptions are listed in
// `isPublicRoute` below — anything not matched there will redirect to /sign-in
// for unauthenticated users.

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  // /api/forecast stays open until Phase 2 step 2.10 wires the Stripe
  // subscription gate. Once that's in, this route gets removed from the list.
  '/api/forecast(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
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
