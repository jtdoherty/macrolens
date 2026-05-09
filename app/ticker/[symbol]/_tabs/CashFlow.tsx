import { FinancialChart } from '@/components/charts/FinancialChart';
import type { FinancialsPayload } from '@/lib/types';

export function CashFlowTab({ f }: { f: FinancialsPayload }) {
  const q = f.quarterly;
  const a = f.annual;

  return (
    <>
      <div className="chart-grid-1">
        <Box title="Quarterly Cash Flow Overview" sub="Operating CF, CapEx, and Free Cash Flow — last 12 quarters" tall>
          <FinancialChart
            labels={q.periods}
            datasets={[
              { label: 'Op. Cash Flow', data: q.op_cash_flow, color: '#3b5bdb' },
              { label: 'CapEx', data: q.capex, color: '#dc2626', invert: true },
              { label: 'Free Cash Flow', data: q.fcf, color: '#059669', type: 'line' },
            ]}
          />
        </Box>
      </div>

      <div className="chart-grid-2">
        <Box title="Quarterly Free Cash Flow" sub="FCF = Operating CF − CapEx">
          <FinancialChart labels={q.periods} datasets={[{ label: 'FCF', data: q.fcf, color: '#059669', diverging: true }]} />
        </Box>
        <Box title="Quarterly CapEx" sub="Capital expenditure trend">
          <FinancialChart labels={q.periods} datasets={[{ label: 'CapEx', data: q.capex, color: '#d97706' }]} />
        </Box>
      </div>

      <div className="chart-grid-2">
        <Box title="Annual Cash Flow" sub="5-year operating CF vs FCF">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'Op. Cash Flow', data: a.op_cash_flow, color: '#3b5bdb' },
              { label: 'Free Cash Flow', data: a.fcf, color: '#0d9e6e', diverging: true },
            ]}
          />
        </Box>
        <Box title="Annual CapEx vs FCF" sub="Investment intensity over time">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'CapEx', data: a.capex, color: '#d97706' },
              { label: 'FCF', data: a.fcf, color: '#0d9e6e', diverging: true },
            ]}
          />
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
