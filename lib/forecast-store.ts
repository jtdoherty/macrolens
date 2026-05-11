import { asc, eq, inArray, sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db/client';
import { forecasts } from '@/db/schema';
import { PL, PL_EXTENDED } from '@/lib/data';
import type { ForecastPayload } from '@/lib/types';

const JITTER_AMOUNT = 0.005;

function jitter(value: number): number {
  return value * (1 + (Math.random() - 0.5) * 2 * JITTER_AMOUNT);
}

export function applyForecastJitter(d: ForecastPayload): ForecastPayload {
  return {
    ...d,
    forecast_revenue_yoy: jitter(d.forecast_revenue_yoy),
    forecast_revenue: jitter(d.forecast_revenue),
    macro_only_forecast_yoy: jitter(d.macro_only_forecast_yoy),
    anchor_yoy: jitter(d.anchor_yoy),
    current_price: jitter(d.current_price),
  };
}

function mockSource(extended: boolean): Record<string, ForecastPayload> {
  return extended ? PL_EXTENDED : PL;
}

function sortPayloads(rows: ForecastPayload[]): ForecastPayload[] {
  return [...rows].sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export async function getForecasts(options: { extended?: boolean } = {}): Promise<ForecastPayload[]> {
  const extended = options.extended ?? false;

  if (!isDatabaseConfigured()) {
    return Object.values(mockSource(extended));
  }

  try {
    const db = getDb();
    const rows = extended
      ? await db.select().from(forecasts).orderBy(asc(forecasts.ticker))
      : await db
          .select()
          .from(forecasts)
          .where(eq(forecasts.isCore, true))
          .orderBy(asc(forecasts.ticker));

    if (rows.length > 0) {
      return rows.map((row) => row.payload);
    }
  } catch (err) {
    console.error('Failed to read forecasts from database; falling back to mock data.', err);
  }

  return Object.values(mockSource(extended));
}

export async function getForecastMap(options: { extended?: boolean } = {}): Promise<Record<string, ForecastPayload>> {
  const rows = await getForecasts(options);
  return Object.fromEntries(rows.map((row) => [row.ticker, row]));
}

export async function getForecast(ticker: string, options: { extended?: boolean } = {}): Promise<ForecastPayload | null> {
  const normalized = ticker.toUpperCase();

  if (!isDatabaseConfigured()) {
    return mockSource(options.extended ?? false)[normalized] ?? null;
  }

  try {
    const db = getDb();
    const [row] = await db.select().from(forecasts).where(eq(forecasts.ticker, normalized)).limit(1);
    if (row?.payload && ((options.extended ?? false) || row.isCore)) {
      return row.payload;
    }
  } catch (err) {
    console.error(`Failed to read ${normalized} forecast from database; falling back to mock data.`, err);
  }

  return mockSource(options.extended ?? false)[normalized] ?? null;
}

export async function upsertMockForecasts(options: { jitter?: boolean } = {}): Promise<number> {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured');
  }

  const db = getDb();
  const coreTickers = new Set(Object.keys(PL));
  const payloads = sortPayloads(
    Object.values(PL_EXTENDED).map((payload) => (options.jitter ? applyForecastJitter(payload) : payload)),
  );

  await db
    .insert(forecasts)
    .values(
      payloads.map((payload) => ({
        ticker: payload.ticker,
        payload,
        isCore: coreTickers.has(payload.ticker),
        updatedAt: new Date(),
      })),
    )
    .onConflictDoUpdate({
      target: forecasts.ticker,
      set: {
        payload: sql`excluded.payload`,
        isCore: sql`excluded.is_core`,
        updatedAt: new Date(),
      },
    });

  return payloads.length;
}

export async function getKnownForecastTickers(options: { extended?: boolean } = {}): Promise<string[]> {
  if (!isDatabaseConfigured()) {
    return Object.keys(mockSource(options.extended ?? false));
  }

  const requested = Object.keys(mockSource(options.extended ?? false));
  try {
    const db = getDb();
    const rows = await db
      .select({ ticker: forecasts.ticker })
      .from(forecasts)
      .where(inArray(forecasts.ticker, requested))
      .orderBy(asc(forecasts.ticker));
    return rows.length > 0 ? rows.map((row) => row.ticker) : requested;
  } catch {
    return requested;
  }
}
