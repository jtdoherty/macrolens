import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getForecast, getKnownForecastTickers } from '@/lib/forecast-store';
import { fmt, pct, yc, alb, cb, sb } from '@/lib/helpers';
import { ValuationBand } from '@/components/ValuationBand';
import { RevenueChart } from '@/components/charts/RevenueChart';
import type { ForecastPayload } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Ticker selection lives in the URL (?ticker=MSFT) so the page is shareable
// and the back button works. Defaults to AAPL when no param present.
export default async function ForecastPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker: requested } = await searchParams;
  const ticker = (requested ?? 'AAPL').toUpperCase();
  const d = await getForecast(ticker);
  if (!d) notFound();
  const tickerOptions = await getKnownForecastTickers();

  return (
    <>
      <div className="ph">
        <div className="ph-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1>Forecast View</h1>
            <p>
              Projecting <strong>next quarter revenue</strong> using macro-adjusted models — anchor, macro signal, and walk-forward selected blend
            </p>
          </div>
          <span className="badge bb2" style={{ fontSize: 12, padding: '5px 12px', marginTop: 4, flexShrink: 0 }}>
            📅 Projecting {d.forecast_quarter}
          </span>
        </div>
      </div>

      <div className="pb">
        {/* TICKER SELECTOR */}
        <div className="ts">
          {tickerOptions.map((t) => (
            <Link key={t} href={`/forecast?ticker=${t}`} className={`tc${t === ticker ? ' active' : ''}`}>
              {t}
            </Link>
          ))}
        </div>

        <SummaryCards data={d} />

        <div className="sh2">Valuation Band</div>
        <ValuationBand band={d.valuation_band} currentPrice={d.current_price} />

        <ThreeLayerForecast data={d} />

        <div className="sh2">Revenue History &amp; Forecast</div>
        <div className="card cp" style={{ marginBottom: 22 }}>
          <div className="ct">
            Quarterly Revenue
            <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--slate)' }}>
              — Actual bars + macro-adjusted forecast (solid) + anchor-only forecast (dashed)
            </span>
          </div>
          <RevenueChart data={d} height={250} />
        </div>

        <WalkForward data={d} />

        <MacroDrivers data={d} />
      </div>
    </>
  );
}

function SummaryCards({ data: d }: { data: ForecastPayload }) {
  const ups = (d.valuation_band.trustworthy_base - d.current_price) / d.current_price;
  return (
    <div className="sg sg4" style={{ marginBottom: 22 }}>
      <div className="sc bl">
        <div className="sl">Forecast Revenue</div>
        <div className="sv">{fmt(d.forecast_revenue)}</div>
        <div className="ss">Projected · {d.forecast_quarter} (unreported)</div>
      </div>
      <div className="sc">
        <div className="sl">YoY Growth</div>
        <div className={`sv ${yc(d.forecast_revenue_yoy)}`}>{pct(d.forecast_revenue_yoy)}</div>
        <div className="ss">
          {Math.round((1 - d.macro_weight) * 100)}% anchor + {Math.round(d.macro_weight * 100)}% macro
        </div>
      </div>
      <div className="sc">
        <div className="sl">Confidence</div>
        <div className="sv" style={{ fontSize: 17, marginTop: 4 }}>
          <span className={`badge ${cb(d.confidence)}`}>{d.confidence}</span>
        </div>
        <div className="ss">{d.selected_model_mode} · {alb(d.selected_anchor)}</div>
      </div>
      <div className={`sc ${ups > 0 ? 'gl' : 'rl'}`}>
        <div className="sl">Upside to Base</div>
        <div className={`sv ${ups > 0 ? 'up' : 'dn'}`}>{pct(ups)}</div>
        <div className="ss">${d.current_price.toFixed(2)} → ${d.valuation_band.trustworthy_base}</div>
      </div>
    </div>
  );
}

function ThreeLayerForecast({ data: d }: { data: ForecastPayload }) {
  const ancRev = (d.forecast_revenue * (1 + d.anchor_yoy)) / (1 + d.forecast_revenue_yoy);
  const macroRev = (d.forecast_revenue * (1 + d.macro_only_forecast_yoy)) / (1 + d.forecast_revenue_yoy);

  return (
    <>
      <div className="sh2" style={{ marginBottom: 8 }}>
        Three-Layer Revenue Forecast — Next Quarter ({d.forecast_quarter})
      </div>
      <div
        style={{
          background: 'linear-gradient(135deg,var(--blt),#e8edff)',
          border: '1px solid var(--bmd)',
          borderRadius: 'var(--r)',
          padding: '10px 14px',
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--ink2)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--blue)' }}>What this shows:</strong> Three independent estimates of {d.ticker}&apos;s revenue for{' '}
        <strong>{d.forecast_quarter}</strong> — the quarter that has not yet been reported. The blend (selected model) is MacroLens&apos;s primary forecast.
      </div>
      <div className="fc3">
        <ForecastCard
          type="Conservative Anchor"
          yoy={d.anchor_yoy}
          revenue={ancRev}
          detail={
            <>
              Anchor: <b>{alb(d.selected_anchor)}</b>
              <br />
              No macro adjustment
              <br />
              Trend-only baseline
            </>
          }
        />
        <ForecastCard
          type="Macro Signal Only"
          yoy={d.macro_only_forecast_yoy}
          revenue={macroRev}
          detail={
            <>
              Model: <b>{d.selected_model_mode}</b>
              <br />
              Lags: <b>{d.selected_lags.join(', ')}Q</b>
              <br />
              100% macro weight
            </>
          }
        />
        <ForecastCard
          type="Macro-Adjusted Blend"
          selected
          yoy={d.forecast_revenue_yoy}
          revenue={d.forecast_revenue}
          detail={
            <>
              <b>{Math.round((1 - d.macro_weight) * 100)}%</b> anchor + <b>{Math.round(d.macro_weight * 100)}%</b> macro
              <br />
              Walk-forward selected
              <br />
              MAE <b>{(d.walk_forward_mae * 100).toFixed(1)}pp</b> · R² <b>{d.walk_forward_r2.toFixed(2)}</b>
            </>
          }
        />
      </div>
    </>
  );
}

function ForecastCard({
  type, yoy, revenue, detail, selected = false,
}: {
  type: string;
  yoy: number;
  revenue: number;
  detail: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <div className={`fcc${selected ? ' sel' : ''}`}>
      <div className="fct">
        {type}
        {selected && <span className="fcs2">SELECTED</span>}
      </div>
      <div className={`fcy ${yc(yoy)}`}>{pct(yoy)}</div>
      <div className="fcr">{fmt(revenue)} revenue</div>
      <div className="div"></div>
      <div className="fcd">{detail}</div>
    </div>
  );
}

function WalkForward({ data: d }: { data: ForecastPayload }) {
  return (
    <>
      <div className="sh2">Walk-Forward Validation</div>
      <div className="wfg" style={{ marginBottom: 22 }}>
        <div className="wfi">
          <div className="wfl">MAE — Revenue YoY</div>
          <div className={`wfv ${d.walk_forward_mae < 0.025 ? 'up' : d.walk_forward_mae < 0.04 ? 'fl' : 'dn'}`}>
            {(d.walk_forward_mae * 100).toFixed(1)}pp
          </div>
        </div>
        <div className="wfi">
          <div className="wfl">R² Out-of-Sample</div>
          <div className={`wfv ${d.walk_forward_r2 > 0.5 ? 'up' : d.walk_forward_r2 > 0.2 ? 'fl' : 'dn'}`}>
            {d.walk_forward_r2.toFixed(2)}
          </div>
        </div>
        <div className="wfi">
          <div className="wfl">Macro Weight</div>
          <div className="wfv">{Math.round(d.macro_weight * 100)}%</div>
        </div>
      </div>
    </>
  );
}

function MacroDrivers({ data: d }: { data: ForecastPayload }) {
  return (
    <>
      <div className="sh2">Selected Macro Drivers</div>
      <div className="card cp">
        {d.selected_features.map((f, i) => (
          <span key={f} className="fpill">
            {f}
            <span className="fpl">lag {d.selected_lags[i]}Q</span>
          </span>
        ))}
        <div className="div"></div>
        <span style={{ fontSize: 12, color: 'var(--slate)' }}>
          Model: <b style={{ color: 'var(--ink2)' }}>{d.selected_model_mode}</b> · Anchor:{' '}
          <b style={{ color: 'var(--ink2)' }}>{alb(d.selected_anchor)}</b> · Signal:{' '}
          <span className={`badge ${sb(d.macro_signal_label)}`}>{d.macro_signal_label}</span>
        </span>
      </div>
    </>
  );
}
