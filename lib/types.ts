// Source of truth for the data shape produced by the backend.
// See docs/CONTRACT.md.

export type ModelMode = 'level' | 'delta' | 'hybrid';
export type AnchorKind = 'last_yoy' | 'trailing_4q' | 'trailing_8q';
export type Confidence = 'High' | 'Medium' | 'Low' | 'Unreliable';
export type SignalLabel =
  | 'Strong Upside'
  | 'Modest Upside'
  | 'Neutral'
  | 'Modest Downside'
  | 'Strong Downside';

export type RevenuePoint = { q: string; v: number };

export type ValuationBand = {
  bear: number;
  base: number;
  bull: number;
  trustworthy_bear: number;
  trustworthy_base: number;
  trustworthy_bull: number;
};

export type ForecastPayload = {
  ticker: string;
  sector?: string;
  industry?: string;
  forecast_quarter: string;

  selected_model_mode: ModelMode;
  selected_anchor: AnchorKind;
  macro_weight: number;

  forecast_revenue_yoy: number;
  forecast_revenue: number;
  macro_only_forecast_yoy: number;
  anchor_yoy: number;

  macro_signal_label: SignalLabel;
  confidence: Confidence;

  walk_forward_mae: number;
  walk_forward_r2: number;

  selected_features: string[];
  selected_lags: number[];

  revenue_history: RevenuePoint[];

  current_price: number;
  shares?: number;

  valuation_band: ValuationBand;
};

// Per-ticker financials (annual + quarterly statements + ratios).
// Used by the ticker detail page.
export type AnnualStatements = {
  years: string[];
  revenue: number[];
  gross_profit: number[];
  operating_income: number[];
  net_income: number[];
  total_assets: number[];
  total_debt: number[];
  equity: number[];
  op_cash_flow: number[];
  capex: number[];
  fcf: number[];
};

export type QuarterlyStatements = {
  periods: string[];
  revenue: number[];
  gross_profit: number[];
  operating_income: number[];
  net_income: number[];
  op_cash_flow: number[];
  capex: number[];
  fcf: number[];
};

export type Ratios = {
  pe: number;
  ps: number;
  ev_ebitda: number;
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  roe: number;
  roa: number;
  debt_equity: number;
  current_ratio: number;
};

export type FinancialsPayload = {
  name: string;
  exchange: string;
  market_cap: number;
  shares: number;
  annual: AnnualStatements;
  quarterly: QuarterlyStatements;
  ratios: Ratios;
};

// Macro indicator (FRED-style series snapshot).
export type IndicatorSignal = 'Upside' | 'Downside' | 'Caution' | 'Neutral';
export type Indicator = {
  n: string;          // name
  v: number;          // current value
  p: number;          // previous value
  u: string;          // unit suffix (%, $B, etc.)
  g: string;          // group (Rates, Consumer, Industry, Housing, Inflation, Global)
  s: IndicatorSignal;
};

// User-side state (stored in localStorage in v1, possibly DB later).
export type Holding = {
  ticker: string;
  shares: number;
  avgCost: number;
  date?: string;
  notes?: string;
};
