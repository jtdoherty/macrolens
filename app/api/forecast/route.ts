import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getForecast, getForecasts, applyForecastJitter } from '@/lib/forecast-store';
import { getUserSubscription, isActiveStatus } from '@/lib/subscription';

// GET /api/forecast?ticker=AAPL[&jitter=1][&extended=1]
//
// Phase 3 reads from Postgres when DATABASE_URL is configured and rows exist.
// Local development without a DB falls back to the in-memory mock data.
//
// jitter=1 applies a ±0.5% deterministic-per-call perturbation so the dashboard
// visibly "updates" when refreshed — placeholder for the eventual hourly cron
// that will write fresh forecasts (Phase 3 step 1.19).

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sub = await getUserSubscription(userId);
  if (!isActiveStatus(sub?.subscriptionStatus ?? null)) {
    return NextResponse.json(
      { error: 'subscription_required', message: 'Active MacroLens Pro subscription required.' },
      { status: 402 },
    );
  }

  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const useExtended = searchParams.get('extended') === '1';
  const useJitter = searchParams.get('jitter') === '1';

  if (ticker) {
    const d = await getForecast(ticker, { extended: useExtended });
    if (!d) {
      return NextResponse.json({ error: 'Ticker not found' }, { status: 404 });
    }
    return NextResponse.json(useJitter ? applyForecastJitter(d) : d, {
      headers: { 'Cache-Control': useJitter ? 'no-store' : 'public, max-age=60' },
    });
  }

  const all = await getForecasts({ extended: useExtended });
  return NextResponse.json(useJitter ? all.map(applyForecastJitter) : all, {
    headers: { 'Cache-Control': useJitter ? 'no-store' : 'public, max-age=60' },
  });
}
