'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getWatchlist, removeFromWatchlist, toggleWatchlist } from '@/lib/store';
import { PL_EXTENDED } from '@/lib/data';
import { pct, yc, sb, cb } from '@/lib/helpers';

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];

export function WatchlistList() {
  // null = not yet hydrated; avoids SSR/CSR mismatch from localStorage.
  const [tickers, setTickers] = useState<string[] | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    setTickers(getWatchlist());
  }, []);

  if (tickers === null) {
    // Hydration placeholder. Same height as the empty state to avoid layout jump.
    return <div style={{ minHeight: 200 }} />;
  }

  const add = () => {
    const t = draft.trim().toUpperCase();
    if (!t || tickers.includes(t)) return;
    setTickers(toggleWatchlist(t));
    setDraft('');
  };

  const remove = (t: string) => {
    setTickers(removeFromWatchlist(t));
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input
          className="inp"
          placeholder="Ticker (e.g. AAPL)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          style={{ width: 200, textTransform: 'uppercase' }}
        />
        <button className="btn btnp" onClick={add}>+ Add to Watchlist</button>
      </div>

      {tickers.length === 0 ? (
        <div className="empty">
          <div className="eicon">⭐</div>
          <div className="etitle">No tickers saved yet</div>
          <div className="esub">Add tickers above (or click ☆ on the Screener) to track their macro signals at a glance</div>
        </div>
      ) : (
        tickers.map((t, i) => {
          const d = PL_EXTENDED[t];
          if (!d) {
            return (
              <div key={t} className="wlc" style={{ borderLeft: '4px solid var(--amber)', background: 'linear-gradient(90deg,var(--alt),var(--white))' }}>
                <div className="wlbar" style={{ background: COLORS[i % 6] }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="wlt2" style={{ color: 'var(--ink)' }}>{t}</span>
                    <span className="badge ba2">Not yet covered</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--slate2)' }}>
                    This ticker isn&apos;t in MacroLens yet. Coverage requests will be added in a later phase.
                  </div>
                </div>
                <button className="wlrm" onClick={() => remove(t)} aria-label={`Remove ${t}`}>✕</button>
              </div>
            );
          }
          const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
          return (
            <div key={t} className="wlc">
              <div className="wlbar" style={{ background: COLORS[i % 6] }} />
              <Link href={`/ticker/${t}`} className="wlt2" style={{ textDecoration: 'none' }}>{t}</Link>
              <div className="wlbd">
                <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>
                <span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span>
                <span className="badge bx2">{d.sector}</span>
              </div>
              <div className="wln">
                <div className={`wly ${yc(d.forecast_revenue_yoy)}`}>{pct(d.forecast_revenue_yoy)}</div>
                <div className="wlsb">Next Q rev YoY</div>
              </div>
              <div className="wln" style={{ marginLeft: 8 }}>
                <div className={`wly ${ups > 0 ? 'up' : 'dn'}`}>{pct(ups)}</div>
                <div className="wlsb">Upside to base</div>
              </div>
              <div className="wln" style={{ marginLeft: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>${d.current_price.toFixed(2)}</div>
                <div className="wlsb">Current</div>
              </div>
              <button className="wlrm" onClick={() => remove(t)} aria-label={`Remove ${t}`}>✕</button>
            </div>
          );
        })
      )}
    </>
  );
}
