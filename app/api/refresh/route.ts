import { NextResponse } from 'next/server';
import { isDatabaseConfigured } from '@/db/client';
import { upsertMockForecasts } from '@/lib/forecast-store';

async function refreshForecasts(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  if (!cronSecret && process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      {
        error: 'cron_secret_not_configured',
        message: 'Set CRON_SECRET before enabling production refreshes.',
      },
      { status: 500 },
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'database_not_configured', message: 'Set DATABASE_URL before refreshing forecasts.' },
      { status: 500 },
    );
  }

  const count = await upsertMockForecasts({ jitter: true });
  return NextResponse.json(
    { ok: true, count, refreshedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(request: Request) {
  return refreshForecasts(request);
}

export async function POST(request: Request) {
  return refreshForecasts(request);
}
