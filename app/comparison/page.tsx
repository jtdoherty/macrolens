import Link from 'next/link';
import { PL_EXTENDED } from '@/lib/data';
import { fmt, pct, yc, sb, cb } from '@/lib/helpers';
import { ComparisonRevenueChart, ComparisonForecastChart, COMPARISON_COLORS } from '@/components/charts/ComparisonCharts';
import type { ForecastPayload } from '@/lib/types';

const MAX_TICKERS = 4;
const DEFAULT_TICKERS = ['AAPL', 'MSFT'];

function parseTickers(raw: string | undefined): string[] {
  if (!raw) return DEFAULT_TICKERS;
  return raw
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter((t) => t && PL_EXTENDED[t])
    .slice(0, MAX_TICKERS);
}

function toggleHref(current: string[], ticker: string): string {
  const next = current.includes(ticker)
    ? current.filter((t) => t !== ticker)
    : current.length < MAX_TICKERS
    ? [...current, ticker]
    : current;
  if (next.length === 0) return '/comparison';
  return `/comparison?tickers=${next.join(',')}`;
}

export default async function ComparisonPage({
  searchParams,
}: {
  searchParams: Promise<{ tickers?: string }>;
}) {
  const sp = await searchParams;
  const selected = parseTickers(sp.tickers);
  const cols = selected.map((t) => PL_EXTENDED[t]).filter(Boolean);
  const allKeys = Object.keys(PL_EXTENDED);

  return (
    <>
      <div className="ph">
        <div className="ph-inner">
          <h1>Comparison</h1>
          <p>Side-by-side forecast metrics for up to {MAX_TICKERS} tickers</p>
        </div>
      </div>

      <div className="pb">
        {/* TICKER TOGGLE */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 10 }}>
            Select up to {MAX_TICKERS} tickers — click to toggle
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allKeys.map((t) => {
              const inList = selected.includes(t);
              const d = PL_EXTENDED[t];
              const idx = selected.indexOf(t);
              return (
                <Link key={t} href={toggleHref(selected, t)} className={`ctb${inList ? ' in' : ''}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    {inList && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: COMPARISON_COLORS[idx] ?? '#ccc',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    {t}
                    <span style={{ fontSize: 10, opacity: 0.6 }}>{pct(d.forecast_revenue_yoy)}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {cols.length >= 2 ? (
          <>
            <div className="card cp" style={{ marginBottom: 16 }}>
              <div className="ct">
                Revenue History — Quarterly
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--slate)' }}>
                  ({cols.filter((c) => c.revenue_history.length > 0).length} of {cols.length} tickers have history)
                </span>
              </div>
              <ComparisonRevenueChart tickers={cols} height={240} />
            </div>

            <div className="card cp" style={{ marginBottom: 16 }}>
              <div className="ct">Next Quarter Forecast YoY</div>
              <ComparisonForecastChart tickers={cols} height={180} />
            </div>

            <ComparisonTable cols={cols} />
          </>
        ) : (
          <div className="empty">
            <div className="eicon">⚖️</div>
            <div className="etitle">Select 2–{MAX_TICKERS} tickers above</div>
            <div className="esub">Pick tickers to compare them side by side with charts</div>
          </div>
        )}
      </div>
    </>
  );
}

function ComparisonTable({ cols }: { cols: ForecastPayload[] }) {
  const rows: [string, (d: ForecastPayload) => React.ReactNode][] = [
    ['Macro Signal', (d) => <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>],
    ['Confidence', (d) => <span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span>],
    ['Next Q Forecast YoY', (d) => <span className={yc(d.forecast_revenue_yoy)} style={{ fontWeight: 700 }}>{pct(d.forecast_revenue_yoy)}</span>],
    ['Anchor YoY', (d) => <span className={yc(d.anchor_yoy)}>{pct(d.anchor_yoy)}</span>],
    ['Forecast Revenue', (d) => fmt(d.forecast_revenue)],
    ['Macro Weight', (d) => Math.round(d.macro_weight * 100) + '%'],
    ['R² OOS', (d) => <span className={d.walk_forward_r2 > 0.5 ? 'up' : d.walk_forward_r2 > 0.2 ? 'fl' : 'dn'}>{d.walk_forward_r2.toFixed(2)}</span>],
    ['Walk-forward MAE', (d) => <span className={d.walk_forward_mae < 0.025 ? 'up' : d.walk_forward_mae < 0.04 ? 'fl' : 'dn'}>{(d.walk_forward_mae * 100).toFixed(1)}pp</span>],
    ['Current Price', (d) => '$' + d.current_price.toFixed(2)],
    ['Base Valuation', (d) => '$' + d.valuation_band.trustworthy_base],
    ['Upside to Base', (d) => {
      const u = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
      return <span className={u > 0 ? 'up' : 'dn'} style={{ fontWeight: 700 }}>{pct(u)}</span>;
    }],
  ];

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 180 }}>Metric</th>
            {cols.map((d, i) => (
              <th key={d.ticker} style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: COMPARISON_COLORS[i] }} />
                  {d.ticker}
                </span>
                <br />
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--slate)' }}>{d.sector}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, fn]) => (
            <tr key={label}>
              <td style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--surface)' }}>
                {label}
              </td>
              {cols.map((d) => (
                <td key={d.ticker} style={{ textAlign: 'center' }}>{fn(d)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
