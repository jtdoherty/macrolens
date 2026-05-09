import { FinancialChart } from '@/components/charts/FinancialChart';
import { fmt } from '@/lib/helpers';
import type { FinancialsPayload } from '@/lib/types';

export function OverviewTab({ f }: { f: FinancialsPayload }) {
  const r = f.ratios;
  const q = f.quarterly;
  const a = f.annual;
  const lastRev = q.revenue[q.revenue.length - 1];
  const lastGP = q.gross_profit[q.gross_profit.length - 1];
  const lastNI = q.net_income[q.net_income.length - 1];
  const lastFCF = q.fcf[q.fcf.length - 1];
  const gm = ((lastGP / lastRev) * 100).toFixed(1);
  const nm = ((lastNI / lastRev) * 100).toFixed(1);

  return (
    <>
      <div className="tkr-section">
        <div className="sh2">Key Metrics — Latest Quarter</div>
        <div className="ratio-grid" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          <RatioCard label="Revenue" value={fmt(lastRev)} sub="Most recent quarter" />
          <RatioCard label="Gross Profit" value={fmt(lastGP)} sub="Latest Q" />
          <RatioCard label="Net Income" value={fmt(lastNI)} sub={lastNI >= 0 ? 'Profitable' : 'Loss-making'} />
          <RatioCard label="Free Cash Flow" value={fmt(lastFCF)} sub="Op CF − CapEx" />
          <RatioCard label="Mkt Cap" value={fmt(f.market_cap)} sub="Current" />
        </div>
        <div className="ratio-grid">
          <RatioCard label="Gross Margin" value={gm + '%'} />
          <RatioCard label="Net Margin" value={nm + '%'} />
          <RatioCard label="P/E Ratio" value={r.pe + 'x'} />
          <RatioCard label="P/S Ratio" value={r.ps + 'x'} />
          <RatioCard label="EV/EBITDA" value={r.ev_ebitda + 'x'} />
        </div>
      </div>

      <div className="chart-grid-2">
        <ChartBox title="Quarterly Revenue" sub="Last 12 quarters">
          <FinancialChart labels={q.periods} datasets={[{ label: 'Revenue', data: q.revenue, color: '#2563eb' }]} />
        </ChartBox>
        <ChartBox title="Quarterly Net Income" sub="Last 12 quarters">
          <FinancialChart labels={q.periods} datasets={[{ label: 'Net Income', data: q.net_income, color: '#0d9e6e', diverging: true }]} />
        </ChartBox>
      </div>

      <div className="chart-grid-2">
        <ChartBox title="Annual Revenue & Gross Profit" sub="5-year history">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'Revenue', data: a.revenue, color: '#3b5bdb' },
              { label: 'Gross Profit', data: a.gross_profit, color: '#0d9e6e' },
            ]}
          />
        </ChartBox>
        <ChartBox title="Annual Free Cash Flow" sub="5-year history">
          <FinancialChart labels={a.years} datasets={[{ label: 'FCF', data: a.fcf, color: '#059669', diverging: true }]} />
        </ChartBox>
      </div>
    </>
  );
}

function RatioCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="ratio-card">
      <div className="ratio-label">{label}</div>
      <div className="ratio-value">{value}</div>
      {sub && <div className="ratio-sub">{sub}</div>}
    </div>
  );
}

function ChartBox({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="chart-box">
      <div className="chart-box-title">{title}</div>
      <div className="chart-box-sub">{sub}</div>
      <div className="chart-h">{children}</div>
    </div>
  );
}
