# MacroLens

Revenue forecasting dashboard driven by macro signals. Connects FRED macro indicators to company quarterly revenue using walk-forward validated models, exposing anchor forecasts, macro signals, and adaptive blends with valuation bands per ticker.

> **Status:** Phase 1 — Next.js scaffold with mock data. See [`docs/PLAN.md`](docs/PLAN.md) for the full roadmap and current progress.

## What it does

For each tracked ticker, the app shows three independent next-quarter revenue estimates:

1. **Conservative anchor** — trend-only baseline (last YoY / trailing 4Q / trailing 8Q).
2. **Macro signal only** — output of the macro model (level / delta / hybrid) with selected lagged FRED features.
3. **Macro-adjusted blend** — adaptive weighted blend of the two, with the weight chosen by walk-forward validation. **This is MacroLens's primary forecast.**

Plus a valuation band (bear / base / bull, with trustworthiness-adjusted variants), walk-forward MAE and R², and the selected macro drivers for transparency.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Chart.js** via `react-chartjs-2`
- Handwritten CSS (no Tailwind) — see `app/globals.css`
- Hosting target: **Vercel**
- Future: **Clerk** (auth), **Stripe** (subscriptions), **Neon Postgres** + **Drizzle** (data), **Upstash QStash** (cron)

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
├── app/                       Next.js App Router
│   ├── layout.tsx             root layout (fonts + sidebar)
│   ├── page.tsx               homepage (hero + dashboard preview)
│   ├── globals.css            ALL styles
│   ├── macro/                 Macro Dashboard
│   ├── screener/              Ticker screener with filters
│   ├── forecast/              Single-ticker forecast view
│   ├── comparison/            Side-by-side comparison
│   ├── portfolio/             Holdings tracker (localStorage)
│   ├── watchlist/             Saved tickers (localStorage)
│   └── ticker/[symbol]/       Per-ticker detail (financials, charts, ratios)
├── components/                React components (Sidebar, charts, etc.)
├── lib/
│   ├── types.ts               ForecastPayload, FinancialsPayload, Indicator
│   ├── data.ts                Mock data — replaced by DB in Phase 3
│   └── helpers.ts             fmt, pct, yc, alb, cb, sb
└── docs/
    ├── PLAN.md                Phased build order + status. Read first.
    ├── CONTRACT.md            Backend JSON shape (locked in)
    ├── ARCHITECTURE.md        Directory + design decisions
    └── reference/
        └── original-design.html   Reference design from initial sketch
```

## The data contract

The frontend never computes forecasts — it only renders them. The backend (currently mocked, eventually a Python service) produces JSON matching the `ForecastPayload` type defined in `lib/types.ts`. The full shape and forecast logic specification lives in [`docs/CONTRACT.md`](docs/CONTRACT.md).

If you're working on the Python forecasting side: produce JSON matching that contract and the frontend plugs it in unchanged. Don't add fields the frontend doesn't read; don't drop fields it does.

## Roadmap

- **Phase 1 (in progress):** All pages working with mock data.
- **Phase 2:** Clerk auth + Stripe paywall.
- **Phase 3:** Neon Postgres + hourly cron writes fresh forecasts.
- **Phase 4:** Real Python forecast service feeds the cron, custom domain, launch.

See [`docs/PLAN.md`](docs/PLAN.md) for the full task list.

## Scripts

| Command         | What it does                             |
|-----------------|------------------------------------------|
| `npm run dev`   | Start dev server with hot reload         |
| `npm run build` | Production build (catches type errors)   |
| `npm run start` | Run the production build                 |
| `npm run lint`  | ESLint check                             |
