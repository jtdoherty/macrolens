# Forecast Data Contract

This is the single source of truth for the JSON shape produced by the backend (mock today, friend's Python service later). The frontend MUST be aligned to this — no per-source special casing.

If this contract changes, update `lib/types.ts` in the same commit.

## ForecastPayload — one record per ticker

```ts
type ForecastPayload = {
  ticker: string;
  sector?: string;
  industry?: string;
  forecast_quarter: string;            // e.g. "Q2 2025"

  // Model selection
  selected_model_mode: 'level' | 'delta' | 'hybrid';
  selected_anchor: 'last_yoy' | 'trailing_4q' | 'trailing_8q';
  macro_weight: number;                 // 0..1

  // Forecasts
  forecast_revenue_yoy: number;         // adaptive blend
  forecast_revenue: number;             // dollars
  macro_only_forecast_yoy: number;      // macro-only output
  anchor_yoy: number;                   // anchor-only output

  // Labels
  macro_signal_label: 'Strong Upside' | 'Modest Upside' | 'Neutral' | 'Modest Downside' | 'Strong Downside';
  confidence: 'High' | 'Medium' | 'Low' | 'Unreliable';

  // Walk-forward validation
  walk_forward_mae: number;             // 0..1, fraction (e.g. 0.018 = 1.8pp)
  walk_forward_r2: number;

  // Selected features
  selected_features: string[];
  selected_lags: number[];              // same length as selected_features, in quarters

  // History
  revenue_history: { q: string; v: number }[];

  // Pricing
  current_price: number;
  shares?: number;

  // Valuation band
  valuation_band: {
    bear: number;
    base: number;
    bull: number;
    trustworthy_bear: number;
    trustworthy_base: number;
    trustworthy_bull: number;
  };
};
```

## Forecast logic (reference — not implemented in frontend)

The frontend must NOT implement any of this. It only consumes the payload above. This is documented so we agree on what the backend will do.

1. Pull company quarterly revenue from SEC company facts.
2. `revenue_yoy = revenue.pct_change(4)`.
3. Pull macro indicators from FRED, resample quarterly, convert to YoY growth.
4. Test each macro feature at lags 0Q–10Q (lag means `factor.shift(lag).loc[target_quarter]`).
5. Build macro baskets (seed baskets + top features + correlation clusters).
6. For each basket: standardize → PCA(1) → keep if explained variance high enough → test PCA factor at lags 0Q–10Q.
7. Build macro-only forecasts (level / delta / hybrid).
8. Build anchor forecasts (last YoY / trailing 4Q / trailing 8Q).
9. Adaptive blend: `forecast_yoy = anchor + macro_weight * (macro_forecast_yoy - anchor)`. Test weights 0–100% in 10% steps.
10. Walk-forward validation: for each historical fold, train only on prior data, select drivers using only prior data, apply lagged macro values, compare to actual.
11. Tournament: pick lowest walk-forward MAE; ties broken by lower macro weight, then trailing 4Q anchor. Macro-heavy must beat low-weight by a meaningful margin.
12. `forecast_revenue = revenue_4q_ago * (1 + forecast_revenue_yoy)`.
13. Macro signal label from `macro_only_forecast_yoy` vs anchor.
14. Confidence rules:
    - **High:** beats anchors by meaningful MAE margin, positive R², stable drivers, enough folds.
    - **Medium:** roughly matches/modestly beats anchors, consistent direction.
    - **Low:** explains history but doesn't beat anchors.
    - **Unreliable:** too few folds, unstable, factors changing constantly.
15. Valuation band: pull price + shares from yfinance, build TTM revenue history, compute historical P/S, trim outliers, take 25/50/75 percentiles, apply to forecast TTM revenue.
16. Trustworthy band: widen or haircut bear/base/bull based on walk-forward MAE and confidence.

## Holdout / backtest API

The Python backend should expose:

```
predict_as_of(ticker, target_quarter, as_of_date)
```

with the rules:
- Exclude revenue at or after `target_quarter`.
- Train only on prior revenue history.
- Use macro/FRED data only up to the modeled cutoff.
- Apply lagged macro factors to `target_quarter`.
- Compare to actual only if actual is already known.
- v1 can use current FRED with quarter cutoff. v2 should use ALFRED vintages for strict release-date validation.

## Frontend display rules

The UI must clearly separate these three things, even though all three live in one payload:

- **Conservative forecast** = anchor-only (`anchor_yoy`).
- **Macro-only signal** = `macro_only_forecast_yoy`.
- **Macro-adjusted forecast** = `forecast_revenue_yoy` (the SELECTED blend, validated by walk-forward).
