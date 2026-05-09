// Forecast payloads (anchor + macro + blend) per ticker.
// Source: extracted from docs/reference/original-design.html.
// Replaced by Python service output in Phase 4.

import type { ForecastPayload } from './types';

// Core 5 tickers — have full revenue history and appear on the homepage.
export const PL: Record<string, ForecastPayload> = {
  AAPL: {
    ticker: 'AAPL', sector: 'Technology', forecast_quarter: 'Q2 2025',
    selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.3,
    forecast_revenue_yoy: 0.062, forecast_revenue: 97.8e9,
    macro_only_forecast_yoy: 0.091, macro_signal_label: 'Modest Upside',
    confidence: 'High', walk_forward_mae: 0.018, walk_forward_r2: 0.61,
    selected_features: ['Consumer Sentiment', 'Retail Sales ex-Auto', 'PCE Services', '10Y Treasury'],
    selected_lags: [4, 4, 2, 3], anchor_yoy: 0.051,
    revenue_history: [
      { q: 'Q2 22', v: 82.96e9 }, { q: 'Q3 22', v: 90.15e9 }, { q: 'Q4 22', v: 117.15e9 },
      { q: 'Q1 23', v: 94.84e9 }, { q: 'Q2 23', v: 81.80e9 }, { q: 'Q3 23', v: 89.50e9 },
      { q: 'Q4 23', v: 119.58e9 }, { q: 'Q1 24', v: 90.75e9 }, { q: 'Q2 24', v: 85.78e9 },
      { q: 'Q3 24', v: 94.93e9 }, { q: 'Q4 24', v: 124.30e9 }, { q: 'Q1 25', v: 95.36e9 },
    ],
    current_price: 196.40, shares: 15.2e9,
    valuation_band: { bear: 155, base: 198, bull: 248, trustworthy_bear: 148, trustworthy_base: 198, trustworthy_bull: 255 },
  },
  MSFT: {
    ticker: 'MSFT', sector: 'Technology', forecast_quarter: 'Q2 2025',
    selected_model_mode: 'level', selected_anchor: 'trailing_4q', macro_weight: 0.2,
    forecast_revenue_yoy: 0.138, forecast_revenue: 70.1e9,
    macro_only_forecast_yoy: 0.152, macro_signal_label: 'Strong Upside',
    confidence: 'High', walk_forward_mae: 0.012, walk_forward_r2: 0.74,
    selected_features: ['ISM Services', 'PCE Services', '10Y Treasury', 'Credit Spreads'],
    selected_lags: [2, 2, 4, 3], anchor_yoy: 0.128,
    revenue_history: [
      { q: 'Q2 22', v: 49.36e9 }, { q: 'Q3 22', v: 50.12e9 }, { q: 'Q4 22', v: 52.75e9 },
      { q: 'Q1 23', v: 56.19e9 }, { q: 'Q2 23', v: 56.19e9 }, { q: 'Q3 23', v: 56.52e9 },
      { q: 'Q4 23', v: 62.02e9 }, { q: 'Q1 24', v: 61.86e9 }, { q: 'Q2 24', v: 64.73e9 },
      { q: 'Q3 24', v: 65.59e9 }, { q: 'Q4 24', v: 69.63e9 }, { q: 'Q1 25', v: 70.07e9 },
    ],
    current_price: 427.80, shares: 7.44e9,
    valuation_band: { bear: 340, base: 428, bull: 520, trustworthy_bear: 328, trustworthy_base: 428, trustworthy_bull: 538 },
  },
  AMZN: {
    ticker: 'AMZN', sector: 'Consumer', forecast_quarter: 'Q2 2025',
    selected_model_mode: 'hybrid', selected_anchor: 'trailing_8q', macro_weight: 0.5,
    forecast_revenue_yoy: 0.092, forecast_revenue: 162.4e9,
    macro_only_forecast_yoy: 0.104, macro_signal_label: 'Modest Upside',
    confidence: 'Medium', walk_forward_mae: 0.031, walk_forward_r2: 0.38,
    selected_features: ['Retail Sales', 'Consumer Confidence', 'ISM Manufacturing', 'Housing Starts'],
    selected_lags: [1, 2, 3, 5], anchor_yoy: 0.083,
    revenue_history: [
      { q: 'Q2 22', v: 121.2e9 }, { q: 'Q3 22', v: 127.1e9 }, { q: 'Q4 22', v: 149.2e9 },
      { q: 'Q1 23', v: 127.4e9 }, { q: 'Q2 23', v: 134.4e9 }, { q: 'Q3 23', v: 143.1e9 },
      { q: 'Q4 23', v: 169.9e9 }, { q: 'Q1 24', v: 143.3e9 }, { q: 'Q2 24', v: 148.1e9 },
      { q: 'Q3 24', v: 158.9e9 }, { q: 'Q4 24', v: 187.8e9 }, { q: 'Q1 25', v: 155.7e9 },
    ],
    current_price: 212.50, shares: 10.56e9,
    valuation_band: { bear: 168, base: 218, bull: 276, trustworthy_bear: 155, trustworthy_base: 218, trustworthy_bull: 290 },
  },
  NKE: {
    ticker: 'NKE', sector: 'Consumer', forecast_quarter: 'Q2 2025',
    selected_model_mode: 'delta', selected_anchor: 'last_yoy', macro_weight: 0.1,
    forecast_revenue_yoy: -0.041, forecast_revenue: 11.7e9,
    macro_only_forecast_yoy: -0.067, macro_signal_label: 'Modest Downside',
    confidence: 'Medium', walk_forward_mae: 0.028, walk_forward_r2: 0.29,
    selected_features: ['Consumer Sentiment', 'Retail Sales ex-Auto', 'China PMI', 'USD Index'],
    selected_lags: [3, 2, 4, 4], anchor_yoy: -0.038,
    revenue_history: [
      { q: 'Q2 22', v: 12.23e9 }, { q: 'Q3 22', v: 12.69e9 }, { q: 'Q4 22', v: 13.32e9 },
      { q: 'Q1 23', v: 12.39e9 }, { q: 'Q2 23', v: 12.83e9 }, { q: 'Q3 23', v: 13.39e9 },
      { q: 'Q4 23', v: 13.39e9 }, { q: 'Q1 24', v: 12.61e9 }, { q: 'Q2 24', v: 12.61e9 },
      { q: 'Q3 24', v: 11.59e9 }, { q: 'Q4 24', v: 12.35e9 }, { q: 'Q1 25', v: 11.27e9 },
    ],
    current_price: 74.20, shares: 1.49e9,
    valuation_band: { bear: 58, base: 76, bull: 94, trustworthy_bear: 52, trustworthy_base: 76, trustworthy_bull: 100 },
  },
  F: {
    ticker: 'F', sector: 'Industrial', forecast_quarter: 'Q2 2025',
    selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.6,
    forecast_revenue_yoy: 0.028, forecast_revenue: 45.3e9,
    macro_only_forecast_yoy: 0.044, macro_signal_label: 'Neutral',
    confidence: 'Low', walk_forward_mae: 0.058, walk_forward_r2: 0.11,
    selected_features: ['Auto Sales SAAR', '10Y Treasury', 'Consumer Credit', 'Gasoline Prices'],
    selected_lags: [1, 3, 2, 4], anchor_yoy: 0.021,
    revenue_history: [
      { q: 'Q2 22', v: 40.19e9 }, { q: 'Q3 22', v: 37.19e9 }, { q: 'Q4 22', v: 44.02e9 },
      { q: 'Q1 23', v: 41.47e9 }, { q: 'Q2 23', v: 44.95e9 }, { q: 'Q3 23', v: 43.80e9 },
      { q: 'Q4 23', v: 46.23e9 }, { q: 'Q1 24', v: 42.78e9 }, { q: 'Q2 24', v: 47.81e9 },
      { q: 'Q3 24', v: 46.20e9 }, { q: 'Q4 24', v: 48.15e9 }, { q: 'Q1 25', v: 40.66e9 },
    ],
    current_price: 10.40, shares: 3.93e9,
    valuation_band: { bear: 8, base: 11, bull: 15, trustworthy_bear: 7, trustworthy_base: 11, trustworthy_bull: 17 },
  },
};

// Extended set used by the Screener and Comparison pages.
// These don't have populated revenue_history (chart shows for core 5 only in v1).
const EXTRA: Record<string, ForecastPayload> = {
  GOOGL: { ticker: 'GOOGL', sector: 'Technology', industry: 'Internet & Search', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.25, forecast_revenue_yoy: 0.118, forecast_revenue: 90.4e9, macro_only_forecast_yoy: 0.13, macro_signal_label: 'Strong Upside', confidence: 'High', walk_forward_mae: 0.014, walk_forward_r2: 0.68, selected_features: ['ISM Services', 'PCE Services', 'Consumer Confidence', 'Credit Spreads'], selected_lags: [2, 3, 2, 4], anchor_yoy: 0.108, revenue_history: [], current_price: 178.50, valuation_band: { bear: 145, base: 188, bull: 235, trustworthy_bear: 138, trustworthy_base: 188, trustworthy_bull: 242 } },
  META: { ticker: 'META', sector: 'Technology', industry: 'Social Media', forecast_quarter: 'Q2 2025', selected_model_mode: 'level', selected_anchor: 'trailing_4q', macro_weight: 0.2, forecast_revenue_yoy: 0.182, forecast_revenue: 42.3e9, macro_only_forecast_yoy: 0.201, macro_signal_label: 'Strong Upside', confidence: 'High', walk_forward_mae: 0.016, walk_forward_r2: 0.71, selected_features: ['Digital Ad Spend', 'Consumer Sentiment', 'PCE Services', '10Y Treasury'], selected_lags: [1, 3, 2, 4], anchor_yoy: 0.171, revenue_history: [], current_price: 556.20, valuation_band: { bear: 420, base: 570, bull: 720, trustworthy_bear: 400, trustworthy_base: 570, trustworthy_bull: 745 } },
  NVDA: { ticker: 'NVDA', sector: 'Technology', industry: 'Semiconductors', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.35, forecast_revenue_yoy: 0.842, forecast_revenue: 43.5e9, macro_only_forecast_yoy: 0.91, macro_signal_label: 'Strong Upside', confidence: 'Medium', walk_forward_mae: 0.048, walk_forward_r2: 0.44, selected_features: ['ISM Manufacturing', 'Industrial Production', 'CapEx Survey', '10Y Treasury'], selected_lags: [3, 2, 4, 3], anchor_yoy: 0.821, revenue_history: [], current_price: 875.40, valuation_band: { bear: 620, base: 920, bull: 1200, trustworthy_bear: 560, trustworthy_base: 920, trustworthy_bull: 1260 } },
  JPM: { ticker: 'JPM', sector: 'Financials', industry: 'Banking', forecast_quarter: 'Q2 2025', selected_model_mode: 'delta', selected_anchor: 'trailing_4q', macro_weight: 0.4, forecast_revenue_yoy: 0.082, forecast_revenue: 44.1e9, macro_only_forecast_yoy: 0.094, macro_signal_label: 'Modest Upside', confidence: 'High', walk_forward_mae: 0.019, walk_forward_r2: 0.58, selected_features: ['Fed Funds Rate', 'Credit Spreads', '10Y Treasury', 'Consumer Credit'], selected_lags: [1, 2, 3, 2], anchor_yoy: 0.074, revenue_history: [], current_price: 218.30, valuation_band: { bear: 178, base: 228, bull: 278, trustworthy_bear: 170, trustworthy_base: 228, trustworthy_bull: 286 } },
  JNJ: { ticker: 'JNJ', sector: 'Healthcare', industry: 'Pharmaceuticals', forecast_quarter: 'Q2 2025', selected_model_mode: 'level', selected_anchor: 'trailing_8q', macro_weight: 0.15, forecast_revenue_yoy: 0.038, forecast_revenue: 22.1e9, macro_only_forecast_yoy: 0.044, macro_signal_label: 'Neutral', confidence: 'High', walk_forward_mae: 0.011, walk_forward_r2: 0.72, selected_features: ['PCE Health', 'CPI Medical', 'Consumer Sentiment', '10Y Treasury'], selected_lags: [4, 4, 3, 4], anchor_yoy: 0.034, revenue_history: [], current_price: 156.40, valuation_band: { bear: 138, base: 162, bull: 188, trustworthy_bear: 134, trustworthy_base: 162, trustworthy_bull: 192 } },
  WMT: { ticker: 'WMT', sector: 'Consumer', industry: 'Retail', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.45, forecast_revenue_yoy: 0.048, forecast_revenue: 172.8e9, macro_only_forecast_yoy: 0.058, macro_signal_label: 'Modest Upside', confidence: 'High', walk_forward_mae: 0.013, walk_forward_r2: 0.66, selected_features: ['Retail Sales', 'Consumer Sentiment', 'PCE Goods', 'Gasoline Prices'], selected_lags: [1, 2, 2, 3], anchor_yoy: 0.041, revenue_history: [], current_price: 68.40, valuation_band: { bear: 54, base: 72, bull: 92, trustworthy_bear: 51, trustworthy_base: 72, trustworthy_bull: 96 } },
  XOM: { ticker: 'XOM', sector: 'Energy', industry: 'Oil & Gas', forecast_quarter: 'Q2 2025', selected_model_mode: 'delta', selected_anchor: 'last_yoy', macro_weight: 0.6, forecast_revenue_yoy: -0.062, forecast_revenue: 88.2e9, macro_only_forecast_yoy: -0.08, macro_signal_label: 'Modest Downside', confidence: 'Medium', walk_forward_mae: 0.044, walk_forward_r2: 0.31, selected_features: ['WTI Crude', 'Industrial Production', 'Global PMI', 'DXY'], selected_lags: [1, 2, 3, 2], anchor_yoy: -0.054, revenue_history: [], current_price: 112.80, valuation_band: { bear: 88, base: 118, bull: 148, trustworthy_bear: 82, trustworthy_base: 118, trustworthy_bull: 156 } },
  BAC: { ticker: 'BAC', sector: 'Financials', industry: 'Banking', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.38, forecast_revenue_yoy: 0.064, forecast_revenue: 25.8e9, macro_only_forecast_yoy: 0.078, macro_signal_label: 'Modest Upside', confidence: 'Medium', walk_forward_mae: 0.026, walk_forward_r2: 0.41, selected_features: ['Fed Funds Rate', 'Credit Spreads', 'Consumer Credit', 'Housing Starts'], selected_lags: [1, 2, 3, 4], anchor_yoy: 0.057, revenue_history: [], current_price: 38.20, valuation_band: { bear: 30, base: 41, bull: 52, trustworthy_bear: 28, trustworthy_base: 41, trustworthy_bull: 55 } },
  DIS: { ticker: 'DIS', sector: 'Consumer', industry: 'Entertainment', forecast_quarter: 'Q2 2025', selected_model_mode: 'level', selected_anchor: 'trailing_4q', macro_weight: 0.3, forecast_revenue_yoy: 0.072, forecast_revenue: 23.4e9, macro_only_forecast_yoy: 0.086, macro_signal_label: 'Modest Upside', confidence: 'Medium', walk_forward_mae: 0.032, walk_forward_r2: 0.35, selected_features: ['Consumer Sentiment', 'Retail Sales', 'PCE Services', 'Consumer Credit'], selected_lags: [2, 2, 3, 3], anchor_yoy: 0.063, revenue_history: [], current_price: 112.60, valuation_band: { bear: 88, base: 120, bull: 154, trustworthy_bear: 82, trustworthy_base: 120, trustworthy_bull: 162 } },
  TSLA: { ticker: 'TSLA', sector: 'Consumer', industry: 'Electric Vehicles', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_8q', macro_weight: 0.55, forecast_revenue_yoy: -0.048, forecast_revenue: 23.1e9, macro_only_forecast_yoy: -0.071, macro_signal_label: 'Modest Downside', confidence: 'Low', walk_forward_mae: 0.062, walk_forward_r2: 0.14, selected_features: ['Auto Sales SAAR', 'Consumer Sentiment', '10Y Treasury', 'China PMI'], selected_lags: [1, 3, 4, 3], anchor_yoy: -0.038, revenue_history: [], current_price: 175.20, valuation_band: { bear: 120, base: 195, bull: 280, trustworthy_bear: 105, trustworthy_base: 195, trustworthy_bull: 310 } },
  V: { ticker: 'V', sector: 'Financials', industry: 'Payments', forecast_quarter: 'Q2 2025', selected_model_mode: 'level', selected_anchor: 'trailing_4q', macro_weight: 0.22, forecast_revenue_yoy: 0.096, forecast_revenue: 9.6e9, macro_only_forecast_yoy: 0.108, macro_signal_label: 'Modest Upside', confidence: 'High', walk_forward_mae: 0.012, walk_forward_r2: 0.74, selected_features: ['Retail Sales', 'Consumer Confidence', 'PCE Services', '10Y Treasury'], selected_lags: [1, 2, 2, 4], anchor_yoy: 0.088, revenue_history: [], current_price: 278.40, valuation_band: { bear: 228, base: 292, bull: 358, trustworthy_bear: 218, trustworthy_base: 292, trustworthy_bull: 368 } },
  HD: { ticker: 'HD', sector: 'Consumer', industry: 'Home Improvement', forecast_quarter: 'Q2 2025', selected_model_mode: 'delta', selected_anchor: 'trailing_4q', macro_weight: 0.4, forecast_revenue_yoy: -0.028, forecast_revenue: 36.4e9, macro_only_forecast_yoy: -0.041, macro_signal_label: 'Modest Downside', confidence: 'Medium', walk_forward_mae: 0.024, walk_forward_r2: 0.46, selected_features: ['Housing Starts', 'Existing Home Sales', 'Consumer Credit', '10Y Treasury'], selected_lags: [2, 3, 3, 4], anchor_yoy: -0.021, revenue_history: [], current_price: 378.60, valuation_band: { bear: 308, base: 396, bull: 488, trustworthy_bear: 295, trustworthy_base: 396, trustworthy_bull: 502 } },
  PFE: { ticker: 'PFE', sector: 'Healthcare', industry: 'Pharmaceuticals', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_8q', macro_weight: 0.2, forecast_revenue_yoy: -0.182, forecast_revenue: 13.2e9, macro_only_forecast_yoy: -0.21, macro_signal_label: 'Strong Downside', confidence: 'Medium', walk_forward_mae: 0.038, walk_forward_r2: 0.28, selected_features: ['PCE Health', 'CPI Medical', 'Consumer Sentiment', 'Fed Funds Rate'], selected_lags: [4, 4, 3, 2], anchor_yoy: -0.168, revenue_history: [], current_price: 27.40, valuation_band: { bear: 20, base: 30, bull: 40, trustworthy_bear: 18, trustworthy_base: 30, trustworthy_bull: 44 } },
  CAT: { ticker: 'CAT', sector: 'Industrial', industry: 'Heavy Equipment', forecast_quarter: 'Q2 2025', selected_model_mode: 'hybrid', selected_anchor: 'trailing_4q', macro_weight: 0.5, forecast_revenue_yoy: 0.044, forecast_revenue: 16.2e9, macro_only_forecast_yoy: 0.058, macro_signal_label: 'Neutral', confidence: 'Medium', walk_forward_mae: 0.034, walk_forward_r2: 0.38, selected_features: ['ISM Manufacturing', 'Industrial Production', 'Housing Starts', 'Global PMI'], selected_lags: [2, 2, 4, 3], anchor_yoy: 0.036, revenue_history: [], current_price: 348.20, valuation_band: { bear: 278, base: 364, bull: 452, trustworthy_bear: 265, trustworthy_base: 364, trustworthy_bull: 468 } },
  COST: { ticker: 'COST', sector: 'Consumer', industry: 'Wholesale', forecast_quarter: 'Q2 2025', selected_model_mode: 'level', selected_anchor: 'trailing_4q', macro_weight: 0.28, forecast_revenue_yoy: 0.072, forecast_revenue: 62.4e9, macro_only_forecast_yoy: 0.082, macro_signal_label: 'Modest Upside', confidence: 'High', walk_forward_mae: 0.009, walk_forward_r2: 0.78, selected_features: ['Retail Sales', 'Consumer Sentiment', 'PCE Goods', 'Consumer Credit'], selected_lags: [1, 2, 2, 3], anchor_yoy: 0.065, revenue_history: [], current_price: 788.40, valuation_band: { bear: 640, base: 820, bull: 1010, trustworthy_bear: 610, trustworthy_base: 820, trustworthy_bull: 1045 } },
};

// Full set: core 5 + extended 15 = 20 tickers, used by the Screener.
export const PL_EXTENDED: Record<string, ForecastPayload> = { ...PL, ...EXTRA };
