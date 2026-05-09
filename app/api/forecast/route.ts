import { NextResponse } from 'next/server';
import { PL, PL_EXTENDED } from '@/lib/data';
import type { ForecastPayload } from '@/lib/types';

// GET /api/forecast?ticker=AAPL[&jitter=1][&extended=1]
//
// Phase 1 returns the in-memory mock from lib/data. Phase 3 will swap this for
// a Postgres read after gating on Stripe subscription status.
//
// jitter=1 applies a ±0.5% deterministic-per-call perturbation so the dashboard
// visibly "updates" when refreshed — placeholder for the eventual hourly cron
// that will write fresh forecasts (Phase 3 step 1.19).

const JITTER_AMOUNT = 0.005;

function jitter(value: number): number {
  return value * (1 + (Math.random() - 0.5) * 2 * JITTER_AMOUNT);
}

function applyJitter(d: ForecastPayload): ForecastPayload {
  return {
    ...d,
    forecast_revenue_yoy: jitter(d.forecast_revenue_yoy),
    forecast_revenue: jitter(d.forecast_revenue),
    macro_only_forecast_yoy: jitter(d.macro_only_forecast_yoy),
    anchor_yoy: jitter(d.anchor_yoy),
    current_price: jitter(d.current_price),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const useExtended = searchParams.get('extended') === '1';
  const useJitter = searchParams.get('jitter') === '1';

  const source = useExtended ? PL_EXTENDED : PL;

  if (ticker) {
    const d = source[ticker];
    if (!d) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
    }
    return NextResponse.json(useJitter ? applyJitter(d) : d, {
      headers: { 'Cache-Control': useJitter ? 'no-store' : 'public, max-age=60' },
    });
  }

  const all = Object.values(source);
  return NextResponse.json(useJitter ? all.map(applyJitter) : all, {
    headers: { 'Cache-Control': useJitter ? 'no-store' : 'public, max-age=60' },
  });
}
