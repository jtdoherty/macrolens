// Pure-CSS valuation band: track with bear / base / bull markers and a
// current-price pin overlay. Server-renderable — no Chart.js, no client JS.

import type { ValuationBand as ValuationBandData } from '@/lib/types';
import { pct } from '@/lib/helpers';

export function ValuationBand({ band, currentPrice }: { band: ValuationBandData; currentPrice: number }) {
  const bear = band.trustworthy_bear;
  const base = band.trustworthy_base;
  const bull = band.trustworthy_bull;

  const mn = Math.min(bear, currentPrice) * 0.88;
  const mx = Math.max(bull, currentPrice) * 1.08;
  const span = mx - mn;
  const posPct = (v: number) => (((v - mn) / span) * 100).toFixed(2);

  const fillLeft = posPct(bear);
  const fillWidth = (Number(posPct(bull)) - Number(posPct(bear))).toFixed(2);
  const pinLeft = posPct(currentPrice);

  const upsPct = (base - currentPrice) / currentPrice;
  const upsCls = upsPct > 0 ? 'up' : 'dn';

  return (
    <div className="val-band-card">
      <div className="val-band-header">
        <div>
          <div className="val-band-title">Valuation Band</div>
          <div className="val-band-subtitle">Trust-adjusted P/S · based on walk-forward confidence &amp; MAE</div>
        </div>
        <div className="val-band-current">
          <div className="val-band-price">${currentPrice.toFixed(2)}</div>
          <div className="val-band-price-lbl">Current price</div>
        </div>
      </div>

      <div className="vb-track-wrap">
        <div className="vb-track">
          <div className="vb-fill" style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }} />

          <Zone leftPct={posPct(bear)} value={bear} label="Bear" color="var(--red)" />
          <Zone leftPct={posPct(base)} value={base} label="Base" color="var(--blue)" />
          <Zone leftPct={posPct(bull)} value={bull} label="Bull" color="var(--green)" />

          <div className="vb-pin" style={{ left: `${pinLeft}%`, top: '50%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-50%)' }}>
              <div className="vb-pin-line" />
              <div style={{ position: 'relative' }}>
                <div className="vb-pin-label">${currentPrice.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="vb-summary">
        <SummaryItem label="Bear Case" value={`$${bear}`} subValue={pct((bear - currentPrice) / currentPrice)} valueClass="dn" subClass="dn" />
        <SummaryItem label="Base Case" value={`$${base}`} subValue={pct(upsPct)} valueColor="var(--blue)" subClass={upsCls} />
        <SummaryItem label="Bull Case" value={`$${bull}`} subValue={pct((bull - currentPrice) / currentPrice)} valueClass="up" subClass="up" />
        <div
          className="vb-sum-item"
          style={{
            background: upsPct > 0 ? 'var(--glt)' : 'var(--rlt)',
            borderRadius: 'var(--r)',
            border: `1px solid ${upsPct > 0 ? 'var(--gmd)' : 'var(--rmd)'}`,
          }}
        >
          <div className="vb-sum-lbl">vs Base</div>
          <div className={`vb-sum-val ${upsCls}`}>{pct(upsPct)}</div>
          <div className="vb-sum-pct" style={{ color: 'var(--slate)' }}>to target</div>
        </div>
      </div>
    </div>
  );
}

function Zone({ leftPct, value, label, color }: { leftPct: string; value: number; label: string; color: string }) {
  return (
    <div className="vb-zone" style={{ left: `${leftPct}%` }}>
      <div className="vb-zone-val" style={{ color }}>${value}</div>
      <div className="vb-zone-dot" style={{ background: color, color }} />
      <div className="vb-zone-label" style={{ color }}>{label}</div>
    </div>
  );
}

function SummaryItem({
  label, value, subValue, valueClass, subClass, valueColor,
}: {
  label: string;
  value: string;
  subValue: string;
  valueClass?: string;
  subClass?: string;
  valueColor?: string;
}) {
  return (
    <div className="vb-sum-item">
      <div className="vb-sum-lbl">{label}</div>
      <div className={`vb-sum-val ${valueClass ?? ''}`} style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </div>
      <div className={`vb-sum-pct ${subClass ?? ''}`}>{subValue}</div>
    </div>
  );
}
