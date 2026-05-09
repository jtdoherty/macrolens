import type { AnchorKind, Confidence, SignalLabel } from './types';

// Format a dollar amount, scaled to B/M/raw.
export const fmt = (v: number): string => {
  const a = Math.abs(v);
  if (a >= 1e9) return '$' + (v / 1e9).toFixed(1) + 'B';
  if (a >= 1e6) return '$' + (v / 1e6).toFixed(0) + 'M';
  return '$' + v.toFixed(2);
};

// Format a fraction as a signed percent (e.g. 0.062 → "+6.2%").
export const pct = (v: number, d = 1): string =>
  (v >= 0 ? '+' : '') + (v * 100).toFixed(d) + '%';

// CSS class for a YoY value's color (up/down/flat).
export const yc = (v: number): 'up' | 'dn' | 'fl' =>
  v > 0.004 ? 'up' : v < -0.004 ? 'dn' : 'fl';

// Human-readable label for an anchor kind.
export const alb = (a: AnchorKind | string): string =>
  ({
    last_yoy: 'Last YoY',
    trailing_4q: 'Trailing 4Q Avg',
    trailing_8q: 'Trailing 8Q Avg',
  } as Record<string, string>)[a] || a;

// Badge class for confidence level.
export const cb = (c: Confidence | string): string =>
  ({
    High: 'bg2',
    Medium: 'ba2',
    Low: 'br2',
    Unreliable: 'bx2',
  } as Record<string, string>)[c] || 'bx2';

// Badge class for macro signal direction.
export const sb = (s: SignalLabel | string): string =>
  s.includes('Upside') ? 'bg2' : s.includes('Downside') ? 'br2' : 'bx2';
