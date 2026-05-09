'use client';

import Link from 'next/link';
import { useState } from 'react';
import { addPosition, removePosition, updatePositionNote, usePortfolio } from '@/lib/store';
import { PL_EXTENDED } from '@/lib/data';
import { fmt, pct, yc, sb, cb } from '@/lib/helpers';
import type { Holding } from '@/lib/types';
import { AllocationDonut, PnlBar, ForecastYoYBar, type PortfolioRow } from '@/components/charts/PortfolioCharts';

export function PortfolioList() {
  const holdings = usePortfolio();

  // Form state
  const [t, setT] = useState('');
  const [sh, setSh] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const ticker = t.trim().toUpperCase();
    const shares = parseFloat(sh);
    const avgCost = parseFloat(cost);
    if (!ticker || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(avgCost) || avgCost <= 0) {
      setError('Please fill in ticker, shares, and average cost.');
      return;
    }
    addPosition({ ticker, shares, avgCost, date, notes });
    setT(''); setSh(''); setCost(''); setDate(''); setNotes('');
  };

  const remove = (i: number) => {
    if (!confirm('Remove this position?')) return;
    removePosition(i);
  };

  const saveNote = (i: number, val: string) => {
    updatePositionNote(i, val);
  };

  // Aggregate stats
  let totalValue = 0;
  let totalCost = 0;
  holdings.forEach((h) => {
    const px = PL_EXTENDED[h.ticker]?.current_price ?? h.avgCost;
    totalValue += px * h.shares;
    totalCost += h.avgCost * h.shares;
  });
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? pnl / totalCost : 0;
  const upsideCount = holdings.filter((h) => {
    const d = PL_EXTENDED[h.ticker];
    return d && d.valuation_band.trustworthy_base > d.current_price;
  }).length;

  return (
    <>
      {/* SUMMARY */}
      <div className="psum">
        <div className="sc bl">
          <div className="sl">Portfolio Value</div>
          <div className="sv">{holdings.length ? fmt(totalValue) : '—'}</div>
          <div className="ss">{holdings.length} position{holdings.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="sc">
          <div className="sl">Total Cost Basis</div>
          <div className="sv">{holdings.length ? fmt(totalCost) : '—'}</div>
          <div className="ss">Avg cost × shares</div>
        </div>
        <div className={`sc ${pnl >= 0 ? 'gl' : 'rl'}`}>
          <div className="sl">Unrealized P&amp;L</div>
          <div className={`sv ${pnl >= 0 ? 'up' : 'dn'}`}>{holdings.length ? fmt(pnl) : '—'}</div>
          <div className={`ss ${pnl >= 0 ? 'up' : 'dn'}`}>{holdings.length ? pct(pnlPct) : ''}</div>
        </div>
        <div className="sc">
          <div className="sl">Positions w/ Upside</div>
          <div className="sv up">{upsideCount}</div>
          <div className="ss">vs trustworthy base</div>
        </div>
      </div>

      {/* ADD POSITION */}
      <div className="sh2">Add Position</div>
      <div className="padd">
        <div className="pf"><label>Ticker</label><input className="inp" value={t} onChange={(e) => setT(e.target.value)} placeholder="AAPL" style={{ width: 90, textTransform: 'uppercase' }} /></div>
        <div className="pf"><label>Shares</label><input className="inp" type="number" value={sh} onChange={(e) => setSh(e.target.value)} placeholder="100" style={{ width: 100 }} /></div>
        <div className="pf"><label>Avg Cost / Share</label><input className="inp" type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="150.00" style={{ width: 130 }} /></div>
        <div className="pf"><label>Purchase Date</label><input className="inp" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 150 }} /></div>
        <div className="pf"><label>Notes</label><input className="inp" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional…" style={{ width: 180 }} /></div>
        <button className="btn btnp" onClick={submit}>+ Add Position</button>
        {error && <div style={{ color: 'var(--red)', fontSize: 12, marginLeft: 12, alignSelf: 'center' }}>{error}</div>}
      </div>

      {/* CHARTS */}
      {holdings.length >= 2 && <PortfolioCharts holdings={holdings} />}

      {/* HOLDINGS */}
      <div className="sh2">Holdings</div>
      {holdings.length === 0 ? (
        <div className="empty">
          <div className="eicon">💼</div>
          <div className="etitle">No positions yet</div>
          <div className="esub">Add your holdings above to track P&amp;L, macro signals,<br />and revenue forecast expectations for each position</div>
        </div>
      ) : (
        holdings.map((h, idx) => <HoldingCard key={idx} holding={h} index={idx} onRemove={() => remove(idx)} onSaveNote={(v) => saveNote(idx, v)} />)
      )}
    </>
  );
}

function PortfolioCharts({ holdings }: { holdings: Holding[] }) {
  const rows: PortfolioRow[] = holdings.map((h) => {
    const d = PL_EXTENDED[h.ticker];
    const px = d?.current_price ?? h.avgCost;
    return {
      ticker: h.ticker,
      marketValue: +(px * h.shares / 1e3).toFixed(1),
      pnl: +(((px - h.avgCost) * h.shares) / 1e3).toFixed(1),
      forecastYoY: d ? +(d.forecast_revenue_yoy * 100).toFixed(2) : 0,
    };
  });

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="card cp">
          <div className="ct">Portfolio Allocation</div>
          <AllocationDonut rows={rows} />
        </div>
        <div className="card cp">
          <div className="ct">P&amp;L by Position</div>
          <PnlBar rows={rows} />
        </div>
      </div>
      <div className="card cp" style={{ marginBottom: 24 }}>
        <div className="ct">Forecast YoY — All Positions</div>
        <ForecastYoYBar rows={rows} />
      </div>
    </>
  );
}

function HoldingCard({
  holding: h, onRemove, onSaveNote,
}: {
  holding: Holding;
  index: number;
  onRemove: () => void;
  onSaveNote: (v: string) => void;
}) {
  const d = PL_EXTENDED[h.ticker];
  const px = d?.current_price ?? h.avgCost;
  const mv = px * h.shares;
  const cb2 = h.avgCost * h.shares;
  const pnl = mv - cb2;
  const pnlPct = pnl / cb2;
  const ups = d ? (d.valuation_band.trustworthy_base - px) / px : null;

  return (
    <div className="pcard">
      <div className="pch">
        <div>
          <Link href={`/ticker/${h.ticker}`} className="pct2" style={{ textDecoration: 'none' }}>{h.ticker}</Link>
          <div className="pcs">
            {d?.sector ?? '—'} · {h.shares.toLocaleString()} shares · {h.date || 'no date'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          {d ? (
            <>
              <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>
              <span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span>
            </>
          ) : (
            <span className="badge ba2">Not yet covered</span>
          )}
          <button className="btn btnd" style={{ fontSize: 12, padding: '5px 12px' }} onClick={onRemove}>Remove</button>
        </div>
      </div>
      <div className="pmg" style={{ gridTemplateColumns: 'repeat(6,1fr)' }}>
        <Metric label="Avg Cost" value={`$${h.avgCost.toFixed(2)}`} />
        <Metric label="Current Price" value={d ? `$${px.toFixed(2)}` : 'N/A'} />
        <Metric label="Market Value" value={fmt(mv)} />
        <Metric label="Unrealized P&L" value={fmt(pnl)} cls={pnl >= 0 ? 'up' : 'dn'} />
        <Metric label="P&L %" value={pct(pnlPct)} cls={pnl >= 0 ? 'up' : 'dn'} />
        <Metric label="Upside to Base" value={ups != null ? pct(ups) : '—'} cls={ups != null ? (ups > 0 ? 'up' : 'dn') : ''} />
      </div>
      {d && (
        <div className="pfs" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          <ForecastCell label={`Anchor (${d.forecast_quarter})`} v={d.anchor_yoy} sub="Conservative baseline" />
          <ForecastCell label="Macro Signal" v={d.macro_only_forecast_yoy} sub={d.macro_signal_label} />
          <ForecastCell label="Projected YoY" v={d.forecast_revenue_yoy} sub={`${fmt(d.forecast_revenue)} est. · unreported`} />
        </div>
      )}
      <div className="pnote">
        <span style={{ fontSize: 12, color: 'var(--slate)', flexShrink: 0 }}>Note:</span>
        <input
          className="ninp"
          defaultValue={h.notes ?? ''}
          placeholder="Add a note for this position…"
          onBlur={(e) => onSaveNote(e.target.value)}
        />
      </div>
    </div>
  );
}

function Metric({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="pmc">
      <div className="pml">{label}</div>
      <div className={`pmv ${cls ?? ''}`}>{value}</div>
    </div>
  );
}

function ForecastCell({ label, v, sub }: { label: string; v: number; sub: string }) {
  return (
    <div className="pfc">
      <div className="pflb">{label}</div>
      <div className={`pfv ${yc(v)}`}>{pct(v)}</div>
      <div className="pfsb">{sub}</div>
    </div>
  );
}
