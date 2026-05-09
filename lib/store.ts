// localStorage helpers for client-side state (watchlist, portfolio).
// In Phase 3 we'll mirror these to Postgres for cross-device sync.
//
// All functions are SSR-safe — they no-op when window is undefined.

import type { Holding } from './types';

const WL_KEY = 'ml_wl';
const PORT_KEY = 'ml_port';

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or disabled — silently drop
  }
}

// ── Watchlist (array of ticker symbols) ─────────────────────────────

export function getWatchlist(): string[] {
  return safeGet<string[]>(WL_KEY, []);
}

export function isWatched(ticker: string): boolean {
  return getWatchlist().includes(ticker);
}

export function toggleWatchlist(ticker: string): string[] {
  const list = getWatchlist();
  const next = list.includes(ticker) ? list.filter((t) => t !== ticker) : [...list, ticker];
  safeSet(WL_KEY, next);
  return next;
}

export function removeFromWatchlist(ticker: string): string[] {
  const next = getWatchlist().filter((t) => t !== ticker);
  safeSet(WL_KEY, next);
  return next;
}

// ── Portfolio (array of Holding objects) ────────────────────────────

export function getPortfolio(): Holding[] {
  return safeGet<Holding[]>(PORT_KEY, []);
}

export function addPosition(h: Holding): Holding[] {
  const next = [...getPortfolio(), h];
  safeSet(PORT_KEY, next);
  return next;
}

export function removePosition(index: number): Holding[] {
  const next = getPortfolio().filter((_, i) => i !== index);
  safeSet(PORT_KEY, next);
  return next;
}

export function updatePositionNote(index: number, notes: string): Holding[] {
  const list = getPortfolio();
  if (!list[index]) return list;
  const next = list.map((h, i) => (i === index ? { ...h, notes } : h));
  safeSet(PORT_KEY, next);
  return next;
}
