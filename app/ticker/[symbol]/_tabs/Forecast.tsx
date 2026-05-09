import { ValuationBand } from '@/components/ValuationBand';
import { RevenueChart } from '@/components/charts/RevenueChart';
import { fmt, pct, yc, alb } from '@/lib/helpers';
import type { ForecastPayload } from '@/lib/types';

export function ForecastTab({ d }: { d: ForecastPayload }) {
  const ancRev = (d.forecast_revenue * (1 + d.anchor_yoy)) / (1 + d.forecast_revenue_yoy);
  const macroRev = (d.forecast_revenue * (1 + d.macro_only_forecast_yoy)) / (1 + d.forecast_revenue_yoy);

  return (
    <>
      <div className="sh2">Valuation Band</div>
      <ValuationBand band={d.valuation_band} currentPrice={d.current_price} />

      <div className="sh2" style={{ marginBottom: 8 }}>
        Three-Layer Revenue Forecast — Next Quarter ({d.forecast_quarter})
      </div>
      <div className="fc3" style={{ marginBottom: 24 }}>
        <Card type="Conservative Anchor" yoy={d.anchor_yoy} revenue={ancRev}>
          Anchor: <b>{alb(d.selected_anchor)}</b>
          <br />No macro adjustment
          <br />Trend-only baseline
        </Card>
        <Card type="Macro Signal Only" yoy={d.macro_only_forecast_yoy} revenue={macroRev}>
          Model: <b>{d.selected_model_mode}</b>
          <br />Lags: <b>{d.selected_lags.join(', ')}Q</b>
        </Card>
        <Card type="Macro-Adjusted Blend" yoy={d.forecast_revenue_yoy} revenue={d.forecast_revenue} selected>
          <b>{Math.round((1 - d.macro_weight) * 100)}%</b> anchor + <b>{Math.round(d.macro_weight * 100)}%</b> macro
          <br />MAE <b>{(d.walk_forward_mae * 100).toFixed(1)}pp</b> · R² <b>{d.walk_forward_r2.toFixed(2)}</b>
        </Card>
      </div>

      <div className="sh2">Revenue History &amp; Forecast</div>
      <div className="chart-box" style={{ marginBottom: 22 }}>
        <div className="chart-box-title">Quarterly Revenue + Forecast Paths</div>
        <RevenueChart data={d} height={260} />
      </div>

      <div className="sh2">Selected Macro Drivers</div>
      <div className="card cp">
        {d.selected_features.map((feat, i) => (
          <span key={feat} className="fpill">
            {feat}<span className="fpl">lag {d.selected_lags[i]}Q</span>
          </span>
        ))}
      </div>
    </>
  );
}

function Card({
  type, yoy, revenue, children, selected = false,
}: {
  type: string;
  yoy: number;
  revenue: number;
  children: React.ReactNode;
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
      <div className="fcd">{children}</div>
    </div>
  );
}
