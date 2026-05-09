import Link from 'next/link';
import { PL, PL_EXTENDED } from '@/lib/data';
import { pct, yc, sb, cb } from '@/lib/helpers';
import { ScreenerFilters } from '@/components/ScreenerFilters';
import { WatchlistStar } from '@/components/WatchlistStar';
import type { ForecastPayload } from '@/lib/types';

type SortMode = 'signal' | 'confidence' | 'upside' | 'yoy';

const SIGNAL_ORDER: Record<string, number> = {
  'Strong Upside': 0, 'Modest Upside': 1, 'Neutral': 2, 'Modest Downside': 3, 'Strong Downside': 4,
};
const CONF_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2, Unreliable: 3 };

const SIGNAL_OPTIONS = ['Strong Upside', 'Modest Upside', 'Neutral', 'Modest Downside', 'Strong Downside'];
const CONF_OPTIONS = ['High', 'Medium', 'Low', 'Unreliable'];

function applyFilters(
  rows: ForecastPayload[],
  { srch, sec, sig, conf, sort }: { srch?: string; sec?: string; sig?: string; conf?: string; sort: SortMode },
): ForecastPayload[] {
  let out = rows;
  if (sec) out = out.filter((r) => r.sector === sec);
  if (srch) {
    const needle = srch.toUpperCase().trim();
    out = out.filter((r) => r.ticker.includes(needle) || (r.industry ?? '').toUpperCase().includes(needle));
  }
  if (sig) out = out.filter((r) => r.macro_signal_label === sig);
  if (conf) out = out.filter((r) => r.confidence === conf);

  out = [...out];
  if (sort === 'signal') out.sort((a, b) => (SIGNAL_ORDER[a.macro_signal_label] ?? 9) - (SIGNAL_ORDER[b.macro_signal_label] ?? 9));
  else if (sort === 'confidence') out.sort((a, b) => (CONF_ORDER[a.confidence] ?? 9) - (CONF_ORDER[b.confidence] ?? 9));
  else if (sort === 'upside') {
    out.sort((a, b) => {
      const ua = (a.valuation_band.trustworthy_base - a.current_price) / a.current_price;
      const ub = (b.valuation_band.trustworthy_base - b.current_price) / b.current_price;
      return ub - ua;
    });
  } else if (sort === 'yoy') out.sort((a, b) => b.forecast_revenue_yoy - a.forecast_revenue_yoy);

  return out;
}

export default async function ScreenerPage({
  searchParams,
}: {
  searchParams: Promise<{ srch?: string; sec?: string; sig?: string; conf?: string; sort?: SortMode }>;
}) {
  const sp = await searchParams;
  const sort: SortMode = sp.sort && ['signal', 'confidence', 'upside', 'yoy'].includes(sp.sort) ? sp.sort : 'signal';
  const allTickers = Object.values(PL_EXTENDED);
  const sectors = [...new Set(allTickers.map((t) => t.sector!).filter(Boolean))].sort();
  const rows = applyFilters(allTickers, { ...sp, sort });

  const sortHref = (m: SortMode) => {
    const next = new URLSearchParams();
    if (sp.srch) next.set('srch', sp.srch);
    if (sp.sec) next.set('sec', sp.sec);
    if (sp.sig) next.set('sig', sp.sig);
    if (sp.conf) next.set('conf', sp.conf);
    next.set('sort', m);
    return `/screener?${next.toString()}`;
  };

  const hasFilters = !!(sp.srch || sp.sec || sp.sig || sp.conf);

  return (
    <>
      <div className="ph">
        <div className="ph-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1>Screener</h1>
            <p>
              All tickers ranked by model output — <strong>Forecast YoY</strong> is the projected next-quarter revenue vs. same quarter last year
            </p>
          </div>
          <span className="badge bb2" style={{ flexShrink: 0, marginTop: 4, fontSize: 12, padding: '5px 12px' }}>
            📅 All forecasts: Q2 2025
          </span>
        </div>
      </div>

      <div className="pb">
        {/* FILTER ROW */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
          <div className="pg">
            <Link href={sortHref('signal')} className={`pill${sort === 'signal' ? ' active' : ''}`}>Signal</Link>
            <Link href={sortHref('confidence')} className={`pill${sort === 'confidence' ? ' active' : ''}`}>Confidence</Link>
            <Link href={sortHref('upside')} className={`pill${sort === 'upside' ? ' active' : ''}`}>Upside</Link>
            <Link href={sortHref('yoy')} className={`pill${sort === 'yoy' ? ' active' : ''}`}>YoY</Link>
          </div>
          <ScreenerFilters sectors={sectors} signals={SIGNAL_OPTIONS} confidences={CONF_OPTIONS} />
          <span style={{ fontSize: 12, color: 'var(--slate)', marginLeft: 4 }}>
            {rows.length} result{rows.length !== 1 ? 's' : ''}
          </span>
          {hasFilters && (
            <Link href="/screener" className="btn btno" style={{ fontSize: 11, padding: '5px 12px' }}>
              ✕ Clear filters
            </Link>
          )}
        </div>

        {/* TABLE */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Sector</th>
                <th>Industry</th>
                <th className={sort === 'signal' ? 'srt' : ''}>Signal</th>
                <th className={sort === 'confidence' ? 'srt' : ''}>Confidence</th>
                <th className={sort === 'yoy' ? 'srt' : ''}>Next Q YoY ↗</th>
                <th>Anchor YoY</th>
                <th className={sort === 'upside' ? 'srt' : ''}>Upside to Base</th>
                <th>Price</th>
                <th>R²</th>
                <th>MAE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ textAlign: 'center', padding: 32, color: 'var(--slate2)' }}>
                    No tickers match your filters
                  </td>
                </tr>
              ) : (
                rows.map((d) => {
                  const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
                  const inCore = !!PL[d.ticker];
                  return (
                    <tr key={d.ticker}>
                      <td>
                        <Link href={`/ticker/${d.ticker}`} className="ttick">{d.ticker}</Link>
                        {!inCore && (
                          <span style={{ fontSize: 9, color: 'var(--amber)', marginLeft: 4 }}>EXTENDED</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--slate)' }}>{d.sector}</td>
                      <td style={{ color: 'var(--slate2)', fontSize: 11 }}>{d.industry ?? '—'}</td>
                      <td><span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span></td>
                      <td><span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span></td>
                      <td className={yc(d.forecast_revenue_yoy)} style={{ fontWeight: 700 }}>{pct(d.forecast_revenue_yoy)}</td>
                      <td className={yc(d.anchor_yoy)}>{pct(d.anchor_yoy)}</td>
                      <td className={ups > 0 ? 'up' : 'dn'} style={{ fontWeight: 700 }}>{pct(ups)}</td>
                      <td style={{ color: 'var(--ink2)' }}>${d.current_price.toFixed(2)}</td>
                      <td style={{ color: 'var(--slate)' }}>{d.walk_forward_r2.toFixed(2)}</td>
                      <td style={{ color: 'var(--slate)' }}>{(d.walk_forward_mae * 100).toFixed(1)}pp</td>
                      <td><WatchlistStar ticker={d.ticker} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
