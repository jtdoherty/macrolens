# MacroLens — Build Plan

This document is the source of truth for what we're building, what's done, and where we left off. Update it as we go.

## Vision

MacroLens is a revenue forecasting dashboard. It connects FRED macro indicators to company quarterly revenue using walk-forward validated models, exposing anchor forecasts, macro signals, and adaptive blends with valuation bands per ticker.

Phase 1 ships the dashboard with mock data and no auth/payment. Later phases add Clerk auth, Stripe paywall, Postgres + cron-driven data refresh, and eventually real model output from a separate Python service.

## Stack (locked in)

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** handwritten CSS (preserved from the reference design — no Tailwind)
- **Charts:** Chart.js via `react-chartjs-2`
- **Hosting:** Vercel
- **Auth (Phase 2):** Clerk
- **Payments (Phase 2):** Stripe (Checkout + Customer Portal + webhooks)
- **DB (Phase 3):** Neon Postgres + Drizzle ORM
- **Cron (Phase 3):** Upstash QStash → `/api/refresh` route, every 1 hour
- **Domain (later):** TBD via Vercel Registrar / Cloudflare Registrar

## Architecture overview

```
[User]
  → Next.js app on Vercel
       → app/page.tsx                     (homepage — public in Phase 2)
       → app/{macro,screener,forecast,…}  (gated by Clerk + subscription in Phase 2)
       → app/ticker/[symbol]/page.tsx     (per-ticker detail with 6 tabs)
       → app/api/forecast/route.ts        (returns ticker JSON; gated in Phase 2)
       → app/api/refresh/route.ts         (Phase 3 cron target)
       → app/api/stripe/{checkout,webhook}/route.ts  (Phase 2)

[Database — Phase 3 only]
  Postgres on Neon
    - subscriptions (userId, stripeCustomerId, status, currentPeriodEnd)
    - forecasts (ticker, payload jsonb, updatedAt)

[External backend — Phase 4]
  Friend's Python service: produces JSON matching ForecastPayload type
  → cron route fetches and writes to forecasts table
```

Note: We did NOT use the `app/(dashboard)/` route group originally planned. The sidebar
lives in the root layout because Phase 1 has no public-vs-gated split. When Phase 2 lands,
we'll move dashboard pages under `app/(dashboard)/` with their own layout, leaving `/` and
`/pricing` outside the group as public routes.

## Data contract

See `docs/CONTRACT.md`. The Phase 1 mock data and the eventual Phase 4 backend MUST produce the exact same `ForecastPayload` shape. Frontend imports the type and never special-cases mock vs. real data.

## Phased build order

### Phase 1 — Dashboard with mock data (current focus)

Goal: a working multi-page Next.js app on `localhost:3000` that visually matches the reference design and uses hardcoded mock data. No auth, no payments, no DB.

- [x] 1.1 Preserve friend's `index.html` as `docs/reference/original-design.html`
- [x] 1.2 Scaffold Next.js (TS, App Router, ESLint, no Tailwind)
- [x] 1.3 Install Chart.js + react-chartjs-2
- [x] 1.4 Write `lib/types.ts` — `ForecastPayload`, `FinancialsPayload`, `Indicator`, `Holding`
- [x] 1.5 Write `lib/data.ts` — split into `lib/forecasts.ts` (PL + PL_EXTENDED, 20 tickers), `lib/financials.ts` (FINANCIALS, 5 tickers), `lib/indicators.ts` (INDS + REGIMES). Barrel export from `lib/data.ts`.
- [x] 1.6 Write `lib/helpers.ts` — `fmt`, `pct`, `yc`, `alb`, `cb`, `sb`
- [x] 1.7 Move global CSS into `app/globals.css` verbatim
- [x] 1.8 Build app shell:
  - [x] `app/layout.tsx` — fonts + globals
  - [x] sidebar in root layout (no separate dashboard route group in v1; landing page also has sidebar)
  - [x] `components/Sidebar.tsx` — navigation with `Link`, collapse state
- [x] 1.9 Port homepage at `app/page.tsx` (hero + summary stats + best/worst + macro flash + all-tickers table)
- [x] 1.10 Port `app/macro/page.tsx` — Macro Dashboard (regime hero, 6 chips, ticker heatmap, 6 indicator group cards)
- [x] 1.11 Port `app/screener/page.tsx` — server component with searchParams filters (search, sector, signal, confidence, sort) + WatchlistStar in last column
- [x] 1.12 Port `app/forecast/page.tsx` — server component with `?ticker=` searchParam, summary cards, ValuationBand, three forecast cards, RevenueChart, walk-forward, macro drivers
- [x] 1.13 Port `app/comparison/page.tsx` — server component with `?tickers=A,B,C` searchParam, multi-ticker revenue chart, grouped forecast YoY bar chart, metrics table
- [x] 1.14 Port `app/portfolio/page.tsx` — server shell + client `<PortfolioList>` with add/remove form, summary stats, allocation donut + P&L bar + forecast YoY bar charts, per-position cards
- [x] 1.15 Port `app/watchlist/page.tsx` — server shell + client `<WatchlistList>` reading from `lib/store.ts`
- [x] 1.16 Port `app/ticker/[symbol]/page.tsx` — per-ticker detail with 6 tabs (Forecast / Overview / Income / Balance / Cash Flow / Ratios) via `?tab=` searchParam, tab content in `_tabs/` private folder
- [x] 1.17a `components/charts/RevenueChart.tsx` — bar (actuals) + line overlays (macro-adj forecast + anchor)
- [x] 1.17b `components/ValuationBand.tsx` — pure CSS band with bear/base/bull markers + price pin
- [x] 1.17c `components/charts/FinancialChart.tsx` — single generic wrapper for all bar/line/mixed financial charts (replaces 6+ specialized components). Handles diverging colors, dollar/percent/ratio formats, line-on-bar overlays.
- [x] 1.18 Add `app/api/forecast/route.ts` — GET with `?ticker=`, `?extended=1`, `?jitter=1` query params. Cache-Control set per request type.
- [x] 1.19 Jitter built into the API route (`?jitter=1`). When enabled, forecast_revenue_yoy / forecast_revenue / anchor_yoy / macro_only / current_price get ±0.5% perturbation per request.
- [x] 1.20 Smoke-test in browser: walk every page, every tab, every filter combination. **Confirmed passing 2026-05-09.**

### Phase 2 — Auth + paywall

Goal: marketing landing stays public, dashboard requires Clerk login + active Stripe subscription.

- [x] 2.1 Sign up for Clerk, add `@clerk/nextjs` (v7.3.3), wrap root with `<ClerkProvider>`. Keys live in `.env.local` (gitignored).
- [x] 2.2 Add `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx` mounting `<SignIn />` / `<SignUp />`.
- [x] 2.3 Add `proxy.ts` at project root (Next.js 16 renamed `middleware.ts` → `proxy.ts`) using `clerkMiddleware()` + `createRouteMatcher`. Gates everything except `/sign-in/*`, `/sign-up/*`, and `/api/forecast` (last one stays open until 2.10).
- [x] 2.4 Add Clerk's `<UserButton />` to the sidebar footer. Reorganized routes into `app/(dashboard)/` (sidebar layout) and `app/(auth)/` (centered card on dark gradient) route groups.
- [x] 2.5 Sign up for Stripe (test mode), created `MacroLens Pro` product at $1/mo (price id `price_1TVGpc...`). `npm install stripe`. Keys + price id in `.env.local`.
- [x] 2.6 `app/api/stripe/checkout/route.ts` — creates Checkout Session via form POST, redirects to Stripe-hosted page
- [x] 2.7 `app/api/stripe/webhook/route.ts` — verifies signature, handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, writes status to Clerk `publicMetadata`. **Local dev:** install Stripe CLI and run `stripe listen --forward-to localhost:3000/api/stripe/webhook` to get the `whsec_…` value for `STRIPE_WEBHOOK_SECRET`.
- [x] 2.8 `app/(dashboard)/pricing/page.tsx` — feature list, $/mo, "Start 7-day free trial" form button. Detects already-subscribed users and shows "Open Dashboard" instead.
- [x] 2.9 7-day free trial baked into Checkout Session config (`subscription_data.trial_period_days: 7`). No card declined messaging — Stripe collects card up-front but doesn't charge until day 8.
- [x] 2.10 `/api/forecast` is now subscription-gated by `proxy.ts`. Middleware returns JSON 402 for `/api/*` routes and redirects pages to `/pricing`. Subscription state read from Clerk `publicMetadata`. Bonus: `app/api/stripe/post-checkout/route.ts` writes metadata synchronously after successful Checkout (avoids webhook-arrival race).

### Phase 3 — Database + real cron

Goal: subscription state lives in Postgres, cron writes fresh mock data every hour.

- [ ] 3.1 Sign up for Neon, create project, paste `DATABASE_URL` into Vercel env
- [ ] 3.2 `npm install drizzle-orm drizzle-kit pg`
- [ ] 3.3 Define schema in `db/schema.ts`: `subscriptions`, `forecasts`
- [ ] 3.4 Run initial migration
- [ ] 3.5 Update Stripe webhook to write to `subscriptions` table
- [ ] 3.6 Update `/api/forecast` to check `subscriptions` and read from `forecasts` table
- [ ] 3.7 Sign up for Upstash QStash, set up a 1-hour schedule hitting `/api/refresh`
- [ ] 3.8 `app/api/refresh/route.ts` — recompute mock forecasts (jitter), write to DB
- [ ] 3.9 Verify QStash actually fires hourly and DB updates

### Phase 4 — Real backend, polish, launch

- [ ] 4.1 Coordinate with friend on the Python forecast service. Two options to discuss:
      a) He hosts a service we hit from `/api/refresh`
      b) He drops `data.json` to a public URL on a schedule we read
- [ ] 4.2 Wire the cron to consume real data instead of jitter
- [ ] 4.3 Buy a domain (likely not `macrolens.com` — check `.app`, `.io`, `.xyz`)
- [ ] 4.4 Connect domain to Vercel
- [ ] 4.5 Switch Stripe to live mode
- [ ] 4.6 Smoke-test full signup → subscribe → access flow
- [ ] 4.7 Add basic error monitoring (Sentry) and analytics (Plausible) — optional

## Out of scope for v1

Explicitly skipping for now, not lost — just deferred:

- Multi-tier pricing
- Annual subscription option
- Email notifications / alerts
- User-customizable ticker lists (search/add)
- Admin dashboard
- Real forecasting model (mock until Phase 4)
- ALFRED vintage-aware backtesting
- Mobile native app

## Where we left off

Last updated: 2026-05-09. **Phase 2 is COMPLETE — all 10 steps checked off.** Auth + paywall fully wired. New visitors must sign in (Clerk) AND have an active subscription (Stripe) to see dashboard pages. The `/api/forecast` endpoint returns 402 to non-subscribers.

**Required smoke-test before claiming Phase 2 done:**

1. **Webhook secret first.** Install [Stripe CLI](https://stripe.com/docs/stripe-cli) (or skip if you've already got one set up). Then in a separate terminal:
   ```
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   It prints `Ready! Your webhook signing secret is whsec_…`. Copy that value into `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_…` and restart `npm run dev`. Keep `stripe listen` running while you test.

2. `npm run dev` and visit `http://localhost:3000`.
   - Already signed in (from Phase 2 part 1)? Should redirect to `/pricing` (you don't have a subscription yet).
   - Click "Start 7-day free trial".
   - Stripe-hosted Checkout opens. Use test card `4242 4242 4242 4242`, any future expiry, any CVC, any zip.
   - After payment, you redirect to `/?subscribed=1` — dashboard loads.
3. Sign out, sign back in, confirm you land on the dashboard (not /pricing).
4. Try `curl http://localhost:3000/api/forecast` (without cookies) — should be 401 / redirect to sign-in.

**Next session = Phase 3 (DB + cron).** Before then:
1. Sign up at [neon.tech](https://neon.tech), create a project, copy the connection string (`DATABASE_URL`).
2. Sign up at [upstash.com](https://upstash.com) for QStash (cron triggers), grab the QStash token + signing keys. (Optional — we can also use Vercel Cron once you're on Pro.)

Resume by reading the Phase 3 unchecked boxes below.
