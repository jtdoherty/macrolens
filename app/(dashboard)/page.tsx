import Link from 'next/link';
import { FLASH_INDS } from '@/lib/data';
import { getForecasts } from '@/lib/forecast-store';
import { pct, yc, sb, cb } from '@/lib/helpers';
import type { ForecastPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const tickers = await getForecasts();
  const byYoy = [...tickers].sort((a, b) => b.forecast_revenue_yoy - a.forecast_revenue_yoy);
  const best = byYoy.slice(0, 5);
  const worst = [...byYoy].reverse().slice(0, 5);

  const upsideCount = tickers.filter((d) => d.macro_signal_label.includes('Upside')).length;
  const highConf = tickers.filter((d) => d.confidence === 'High').length;
  const avgYoy = tickers.reduce((s, d) => s + d.forecast_revenue_yoy, 0) / tickers.length;
  const inValuation = tickers.filter((d) => d.current_price < d.valuation_band.trustworthy_base).length;

  return (
    <>
      {/* HERO */}
      <div className="home-hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <div className="hero-pulse"></div>Live · Q2 2025 · {tickers.length} tickers tracked
          </div>
          <div className="hero-title">
            Revenue forecasting<br />driven by <span>macro signals</span>
          </div>
          <div className="hero-subtitle">
            MacroLens connects FRED macro data to company revenue trends using walk-forward validated models — giving
            you anchor forecasts, macro signals, and adaptive blends with valuation bands for every ticker.
          </div>
          <div className="hero-cta-row">
            <Link href="/screener" className="hero-btn hero-btn-primary">Open Screener →</Link>
            <Link href="/macro" className="hero-btn hero-btn-secondary">View Macro Dashboard</Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat-item"><div className="hero-stat-val">{tickers.length}</div><div className="hero-stat-lbl">Tickers tracked</div></div>
            <div className="hero-stat-item"><div className="hero-stat-val">{upsideCount}</div><div className="hero-stat-lbl">Upside signals</div></div>
            <div className="hero-stat-item"><div className="hero-stat-val">{highConf}</div><div className="hero-stat-lbl">High confidence</div></div>
            <div className="hero-stat-item"><div className="hero-stat-val">{(avgYoy * 100).toFixed(1)}%</div><div className="hero-stat-lbl">Avg next-Q rev YoY</div></div>
            <div className="hero-stat-item"><div className="hero-stat-val">{inValuation}/{tickers.length}</div><div className="hero-stat-lbl">Below base valuation</div></div>
          </div>
        </div>
      </div>

      <div className="home-dash">
        {/* SUMMARY STATS */}
        <div className="home-grid-top">
          <div className="sc bl">
            <div className="sl">Upside Signals</div>
            <div className="sv up">{upsideCount} <span style={{ fontSize: 14, fontFamily: 'var(--font)', fontWeight: 400, color: 'var(--slate)' }}>of {tickers.length}</span></div>
            <div className="ss">Macro-adjusted forecast</div>
          </div>
          <div className="sc gl">
            <div className="sl">High Confidence Models</div>
            <div className="sv">{highConf} <span style={{ fontSize: 14, fontFamily: 'var(--font)', fontWeight: 400, color: 'var(--slate)' }}>of {tickers.length}</span></div>
            <div className="ss">Walk-forward validated</div>
          </div>
          <div className="sc">
            <div className="sl">Avg Forecast YoY</div>
            <div className={`sv ${avgYoy > 0 ? 'up' : 'dn'}`}>{pct(avgYoy)}</div>
            <div className="ss">Across all tickers</div>
          </div>
          <div className={`sc ${inValuation > tickers.length / 2 ? 'gl' : 'rl'}`}>
            <div className="sl">Below Base Valuation</div>
            <div className="sv">{inValuation}/{tickers.length}</div>
            <div className="ss">Price &lt; trustworthy base</div>
          </div>
        </div>

        {/* MACRO FLASH */}
        <div className="macro-flash">
          <div className="ct" style={{ marginBottom: 0 }}>
            Key Macro Indicators{' '}
            <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 400, marginLeft: 8 }}>
              click macro dashboard for full detail
            </span>
          </div>
          <div className="flash-row">
            {FLASH_INDS.map((i) => {
              const chg = i.v - i.p;
              const cls = chg > 0 ? 'up-chip' : chg < 0 ? 'dn-chip' : 'fl-chip';
              const valCls = chg > 0 ? 'up' : chg < 0 ? 'dn' : 'fl';
              return (
                <Link key={i.n} href="/macro" className={`flash-chip ${cls}`}>
                  <div className="flash-chip-name">{i.n}</div>
                  <div className={`flash-chip-val ${valCls}`}>{i.v}{i.u}</div>
                  <div className={`flash-chip-chg ${valCls}`}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}{i.u}</div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* BEST / WORST */}
        <div className="home-signal-grid">
          <SignalList title="🟢 Best Forecast Tickers" badge={<span className="badge bg2">Highest YoY</span>} items={best} />
          <SignalList title="🔴 Weakest Forecast Tickers" badge={<span className="badge br2">Lowest YoY</span>} items={worst} />
        </div>

        {/* ALL TICKERS QUICK VIEW */}
        <div className="sh2">All Tickers — Quick View</div>
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Ticker</th><th>Signal</th><th>Confidence</th>
                <th title="Projected next-quarter revenue vs same Q last year">Next Q Forecast YoY</th>
                <th title="Trend-only anchor estimate">Anchor YoY</th>
                <th>Price</th><th>Upside to Base</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((d) => {
                const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
                return (
                  <tr key={d.ticker}>
                    <td><Link href={`/ticker/${d.ticker}`} className="ttick">{d.ticker}</Link></td>
                    <td><span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span></td>
                    <td><span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span></td>
                    <td className={yc(d.forecast_revenue_yoy)} style={{ fontWeight: 600 }}>{pct(d.forecast_revenue_yoy)}</td>
                    <td className={yc(d.anchor_yoy)}>{pct(d.anchor_yoy)}</td>
                    <td>${d.current_price.toFixed(2)}</td>
                    <td className={ups > 0 ? 'up' : 'dn'} style={{ fontWeight: 600 }}>{pct(ups)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SignalList({ title, badge, items }: { title: string; badge: React.ReactNode; items: ForecastPayload[] }) {
  return (
    <div className="signal-list-card">
      <div className="slc-head">
        <div className="slc-title">{title}</div>
        {badge}
      </div>
      {items.map((d, i) => {
        const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
        const barW = Math.min(100, Math.abs(d.forecast_revenue_yoy) * 400);
        const barColor = d.forecast_revenue_yoy > 0 ? 'var(--green)' : 'var(--red)';
        return (
          <Link key={d.ticker} href={`/ticker/${d.ticker}`} className="slc-row">
            <div className="slc-rank">{i + 1}</div>
            <div><div className="slc-ticker">{d.ticker}</div></div>
            <div className="slc-info">
              <div className="slc-name">{d.sector ?? d.ticker}</div>
              <div className="slc-badges">
                <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>
                <span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span>
              </div>
              <div className="slc-bar-wrap">
                <div className="slc-bar" style={{ width: `${barW}%`, background: barColor }}></div>
              </div>
            </div>
            <div className="slc-right">
              <div className={`slc-yoy ${yc(d.forecast_revenue_yoy)}`}>{pct(d.forecast_revenue_yoy)}</div>
              <div className="slc-sub">{pct(d.forecast_revenue_yoy)} next-Q · {pct(ups)} to base</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
