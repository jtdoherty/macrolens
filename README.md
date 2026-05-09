# MacroLens

Revenue forecasting dashboard driven by macro signals. Connects FRED macro indicators to company quarterly revenue using walk-forward validated models, exposing anchor forecasts, macro signals, and adaptive blends with valuation bands per ticker.

> **Status:** Phase 1 complete — full dashboard works locally with mock data. Phase 2 (Clerk auth + Stripe paywall) is next. See [`docs/PLAN.md`](docs/PLAN.md).

## What it does

For each tracked ticker, the app shows three independent next-quarter revenue estimates:

1. **Conservative anchor** — trend-only baseline (last YoY / trailing 4Q / trailing 8Q).
2. **Macro signal only** — output of the macro model (level / delta / hybrid) with selected lagged FRED features.
3. **Macro-adjusted blend** — adaptive weighted blend of the two, with the weight chosen by walk-forward validation. **This is MacroLens's primary forecast.**

Plus a valuation band (bear / base / bull, with trustworthiness-adjusted variants), walk-forward MAE and R², and the selected macro drivers for transparency.

## Features (Phase 1)

| Page | What it does |
|------|--------------|
| `/` | Homepage with hero, summary stats, best/worst forecast tickers, macro flash strip, all-tickers table |
| `/macro` | Macro Dashboard: regime score, 6 regime chips, ticker heatmap, 18 indicators in 6 categories |
| `/screener` | Filterable table over 20 tickers (search, sector, signal, confidence, sort — all in URL) |
| `/forecast?ticker=AAPL` | Single-ticker forecast: summary cards, valuation band, 3-layer forecast, revenue chart, walk-forward stats |
| `/comparison?tickers=AAPL,MSFT,...` | Side-by-side for up to 4 tickers with revenue line + grouped YoY bar charts |
| `/portfolio` | localStorage holdings tracker with allocation donut, P&L, and forecast-YoY charts |
| `/watchlist` | Saved tickers with forecast summary (localStorage) |
| `/ticker/[symbol]?tab=overview` | Per-ticker detail with 6 tabs: Forecast, Overview, Income Statement, Balance Sheet, Cash Flow, Key Ratios |
| `/api/forecast?ticker=...&jitter=1` | JSON endpoint; `jitter=1` perturbs values ±0.5% to preview live-update behavior |

## Stack

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Chart.js** via `react-chartjs-2`
- Handwritten CSS (no Tailwind) — see `app/globals.css`
- **Hosting:** Vercel
- **Coming in Phase 2:** Clerk (auth), Stripe (subscriptions)
- **Coming in Phase 3:** Neon Postgres + Drizzle ORM, Upstash QStash (cron)

## Run locally

You need **Node 20+** and **npm** (Node 22 recommended).

```bash
git clone https://github.com/jtdoherty/macrolens.git
cd macrolens
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

That's it — no `.env` file, no API keys, no database needed in Phase 1. All data is mocked.

## Project layout

```
macrolens/
├── app/                                 Next.js App Router
│   ├── layout.tsx                       Root layout (fonts + sidebar shell)
│   ├── globals.css                      All styles (~2000 lines)
│   ├── page.tsx                         Homepage
│   ├── macro/page.tsx                   Macro Dashboard
│   ├── screener/page.tsx                Filterable ticker table
│   ├── forecast/page.tsx                Single-ticker forecast (?ticker=)
│   ├── comparison/page.tsx              Multi-ticker comparison (?tickers=)
│   ├── portfolio/page.tsx               Holdings tracker (localStorage)
│   ├── watchlist/page.tsx               Saved tickers (localStorage)
│   ├── ticker/[symbol]/
│   │   ├── page.tsx                     Per-ticker detail (?tab=)
│   │   └── _tabs/                       Tab content (private — not routable)
│   │       ├── Forecast.tsx
│   │       ├── Overview.tsx
│   │       ├── Income.tsx
│   │       ├── Balance.tsx
│   │       ├── CashFlow.tsx
│   │       └── Ratios.tsx
│   └── api/
│       └── forecast/route.ts            GET /api/forecast?ticker=...&jitter=1
├── components/
│   ├── Sidebar.tsx                      Collapsible sidebar (client)
│   ├── ScreenerFilters.tsx              Filter inputs that update URL (client)
│   ├── WatchlistStar.tsx                Star toggle button (client)
│   ├── WatchlistList.tsx                Watchlist content (client)
│   ├── PortfolioList.tsx                Portfolio form + cards (client)
│   ├── ValuationBand.tsx                Pure CSS band (server)
│   └── charts/
│       ├── RevenueChart.tsx             Single-ticker bar+line
│       ├── FinancialChart.tsx           Generic bar/line/mixed wrapper
│       ├── ComparisonCharts.tsx         Multi-ticker line + grouped bar
│       └── PortfolioCharts.tsx          Donut + P&L bar + YoY bar
├── lib/
│   ├── types.ts                         ForecastPayload, FinancialsPayload, etc.
│   ├── data.ts                          Barrel re-export
│   ├── forecasts.ts                     PL (5 core) + PL_EXTENDED (20 total)
│   ├── financials.ts                    FINANCIALS for 5 tickers
│   ├── indicators.ts                    INDS, REGIMES, group icons/colors
│   ├── helpers.ts                       fmt, pct, yc, alb, cb, sb
│   └── store.ts                         SSR-safe localStorage helpers
└── docs/
    ├── PLAN.md                          Phased build order + status. Read first.
    ├── CONTRACT.md                      Backend JSON shape (locked in)
    ├── ARCHITECTURE.md                  Directory + design decisions
    └── reference/
        └── original-design.html         Design reference (read-only)
```

## The data contract

The frontend never computes forecasts — it only renders them. The backend (currently mocked, eventually a Python service) produces JSON matching the `ForecastPayload` type defined in `lib/types.ts`. The full shape and forecast logic specification lives in [`docs/CONTRACT.md`](docs/CONTRACT.md).

If you're working on the Python forecasting side: produce JSON matching that contract and the frontend plugs it in unchanged. Don't add fields the frontend doesn't read; don't drop fields it does.

## Roadmap

- ✅ **Phase 1 — Dashboard:** All pages working with mock data. Done.
- ⬜ **Phase 2 — Auth + Paywall:** Clerk login + Stripe subscriptions.
- ⬜ **Phase 3 — DB + Cron:** Neon Postgres + hourly cron writes fresh forecasts.
- ⬜ **Phase 4 — Real Model + Launch:** Python forecast service feeds the cron, custom domain, live mode.

See [`docs/PLAN.md`](docs/PLAN.md) for the full task list.

## Scripts

| Command         | What it does                             |
|-----------------|------------------------------------------|
| `npm run dev`   | Start dev server with hot reload         |
| `npm run build` | Production build (catches type errors)   |
| `npm run start` | Run the production build                 |
| `npm run lint`  | ESLint check                             |

## License

MIT. See [`LICENSE`](LICENSE).
