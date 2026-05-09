import Link from 'next/link';
import { PL } from '@/lib/data';
import { notFound } from 'next/navigation';

export default async function TickerPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const d = PL[symbol.toUpperCase()];
  if (!d) notFound();

  return (
    <>
      <div className="tkr-hero">
        <Link href="/screener" className="back-btn">← Back to Screener</Link>
        <div className="tkr-top">
          <div>
            <div className="tkr-name">{d.ticker}</div>
            <div className="tkr-sector">{d.sector} · {d.forecast_quarter}</div>
          </div>
          <div className="tkr-price-block">
            <div className="tkr-price">${d.current_price.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div className="tkr-body">
        <div className="empty">
          <div className="eicon">🏢</div>
          <div className="etitle">Full ticker detail — coming next</div>
          <div className="esub">Phase 1 step in progress (financials, charts, ratios, full forecast view).</div>
        </div>
      </div>
    </>
  );
}
