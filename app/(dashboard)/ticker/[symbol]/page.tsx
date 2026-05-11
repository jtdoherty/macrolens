import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FINANCIALS } from '@/lib/data';
import { getForecast } from '@/lib/forecast-store';
import { pct, sb, cb } from '@/lib/helpers';
import { ForecastTab } from './_tabs/Forecast';
import { OverviewTab } from './_tabs/Overview';
import { IncomeTab } from './_tabs/Income';
import { BalanceTab } from './_tabs/Balance';
import { CashFlowTab } from './_tabs/CashFlow';
import { RatiosTab } from './_tabs/Ratios';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'forecast', label: 'Forecast' },
  { key: 'overview', label: 'Overview' },
  { key: 'income', label: 'Income Statement' },
  { key: 'balance', label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'ratios', label: 'Key Ratios' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export default async function TickerPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { symbol } = await params;
  const { tab: tabParam } = await searchParams;
  const ticker = symbol.toUpperCase();
  const d = await getForecast(ticker);
  if (!d) notFound();

  const f = FINANCIALS[ticker];
  const tab = (TABS.find((t) => t.key === tabParam)?.key ?? 'forecast') as TabKey;
  const hasFinancials = !!f;
  const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
  const mktCap = f && f.market_cap >= 1e12 ? '$' + (f.market_cap / 1e12).toFixed(2) + 'T' : f ? '$' + (f.market_cap / 1e9).toFixed(1) + 'B' : null;

  return (
    <>
      <div className="tkr-hero">
        <Link href="/screener" className="back-btn">← Back to Screener</Link>
        <div className="tkr-top">
          <div>
            <div className="tkr-name">
              {f?.name ?? d.ticker}{' '}
              <span style={{ fontSize: 18, color: 'var(--slate)', fontFamily: 'var(--font)', fontWeight: 500 }}>({d.ticker})</span>
            </div>
            <div className="tkr-sector">
              {f?.exchange ? `${f.exchange} · ` : ''}{d.sector} · {d.forecast_quarter} forecast
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>
              <span className={`badge ${cb(d.confidence)}`}>{d.confidence} confidence</span>
              <span className="badge bx2">Macro weight {Math.round(d.macro_weight * 100)}%</span>
              <span className="badge bb2">📅 Projecting {d.forecast_quarter}</span>
            </div>
          </div>
          <div className="tkr-price-block">
            <div className="tkr-price">${d.current_price.toFixed(2)}</div>
            {mktCap && <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3 }}>Market cap: {mktCap}</div>}
            <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }} className={ups > 0 ? 'up' : 'dn'}>
              {pct(ups)} to base
            </div>
          </div>
        </div>
      </div>

      <div className="tkr-tabs">
        {TABS.map((t) => {
          const disabled = t.key !== 'forecast' && !hasFinancials;
          if (disabled) {
            return (
              <span key={t.key} className="tkr-tab" style={{ opacity: 0.35, cursor: 'not-allowed' }} title="Financial statements not yet available">
                {t.label}
              </span>
            );
          }
          return (
            <Link
              key={t.key}
              href={`/ticker/${ticker}${t.key === 'forecast' ? '' : `?tab=${t.key}`}`}
              className={`tkr-tab${tab === t.key ? ' active' : ''}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="tkr-body">
        {tab === 'forecast' && <ForecastTab d={d} />}
        {tab !== 'forecast' && !f && (
          <div className="empty">
            <div className="eicon">📊</div>
            <div className="etitle">Financial statements not yet available for {d.ticker}</div>
            <div className="esub">Detailed annual + quarterly statements are loaded for the core 5 tickers in v1.<br />Use the Forecast tab for {d.ticker} or pick a different ticker.</div>
          </div>
        )}
        {tab === 'overview' && f && <OverviewTab f={f} />}
        {tab === 'income' && f && <IncomeTab f={f} />}
        {tab === 'balance' && f && <BalanceTab f={f} />}
        {tab === 'cashflow' && f && <CashFlowTab f={f} />}
        {tab === 'ratios' && f && <RatiosTab f={f} />}
      </div>
    </>
  );
}
