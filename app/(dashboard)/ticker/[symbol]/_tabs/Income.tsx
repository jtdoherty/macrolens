import { FinancialChart } from '@/components/charts/FinancialChart';
import type { FinancialsPayload } from '@/lib/types';

export function IncomeTab({ f }: { f: FinancialsPayload }) {
  const q = f.quarterly;
  const a = f.annual;
  const gm = q.revenue.map((r, i) => +((q.gross_profit[i] / r) * 100).toFixed(1));
  const om = q.revenue.map((r, i) => +((q.operating_income[i] / r) * 100).toFixed(1));
  const nm = q.revenue.map((r, i) => +((q.net_income[i] / r) * 100).toFixed(1));

  return (
    <>
      <div className="chart-grid-1">
        <Box title="Quarterly Revenue, Gross Profit & Operating Income" sub="Last 12 quarters — from SEC filings" tall>
          <FinancialChart
            labels={q.periods}
            datasets={[
              { label: 'Revenue', data: q.revenue, color: '#3b5bdb' },
              { label: 'Gross Profit', data: q.gross_profit, color: '#0d9e6e' },
              { label: 'Op. Income', data: q.operating_income, color: '#d97706' },
            ]}
          />
        </Box>
      </div>

      <div className="chart-grid-2">
        <Box title="Quarterly Net Income" sub="Last 12 quarters">
          <FinancialChart labels={q.periods} datasets={[{ label: 'Net Income', data: q.net_income, color: '#0d9e6e', diverging: true }]} />
        </Box>
        <Box title="Margin Trends" sub="Gross, Operating, Net — quarterly %">
          <FinancialChart
            labels={q.periods}
            format="percent"
            unit="%"
            preScaled
            datasets={[
              { label: 'Gross %', data: gm, color: '#059669', type: 'line' },
              { label: 'Op. %', data: om, color: '#d97706', type: 'line' },
              { label: 'Net %', data: nm, color: '#2563eb', type: 'line' },
            ]}
          />
        </Box>
      </div>

      <div className="chart-grid-2">
        <Box title="Annual Revenue & Profit Stack" sub="5-year annual history">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'Revenue', data: a.revenue, color: '#3b5bdb' },
              { label: 'Gross Profit', data: a.gross_profit, color: '#0d9e6e' },
              { label: 'Net Income', data: a.net_income, color: '#d97706', diverging: true },
            ]}
          />
        </Box>
        <Box title="Annual Net Income" sub="5-year history">
          <FinancialChart labels={a.years} datasets={[{ label: 'Net Income', data: a.net_income, color: '#0d9e6e', diverging: true }]} />
        </Box>
      </div>
    </>
  );
}

function Box({ title, sub, tall, children }: { title: string; sub: string; tall?: boolean; children: React.ReactNode }) {
  return (
    <div className="chart-box">
      <div className="chart-box-title">{title}</div>
      <div className="chart-box-sub">{sub}</div>
      <div className={tall ? 'chart-h-tall' : 'chart-h'}>{children}</div>
    </div>
  );
}
