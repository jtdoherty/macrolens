@AGENTS.md

# MacroLens — Claude project notes

Project-specific guidance. Shared cross-tool guidance lives in `AGENTS.md` (imported above).

## Read first

- **`docs/PLAN.md`** — phased build order with checkboxes and "where we left off." Single source of truth for what's done and what's next.
- **`docs/CONTRACT.md`** — the `ForecastPayload` JSON shape the backend produces. Frontend MUST be aligned to this; never special-case mock vs. real data.
- **`docs/ARCHITECTURE.md`** — directory layout and key design decisions.
- **`docs/reference/original-design.html`** — the friend's reference design. Read-only; we port FROM it.

## What this project is

Revenue forecasting dashboard. Connects FRED macro indicators to company quarterly revenue using walk-forward validated models. The frontend renders three forecast layers (anchor, macro-only, adaptive blend) plus a valuation band per ticker. The forecasting math lives in a separate Python service (Phase 4); the frontend only consumes its JSON.

## Stack and conventions

- **Next.js 16 (App Router) + TypeScript.** Default to Server Components. Mark `'use client'` only for: Sidebar (collapse state), pages using Chart.js, pages using localStorage, anything with onClick.
- **Routing is real Next.js routes** — not client-side tab switching. Each sidebar item is its own page under `app/`.
- **CSS is monolithic** — all styles in `app/globals.css` (1969 lines, ported verbatim from the reference HTML). Don't split into per-component CSS modules; the cascade is intentional.
- **Charts use `react-chartjs-2`**, not raw Chart.js — handles React lifecycle correctly.
- **No Tailwind.** Handwritten CSS matches the reference design's gradients, shadows, and keyframes.
- **TypeScript is strict.** Run `npm run build` to catch errors before committing.
- **Path alias `@/*`** points to project root (`@/lib/data`, `@/components/Sidebar`).

## Data flow

```
lib/data.ts (mock TS const)
   ↓
app/api/forecast/route.ts (Phase 1.18; Phase 3 reads from DB)
   ↓
client component fetches → renders chart/table
```

In Phase 1 it's also fine for server components to import `lib/data.ts` directly — no auth gating yet. When Phase 2 lands, dashboard pages must go through the API route so the subscription check applies.

## State persistence

| State              | Storage                          | Notes                                  |
|--------------------|----------------------------------|----------------------------------------|
| Sidebar collapsed  | localStorage (`ml_sb_collapsed`) | UI state, never moves to DB            |
| Watchlist          | localStorage (`ml_wl`)           | Promote to DB later if cross-device    |
| Portfolio          | localStorage (`ml_port`)         | Promote to DB later if cross-device    |
| Subscription state | DB (Phase 3)                     | Written by Stripe webhook              |
| Forecast data      | mock const → DB (Phase 3)        | Written by hourly cron                 |
| User profile       | Clerk (Phase 2)                  | Don't duplicate into our DB            |

## What NOT to do

- **Don't implement forecasting math in the frontend.** No PCA, walk-forward, FRED/SEC parsing. That's the Python service's job.
- **Don't split `app/globals.css` into modules.** The reference design's cascade is load-bearing.
- **Don't bring back the friend's localStorage auth screen.** Clerk replaces it in Phase 2.
- **Don't add fields to `ForecastPayload` casually.** Update `docs/CONTRACT.md` in the same commit and explain why.
- **Don't introduce Tailwind, CSS-in-JS, or another styling system.**
- **Don't pre-build Phase 2/3 features into Phase 1.** The plan is intentionally phased.
- **Don't read localStorage with `useEffect(() => setState(...), [])`.** That's a `react-hooks/set-state-in-effect` lint error in React 19. Use the `useWatchlist()` / `usePortfolio()` / `useSidebarCollapsed()` hooks from `lib/store.ts` — they wrap `useSyncExternalStore` correctly with cached snapshots and cross-tab sync.
- **Don't use `<link>` tags for Google Fonts.** Use `next/font/google` (see `app/layout.tsx`) for proper self-hosting and zero layout shift.

## Commands

```bash
npm run dev      # dev server with HMR
npm run build    # production build, catches type errors
npm run lint     # ESLint
```

## Updating the plan

After completing any item in `docs/PLAN.md`, mark its checkbox and update the "Where we left off" section at the bottom. That's how the next session resumes quickly.
