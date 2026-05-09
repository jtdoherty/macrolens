// Barrel re-export for mock data. Keeps imports tidy: `import { PL } from '@/lib/data'`.
// Real source files: forecasts.ts, financials.ts, indicators.ts.

export { PL, PL_EXTENDED } from './forecasts';
export { FINANCIALS } from './financials';
export { INDS, FLASH_INDS, REGIMES, GROUP_ICONS, GROUP_COLORS, INDICATOR_GROUPS } from './indicators';
export type { RegimeChip } from './indicators';
