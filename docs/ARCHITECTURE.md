# Architecture Notes

## Directory layout (actual, as of Phase 1 complete)

```
macrolens/
├── app/
│   ├── layout.tsx                       Root layout: fonts, globals.css, sidebar shell
│   ├── globals.css                      All styles (~2000 lines, ported from reference HTML)
│   ├── page.tsx                         Homepage (will become public landing in Phase 2)
│   ├── macro/page.tsx                   Macro Dashboard (server component)
│   ├── screener/page.tsx                Filterable table; reads searchParams
│   ├── forecast/page.tsx                Single-ticker view; reads ?ticker=
│   ├── comparison/page.tsx              Multi-ticker compare; reads ?tickers=
│   ├── portfolio/page.tsx               Server shell + client list
│   ├── watchlist/page.tsx               Server shell + client list
│   ├── ticker/[symbol]/
│   │   ├── page.tsx                     Hero + tabs nav + dispatch
│   │   └── _tabs/                       Tab content (underscore = not routable)
│   │       ├── Forecast.tsx
│   │       ├── Overview.tsx
│   │       ├── Income.tsx
│   │       ├── Balance.tsx
│   │       ├── CashFlow.tsx
│   │       └── Ratios.tsx
│   └── api/
│       └── forecast/route.ts            GET /api/forecast — supports ticker, extended, jitter
├── components/
│   ├── Sidebar.tsx                      'use client' — collapse state + active route
│   ├── ScreenerFilters.tsx              'use client' — inputs that update URL via useRouter
│   ├── WatchlistStar.tsx                'use client' — toggle star button
│   ├── WatchlistList.tsx                'use client' — reads localStorage on mount
│   ├── PortfolioList.tsx                'use client' — form, holdings, embedded charts
│   ├── ValuationBand.tsx                Server — pure CSS band (no canvas)
│   └── charts/
│       ├── RevenueChart.tsx             'use client' — bar + line overlay (single ticker)
│       ├── FinancialChart.tsx           'use client' — generic bar/line/mixed wrapper
│       ├── ComparisonCharts.tsx         'use client' — multi-line + grouped bar
│       └── PortfolioCharts.tsx          'use client' — donut + P&L bar + YoY bar
├── lib/
│   ├── types.ts                         ForecastPayload, FinancialsPayload, Indicator, Holding
│   ├── data.ts                          Barrel re-export of all mock data
│   ├── forecasts.ts                     PL (5 core) + PL_EXTENDED (15 more, 20 total)
│   ├── financials.ts                    FINANCIALS — 5y annual + 12q quarterly + ratios per ticker
│   ├── indicators.ts                    INDS, FLASH_INDS, REGIMES, GROUP_* maps
│   ├── helpers.ts                       fmt, pct, yc, alb, cb, sb
│   └── store.ts                         SSR-safe localStorage helpers (watchlist + portfolio)
├── docs/
│   ├── PLAN.md                          Phased build order with checkboxes + status
│   ├── CONTRACT.md                      Backend JSON shape (locked in)
│   ├── ARCHITECTURE.md                  This file
│   └── reference/
│       └── original-design.html         Friend's design (read-only reference)
├── public/                              Static assets
├── AGENTS.md                            Cross-tool AI guidance (Cursor, Codex, etc.)
├── CLAUDE.md                            Claude Code project memory (imports AGENTS.md)
├── README.md                            Collaborator-facing project intro
├── LICENSE                              MIT
├── package.json
├── tsconfig.json
└── next.config.ts
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

### Data flow (Phase 1)

```
lib/data.ts (mock TS const)
   ↓ imported directly by server components
   ↓ also exposed via /api/forecast for future client fetches
[page.tsx renders]
```

In Phase 1 it's fine for server components to import `lib/data.ts` directly — no auth gating yet. Phase 2 makes dashboard pages fetch from `/api/forecast` instead so the subscription check applies.

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
| Subscription state | DB (Phase 3)                     | —                                      |
| Forecast data      | mock const → DB (Phase 3)        | —                                      |
| User profile       | Clerk (Phase 2)                  | Don't duplicate into our DB            |

## Auth gate plan (Phase 2 preview)

The friend's HTML had a custom `#auth-screen` overlay. We're replacing it entirely:

- **Public routes:** `/`, `/pricing`, `/sign-in/*`, `/sign-up/*` (Clerk-rendered)
- **Gated routes:** everything dashboard-related (will live under `app/(dashboard)/`) — Clerk middleware redirects to `/sign-in` if no session
- **Subscription gate:** API routes call `auth()` + check Stripe subscription before returning data; UI shows a "Subscribe" prompt for routes that need it

When Phase 2 lands, the existing dashboard pages (`macro`, `screener`, `forecast`, `comparison`, `portfolio`, `watchlist`, `ticker/[symbol]`) move into `app/(dashboard)/` so they can share an auth-checking layout. The route group is invisible in the URL (`/macro` stays `/macro`).

## Vercel deploy notes

The app deploys to Vercel out of the box — no env vars in Phase 1, no native dependencies, no filesystem reads at runtime. The build that passes locally is the same build Vercel runs. Static routes are pre-rendered; dynamic routes (anything reading `searchParams` or `params`) render on each request.

The only Phase 1 limitation: **localStorage is per-browser-per-device, not per-user.** A subscriber on their phone won't see the watchlist they saved on their laptop. That's expected for v1 and gets fixed in Phase 3 if we promote to DB.
