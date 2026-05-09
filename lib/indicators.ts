// Macro indicators (FRED-style snapshots).
// Source: extracted from docs/reference/original-design.html.

import type { Indicator } from './types';

export const INDS: Indicator[] = [
  { n: '10Y Treasury Yield', v: 4.38, p: 4.52, u: '%', g: 'Rates', s: 'Neutral' },
  { n: '2Y Treasury Yield', v: 4.81, p: 4.73, u: '%', g: 'Rates', s: 'Caution' },
  { n: 'Fed Funds Rate', v: 5.25, p: 5.25, u: '%', g: 'Rates', s: 'Neutral' },
  { n: 'IG Credit Spreads', v: 1.12, p: 1.08, u: '%', g: 'Rates', s: 'Caution' },
  { n: 'Retail Sales MoM', v: 0.7, p: -0.2, u: '%', g: 'Consumer', s: 'Upside' },
  { n: 'Consumer Sentiment', v: 79.4, p: 76.9, u: '', g: 'Consumer', s: 'Upside' },
  { n: 'PCE YoY', v: 2.7, p: 2.5, u: '%', g: 'Consumer', s: 'Caution' },
  { n: 'Consumer Credit', v: 15.2, p: 11.3, u: '$B', g: 'Consumer', s: 'Neutral' },
  { n: 'ISM Manufacturing', v: 49.2, p: 50.3, u: '', g: 'Industry', s: 'Downside' },
  { n: 'ISM Services', v: 53.8, p: 51.4, u: '', g: 'Industry', s: 'Upside' },
  { n: 'Industrial Production', v: 0.4, p: -0.1, u: '%', g: 'Industry', s: 'Neutral' },
  { n: 'Housing Starts', v: 1.36, p: 1.42, u: 'M', g: 'Housing', s: 'Caution' },
  { n: 'Existing Home Sales', v: 4.14, p: 4.38, u: 'M', g: 'Housing', s: 'Downside' },
  { n: 'Case-Shiller HPI', v: 7.3, p: 6.8, u: '%', g: 'Housing', s: 'Neutral' },
  { n: 'CPI YoY', v: 3.4, p: 3.2, u: '%', g: 'Inflation', s: 'Caution' },
  { n: 'Core CPI YoY', v: 3.8, p: 3.9, u: '%', g: 'Inflation', s: 'Neutral' },
  { n: 'PPI YoY', v: 2.2, p: 1.6, u: '%', g: 'Inflation', s: 'Neutral' },
  { n: 'DXY', v: 104.2, p: 103.8, u: '', g: 'Global', s: 'Neutral' },
];

// Subset shown on the homepage macro flash strip.
export const FLASH_INDS = [
  { n: '10Y Yield', v: 4.38, p: 4.52, u: '%' },
  { n: 'ISM Mfg', v: 49.2, p: 50.3, u: '' },
  { n: 'ISM Svcs', v: 53.8, p: 51.4, u: '' },
  { n: 'CPI YoY', v: 3.4, p: 3.2, u: '%' },
  { n: 'Retail Sales', v: 0.7, p: -0.2, u: '%' },
  { n: 'Consumer Sent.', v: 79.4, p: 76.9, u: '' },
  { n: 'PCE YoY', v: 2.7, p: 2.5, u: '%' },
  { n: 'DXY', v: 104.2, p: 103.8, u: '' },
];

// Macro regime chips on the dashboard hero.
export type RegimeChip = {
  label: string;
  value: string;
  sub: string;
  cls: 'up' | 'dn' | 'fl';
  icon: string;
};

export const REGIMES: RegimeChip[] = [
  { label: 'Growth Phase', value: 'Late Cycle', sub: 'ISM Mfg contracting; Services expanding', cls: 'fl', icon: '📉' },
  { label: 'Rate Environment', value: 'Restrictive', sub: 'Fed Funds 5.25% — holding steady', cls: 'dn', icon: '🏦' },
  { label: 'Consumer Health', value: 'Resilient', sub: 'Sentiment +3.2pts, retail rebounding', cls: 'up', icon: '🛍️' },
  { label: 'Inflation Trend', value: 'Sticky', sub: 'CPI 3.4% — not resuming ascent', cls: 'fl', icon: '📊' },
  { label: 'Housing', value: 'Cooling', sub: 'Starts −4.2%, Existing sales −5.5%', cls: 'dn', icon: '🏠' },
  { label: 'Global / FX', value: 'USD Firm', sub: 'DXY 104.2 — mild headwind to exporters', cls: 'fl', icon: '🌐' },
];

export const GROUP_ICONS: Record<string, string> = {
  Rates: '💵', Consumer: '🛍️', Industry: '🏭', Housing: '🏠', Inflation: '📈', Global: '🌐',
};

export const GROUP_COLORS: Record<string, string> = {
  Rates: '#3b5bdb', Consumer: '#0d9e6e', Industry: '#6c47ff',
  Housing: '#c47a0c', Inflation: '#e03e3e', Global: '#0891b2',
};

export const INDICATOR_GROUPS = ['Rates', 'Consumer', 'Industry', 'Housing', 'Inflation', 'Global'] as const;
