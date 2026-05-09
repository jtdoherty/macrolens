// localStorage state with React hook integration.
//
// Uses useSyncExternalStore (React 19 / Next 16 idiomatic) so:
//  - No SSR/CSR mismatch (server snapshot is the empty default)
//  - No "setState in effect" lint warnings
//  - Cross-tab sync via the `storage` window event
//  - Components re-render when the store changes from anywhere
//
// In Phase 3 we'll mirror these to Postgres for cross-device sync; the hook
// API stays the same — only the snapshot/setter implementations change.

import { useSyncExternalStore } from 'react';
import type { Holding } from './types';

const WL_KEY = 'ml_wl';
const PORT_KEY = 'ml_port';
const SB_KEY = 'ml_sb_collapsed';

// ── Subscriber plumbing ─────────────────────────────────────────────

const subscribers = new Set<() => void>();

function notify() {
  subscribers.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  subscribers.add(cb);
  if (typeof window !== 'undefined') {
    // Cross-tab updates: another tab changing localStorage fires this.
    window.addEventListener('storage', cb);
  }
  return () => {
    subscribers.delete(cb);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', cb);
    }
  };
}

// ── Cached snapshots ────────────────────────────────────────────────
// useSyncExternalStore demands a referentially-stable snapshot when nothing
// changed. We cache the raw localStorage string and only re-parse on change.

function readJSON<T>(key: string, fallback: T, cacheRef: { raw: string | null; value: T }): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key) ?? JSON.stringify(fallback);
  if (raw !== cacheRef.raw) {
    cacheRef.raw = raw;
    try {
      cacheRef.value = JSON.parse(raw) as T;
    } catch {
      cacheRef.value = fallback;
    }
  }
  return cacheRef.value;
}

function writeJSON(key: string, value: unknown, cacheRef: { raw: string | null }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    cacheRef.raw = null; // invalidate so next read re-parses
    notify();
  } catch {
    // localStorage full or disabled — silently drop
  }
}

// ── Watchlist (string[]) ────────────────────────────────────────────

const wlCache: { raw: string | null; value: string[] } = { raw: null, value: [] };
const wlServer: string[] = [];

function watchlistSnapshot(): string[] {
  return readJSON<string[]>(WL_KEY, [], wlCache);
}

export function useWatchlist(): string[] {
  return useSyncExternalStore(subscribe, watchlistSnapshot, () => wlServer);
}

export function useIsWatched(ticker: string): boolean {
  return useWatchlist().includes(ticker);
}

export function toggleWatchlist(ticker: string): void {
  const list = watchlistSnapshot();
  const next = list.includes(ticker) ? list.filter((t) => t !== ticker) : [...list, ticker];
  writeJSON(WL_KEY, next, wlCache);
}

export function removeFromWatchlist(ticker: string): void {
  const next = watchlistSnapshot().filter((t) => t !== ticker);
  writeJSON(WL_KEY, next, wlCache);
}

// ── Portfolio (Holding[]) ───────────────────────────────────────────

const portCache: { raw: string | null; value: Holding[] } = { raw: null, value: [] };
const portServer: Holding[] = [];

function portfolioSnapshot(): Holding[] {
  return readJSON<Holding[]>(PORT_KEY, [], portCache);
}

export function usePortfolio(): Holding[] {
  return useSyncExternalStore(subscribe, portfolioSnapshot, () => portServer);
}

export function addPosition(h: Holding): void {
  writeJSON(PORT_KEY, [...portfolioSnapshot(), h], portCache);
}

export function removePosition(index: number): void {
  writeJSON(PORT_KEY, portfolioSnapshot().filter((_, i) => i !== index), portCache);
}

export function updatePositionNote(index: number, notes: string): void {
  const list = portfolioSnapshot();
  if (!list[index]) return;
  writeJSON(
    PORT_KEY,
    list.map((h, i) => (i === index ? { ...h, notes } : h)),
    portCache,
  );
}

// ── Sidebar collapsed (boolean) ─────────────────────────────────────

const sbCache: { raw: string | null; value: boolean } = { raw: null, value: false };

function sbSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = localStorage.getItem(SB_KEY);
  if (raw !== sbCache.raw) {
    sbCache.raw = raw;
    sbCache.value = raw === '1';
  }
  return sbCache.value;
}

export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, sbSnapshot, () => false);
}

export function toggleSidebarCollapsed(): void {
  if (typeof window === 'undefined') return;
  const next = !sbSnapshot();
  try {
    localStorage.setItem(SB_KEY, next ? '1' : '0');
    sbCache.raw = null;
    notify();
  } catch {}
}
