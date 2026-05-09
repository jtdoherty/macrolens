import { FinancialChart } from '@/components/charts/FinancialChart';
import type { FinancialsPayload } from '@/lib/types';

export function RatiosTab({ f }: { f: FinancialsPayload }) {
  const r = f.ratios;
  const a = f.annual;
  const gmA = a.revenue.map((rv, i) => +((a.gross_profit[i] / rv) * 100).toFixed(1));
  const omA = a.revenue.map((rv, i) => +((a.operating_income[i] / rv) * 100).toFixed(1));
  const nmA = a.revenue.map((rv, i) => +((a.net_income[i] / rv) * 100).toFixed(1));
  const roeA = a.net_income.map((n, i) => +((n / a.equity[i]) * 100).toFixed(1));
  const roaA = a.net_income.map((n, i) => +((n / a.total_assets[i]) * 100).toFixed(1));

  const groups: { title: string; items: [string, string, string][] }[] = [
    { title: 'Valuation', items: [['P/E Ratio', r.pe + 'x', 'Price / EPS'], ['P/S Ratio', r.ps + 'x', 'Price / Revenue'], ['EV/EBITDA', r.ev_ebitda + 'x', 'Enterprise value multiple']] },
    { title: 'Profitability', items: [['Gross Margin', r.gross_margin + '%', 'Gross profit / Revenue'], ['Operating Margin', r.operating_margin + '%', 'Op. income / Revenue'], ['Net Margin', r.net_margin + '%', 'Net income / Revenue']] },
    { title: 'Returns', items: [['ROE', r.roe + '%', 'Return on equity'], ['ROA', r.roa + '%', 'Return on assets']] },
    { title: 'Leverage & Liquidity', items: [['Debt / Equity', r.debt_equity + 'x', 'Total debt / equity'], ['Current Ratio', r.current_ratio + 'x', 'Current assets / liabilities']] },
  ];

  return (
    <>
      {groups.map((g) => (
        <div key={g.title} className="tkr-section">
          <div className="sh2">{g.title}</div>
          <div className="ratio-grid" style={{ gridTemplateColumns: `repeat(${Math.min(g.items.length, 5)},1fr)` }}>
            {g.items.map(([label, value, sub]) => (
              <div key={label} className="ratio-card">
                <div className="ratio-label">{label}</div>
                <div className="ratio-value">{value}</div>
                <div className="ratio-sub">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="sh2" style={{ marginTop: 8 }}>Margin Trends — Annual</div>
      <div className="chart-grid-2">
        <Box title="Profitability Margins — Annual" sub="Gross, Operating, Net margin %">
          <FinancialChart
            labels={a.years}
            format="percent"
            unit="%"
            preScaled
            datasets={[
              { label: 'Gross %', data: gmA, color: '#0d9e6e' },
              { label: 'Operating %', data: omA, color: '#d97706' },
              { label: 'Net %', data: nmA, color: '#3b5bdb' },
            ]}
          />
        </Box>
        <Box title="ROE & ROA — Annual" sub="Return metrics over time">
          <FinancialChart
            labels={a.years}
            format="percent"
            unit="%"
            preScaled
            datasets={[
              { label: 'ROE %', data: roeA, color: '#7c3aed' },
              { label: 'ROA %', data: roaA, color: '#0891b2' },
            ]}
          />
        </Box>
      </div>
    </>
  );
}

function Box({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="chart-box">
      <div className="chart-box-title">{title}</div>
      <div className="chart-box-sub">{sub}</div>
      <div className="chart-h">{children}</div>
    </div>
  );
}
