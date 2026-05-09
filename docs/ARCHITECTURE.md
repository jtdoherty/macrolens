# Architecture Notes

## Directory layout

```
macrolens/
├── app/
│   ├── layout.tsx                      # root: fonts, providers, globals.css
│   ├── globals.css                     # ALL styles (handwritten, no framework)
│   ├── page.tsx                        # public landing/home
│   ├── (dashboard)/                    # route group, shared sidebar layout
│   │   ├── layout.tsx                  # sidebar + main area
│   │   ├── macro/page.tsx
│   │   ├── screener/page.tsx
│   │   ├── forecast/page.tsx
│   │   ├── comparison/page.tsx
│   │   ├── portfolio/page.tsx
│   │   ├── watchlist/page.tsx
│   │   └── ticker/[symbol]/page.tsx
│   └── api/
│       ├── forecast/route.ts           # GET /api/forecast?ticker=AAPL
│       ├── refresh/route.ts            # cron target (Phase 3)
│       └── stripe/                     # Phase 2
│           ├── checkout/route.ts
│           └── webhook/route.ts
├── components/
│   ├── Sidebar.tsx                     # client component (collapse state)
│   ├── ValuationBand.tsx
│   ├── RevenueChart.tsx
│   ├── ForecastCards.tsx               # the 3-layer forecast cards
│   └── ...
├── lib/
│   ├── types.ts                        # ForecastPayload, etc.
│   ├── data.ts                         # mock PL, PL_EXTENDED, FINANCIALS, INDS
│   ├── helpers.ts                      # fmt, pct, yc, alb, cb, sb
│   └── store.ts                        # localStorage helpers (watchlist, portfolio)
├── docs/
│   ├── PLAN.md                         # build plan + status
│   ├── CONTRACT.md                     # data contract
│   ├── ARCHITECTURE.md                 # this file
│   └── reference/
│       └── original-design.html        # friend's design (read-only reference)
├── public/
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Key decisions

### Routes vs. SPA tabs
Friend's HTML uses `goTo()` to switch hidden divs. We're using **real Next.js routes** (`/macro`, `/screener`, etc.). Benefits: proper URLs, back-button, future SEO on the marketing pages, cleaner code separation per page.

### Single CSS file
The friend's design has ~2000 lines of carefully-tuned CSS with multiple `:root` overrides building up the final theme. Splitting it into per-component CSS modules would risk specificity bugs. We keep it monolithic in `app/globals.css` — easier port, identical visual output.

### Client vs. Server components
Default to server components. Mark client (`'use client'`) only when needed:
- Sidebar (collapse state, active route highlight)
- Pages that use Chart.js (canvas needs window)
- Pages with localStorage state (watchlist, portfolio)
- Anything with onClick handlers

The `/api/forecast` route is a server endpoint; pages can also fetch directly from `lib/data.ts` server-side since v1 has no auth gating yet.

### Data flow (Phase 1)
```
lib/data.ts (mock TS const)
   ↓
app/api/forecast/route.ts (returns it, with optional ?ticker= filter)
   ↓
client component fetches → renders chart/table
```

When the API route adds jitter, every page refresh gets slightly fresh numbers without changing the source.

### Why no Tailwind
The reference design has very specific aesthetics — gradient text, layered shadows, custom keyframes — that translate cleanly to handwritten CSS but would be tedious in Tailwind utility classes. The CSS is also already written. Switching costs nothing now, costs a day later.

### Charts
`react-chartjs-2` over raw Chart.js — handles React's render cycle and chart cleanup correctly. Same Chart.js options object the friend already wrote will plug in directly.

## State persistence

| State              | Storage                       | When to migrate to DB              |
|--------------------|-------------------------------|------------------------------------|
| Sidebar collapsed  | localStorage                  | Never — UI state                   |
| Watchlist          | localStorage                  | Phase 3 if we want cross-device    |
| Portfolio          | localStorage                  | Phase 3 if we want cross-device    |
| Subscription state | DB (Phase 3)                  | —                                  |
| Forecast data      | mock const → DB (Phase 3)     | —                                  |
| User profile       | Clerk (Phase 2)               | —                                  |

Watchlist/portfolio stay in localStorage indefinitely unless the user wants them to sync. That's fine — it's per-device and we can promote to DB later without changing the UI shape.

## Auth gate plan (Phase 2 preview)

The friend's HTML has a custom `#auth-screen` that overlays `#main-app`. We're replacing this entirely:

- Public routes: `/`, `/pricing`, `/sign-in`, `/sign-up` (Clerk-rendered)
- Gated routes: everything under `(dashboard)/` — middleware redirects to `/sign-in` if no session
- Subscription gate: API routes check `auth()` + Stripe subscription before returning data; UI shows a "Subscribe" prompt for routes that need it

The `devBypass()` button from the friend's HTML is gone — Clerk has built-in dev/preview environments.
