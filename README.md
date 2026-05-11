# MacroLens

Revenue forecasting dashboard driven by macro signals. Connects FRED macro indicators to company quarterly revenue using walk-forward validated models, exposing anchor forecasts, macro signals, and adaptive blends with valuation bands per ticker.

> **Status:** Live in production at [macrolens-six.vercel.app](https://macrolens-six.vercel.app/). Phase 3 (Neon Postgres + Vercel Cron) complete. Phase 4 (real Python forecast service + custom domain + Stripe live mode) is next. See [`docs/PLAN.md`](docs/PLAN.md). For day-to-day monitoring, see [`docs/OPERATIONS.md`](docs/OPERATIONS.md).

## What it does

For each tracked ticker, the app shows three independent next-quarter revenue estimates:

1. **Conservative anchor** — trend-only baseline (last YoY / trailing 4Q / trailing 8Q).
2. **Macro signal only** — output of the macro model (level / delta / hybrid) with selected lagged FRED features.
3. **Macro-adjusted blend** — adaptive weighted blend of the two, with the weight chosen by walk-forward validation. **This is MacroLens's primary forecast.**

Plus a valuation band (bear / base / bull, with trustworthiness-adjusted variants), walk-forward MAE and R², and the selected macro drivers for transparency.

## Features

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
- **Auth/payments:** Clerk + Stripe Checkout subscriptions ($1/mo, 7-day trial)
- **DB:** Neon Postgres + Drizzle ORM (forecasts + subscriptions tables)
- **Cron:** Vercel Cron, daily at 10:00 UTC → `/api/refresh`

## Run locally

You need **Node 20+** and **npm** (Node 22 recommended).

```bash
git clone https://github.com/jtdoherty/macrolens.git
cd macrolens
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For dashboard-only local exploration, forecast pages fall back to mock data when `DATABASE_URL` is not set. Auth, Stripe, database migrations, and cron refreshes require the relevant `.env.local` values.

## Project layout

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full directory tree. Quick summary:

- `app/(dashboard)/` — Clerk + subscription gated pages
- `app/(auth)/` — Clerk-rendered sign-in / sign-up
- `app/api/forecast/` — JSON endpoint, DB-backed, gated
- `app/api/refresh/` — Vercel Cron target, gated by `CRON_SECRET`
- `app/api/stripe/{checkout,post-checkout,webhook}/` — Stripe integration
- `lib/forecast-store.ts` — DB-first forecast reads with mock fallback
- `lib/subscription.ts` — DB-first subscription state, mirrored to Clerk
- `db/` — Drizzle schema + generated migrations
- `proxy.ts` — Clerk middleware (Next.js 16 renamed `middleware.ts` → `proxy.ts`)
- `vercel.json` — daily cron schedule

## The data contract

The frontend never computes forecasts — it only renders them. The backend (currently mocked, eventually a Python service) produces JSON matching the `ForecastPayload` type defined in `lib/types.ts`. The full shape and forecast logic specification lives in [`docs/CONTRACT.md`](docs/CONTRACT.md).

If you're working on the Python forecasting side: produce JSON matching that contract and the frontend plugs it in unchanged. Don't add fields the frontend doesn't read; don't drop fields it does.

## Roadmap

- ✅ **Phase 1 — Dashboard:** All pages working with mock data.
- ✅ **Phase 2 — Auth + Paywall:** Clerk login + Stripe Checkout with 7-day trial.
- ✅ **Phase 3 — DB + Cron:** Neon Postgres + Drizzle + daily Vercel Cron refresh. Subscription source of truth in DB, mirrored to Clerk metadata for fast middleware.
- ⬜ **Phase 4 — Real Model + Launch:** Python forecast service feeds the cron, custom domain, Stripe live mode.

See [`docs/PLAN.md`](docs/PLAN.md) for the full task list.

## Scripts

| Command         | What it does                             |
|-----------------|------------------------------------------|
| `npm run dev`   | Start dev server with hot reload         |
| `npm run build` | Production build (catches type errors)   |
| `npm run start` | Run the production build                 |
| `npm run lint`  | ESLint check                             |
| `npm run db:generate` | Generate Drizzle migrations       |
| `npm run db:migrate` | Run Drizzle migrations against `DATABASE_URL` |

## License

MIT. See [`LICENSE`](LICENSE).
