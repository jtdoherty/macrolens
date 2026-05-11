# Architecture Notes

## Directory layout (actual, Phase 3 complete)

```
macrolens/
├── app/
│   ├── layout.tsx                       Root: <html>, <body>, ClerkProvider, fonts
│   ├── globals.css                      All styles (~2000 lines, ported from reference HTML)
│   ├── (auth)/                          Route group — centered card on dark gradient
│   │   ├── layout.tsx
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/                     Route group — sidebar shell, auth+subscription gated
│   │   ├── layout.tsx                   Sidebar shell
│   │   ├── page.tsx                     Homepage
│   │   ├── pricing/page.tsx             Subscribe button (auth-only, no subscription required)
│   │   ├── macro/page.tsx               Macro Dashboard
│   │   ├── screener/page.tsx            Filterable table; reads searchParams
│   │   ├── forecast/page.tsx            Single-ticker view; reads ?ticker=
│   │   ├── comparison/page.tsx          Multi-ticker compare; reads ?tickers=
│   │   ├── portfolio/page.tsx           Server shell + client list
│   │   ├── watchlist/page.tsx           Server shell + client list
│   │   └── ticker/[symbol]/
│   │       ├── page.tsx                 Hero + tabs nav + dispatch
│   │       └── _tabs/                   Tab content (underscore = not routable)
│   └── api/
│       ├── forecast/route.ts            GET — DB-backed, gated by Clerk+subscription
│       ├── refresh/route.ts             GET/POST — Vercel Cron target, gated by CRON_SECRET
│       └── stripe/
│           ├── checkout/route.ts        POST — creates Stripe Checkout Session
│           ├── post-checkout/route.ts   GET — landing after successful checkout
│           └── webhook/route.ts         POST — receives Stripe events, writes subscriptions
├── components/                          (Sidebar, charts, ValuationBand, etc.)
├── lib/
│   ├── types.ts                         ForecastPayload, FinancialsPayload, Indicator, Holding
│   ├── data.ts                          Barrel re-export of all mock data
│   ├── forecast-store.ts                DB-backed forecast reads + mock fallback
│   ├── forecasts.ts                     PL (5 core) + PL_EXTENDED (20 total)
│   ├── financials.ts                    FINANCIALS — 5y annual + 12q quarterly per ticker
│   ├── indicators.ts                    INDS, FLASH_INDS, REGIMES, GROUP_* maps
│   ├── helpers.ts                       fmt, pct, yc, alb, cb, sb
│   ├── store.ts                         SSR-safe localStorage hooks
│   ├── stripe.ts                        Stripe client + price id
│   ├── subscription.ts                  DB-first subscription read/write, Clerk mirror
│   └── subscription-status.ts           Edge-safe types (no pg import)
├── db/
│   ├── schema.ts                        Drizzle schema: subscriptions, forecasts
│   ├── client.ts                        Postgres pool + Drizzle client (singleton)
│   └── migrations/                      Generated SQL migrations + meta
├── docs/
│   ├── PLAN.md                          Phased build order + status
│   ├── CONTRACT.md                      Backend JSON shape (locked in)
│   ├── ARCHITECTURE.md                  This file
│   ├── OPERATIONS.md                    Day-to-day monitoring runbook
│   └── reference/original-design.html   Friend's design (read-only)
├── proxy.ts                             Next.js 16 middleware (renamed from middleware.ts)
├── drizzle.config.ts                    Drizzle Kit config
├── vercel.json                          Vercel Cron config
├── AGENTS.md / CLAUDE.md                AI agent guidance
└── package.json / tsconfig.json / next.config.ts
```

## Key decisions

### Routes vs. SPA tabs
Friend's HTML uses `goTo()` to switch hidden divs. We use **real Next.js routes** (`/macro`, `/screener`, etc.). Benefits: proper URLs, back-button works, future SEO on the marketing pages, cleaner code separation per page, every selection state is shareable as a link.

### URL state over component state
For filters and selections (screener filters, comparison ticker set, forecast ticker, ticker detail tab), we put state in `searchParams`. This means:
- Pages are server-rendered with the right data based on URL
- Selections survive page refresh
- Links to specific views are shareable
- Browser back button does what users expect

### Single CSS file
The reference design has ~2000 lines of carefully-tuned CSS with multiple `:root` overrides building up the final theme. Splitting into per-component CSS modules would risk specificity bugs. We keep it monolithic in `app/globals.css`.

### Client vs. Server components
Default to server components. Mark `'use client'` only when needed:
- **Sidebar** — collapse state, `usePathname` for active route
- **Pages using Chart.js** — wrapped via `react-chartjs-2`, needs the DOM
- **Pages using localStorage** — watchlist, portfolio, watchlist star toggle
- **ScreenerFilters** — `useRouter` to update URL on input change

Everything else is server-rendered. Most pages are server components that import small client islands.

### Data flow (Phase 3)

```
Vercel Cron (daily, 10:00 UTC)
   → POST/GET /api/refresh   (auth: Bearer CRON_SECRET)
   → upsertMockForecasts({ jitter: true })
   → Neon Postgres: forecasts table (20 rows, payload as jsonb)

Browser → dashboard page → lib/forecast-store.ts → Neon
                                          ↓ (fallback if DATABASE_URL unset or DB empty)
                                  PL / PL_EXTENDED mock constants
```

Forecast-backed dashboard pages are marked `dynamic = 'force-dynamic'` so DB refreshes are visible at request time. Client-only localStorage views (portfolio, watchlist) still use mock forecast constants for browser-side calculations.

### Subscription flow

```
Stripe Checkout → /api/stripe/post-checkout (sync) → setUserSubscription
                                                       ↓ writes to BOTH:
                                                       ├── Neon: subscriptions
                                                       └── Clerk: publicMetadata

Later events    → /api/stripe/webhook → setUserSubscription (same)

proxy.ts (edge middleware) reads Clerk publicMetadata
   → fast optimistic gate, can't reach Postgres from edge

Route handlers (e.g. /api/forecast) read from Neon directly
   → authoritative gate, defense-in-depth
```

The double-write keeps middleware fast (no DB roundtrip per request) while the DB stays authoritative. `setUserSubscription` in `lib/subscription.ts` is the only function that mutates this state — both `post-checkout` and `webhook` go through it.

### Why no Tailwind
The reference design has gradient text, layered shadows, custom keyframes — these translate cleanly to handwritten CSS but would be tedious in Tailwind utility classes. The CSS was already written. Switching costs nothing now, costs a day later.

### Charts: one generic wrapper instead of many
Originally we'd have written ~10 specialized chart components (one per chart in the friend's HTML). Instead `<FinancialChart>` accepts a generic `datasets` array with per-dataset `type` (bar/line), `color`, `diverging` (positive=green, negative=red), `borderDash`, `invert` (negate values for outflows like CapEx). Five financial tabs use it; only specialized layouts (single-ticker revenue overlay, multi-ticker comparison, portfolio donut) get their own component.

## State persistence

| State              | Storage                          | When to migrate to DB                  |
|--------------------|----------------------------------|----------------------------------------|
| Sidebar collapsed  | localStorage (`ml_sb_collapsed`) | Never — UI state                       |
| Watchlist          | localStorage (`ml_wl`)           | Phase 3 if cross-device sync wanted    |
| Portfolio          | localStorage (`ml_port`)         | Phase 3 if cross-device sync wanted    |
| Subscription state | DB + Clerk metadata cache        | DB is source of truth; Clerk metadata keeps proxy fast |
| Forecast data      | DB + mock fallback               | Daily cron writes DB; mock fallback keeps local dev usable |
| User profile       | Clerk (Phase 2)                  | Don't duplicate into our DB            |

## Auth + subscription gates (live)

Three tiers, enforced in `proxy.ts`:

1. **Public:** `/sign-in/*`, `/sign-up/*`, `/api/stripe/webhook`, `/api/refresh` (the last two are gated by their own signature / bearer checks inside the route handler).
2. **Auth only:** `/pricing`, `/api/stripe/checkout`, `/api/stripe/post-checkout`. Sign-in required, no subscription needed.
3. **Auth + active subscription:** everything else under `app/(dashboard)/` plus `/api/forecast`. Subscription means status `active` or `trialing`.

Unauthenticated dashboard requests are redirected to `/sign-in`. Authenticated-but-unsubscribed requests are redirected to `/pricing` (pages) or returned as JSON `402` (API routes).

## Vercel deploy notes

- **Auto-deploy** on push to `main`.
- **Env vars required for Production:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_ID`, `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `CRON_SECRET`.
- **Cron:** `vercel.json` declares one job (`0 10 * * *` → `/api/refresh`). Vercel reads it during build. Verify in Vercel → Settings → Cron Jobs.
- **localStorage limitation:** per-browser-per-device, not per-user. A subscriber on their phone won't see the watchlist they saved on their laptop. Acceptable for v1; promote to DB later if needed.
