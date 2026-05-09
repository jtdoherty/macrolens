import { FinancialChart } from '@/components/charts/FinancialChart';
import { fmt } from '@/lib/helpers';
import type { FinancialsPayload } from '@/lib/types';

export function BalanceTab({ f }: { f: FinancialsPayload }) {
  const a = f.annual;
  const de = a.total_debt.map((d, i) => (a.equity[i] > 0 ? +(d / a.equity[i]).toFixed(2) : 0));

  return (
    <>
      <div className="chart-grid-2">
        <Box title="Total Assets vs Total Debt" sub="Annual — 5 years">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'Total Assets', data: a.total_assets, color: '#3b5bdb' },
              { label: 'Total Debt', data: a.total_debt, color: '#dc2626' },
            ]}
          />
        </Box>
        <Box title="Shareholders' Equity" sub="Annual — 5 years">
          <FinancialChart labels={a.years} datasets={[{ label: 'Equity', data: a.equity, color: '#0d9e6e', diverging: true }]} />
        </Box>
      </div>

      <div className="chart-grid-2">
        <Box title="Debt-to-Equity Ratio" sub="Annual — lower is safer">
          <FinancialChart
            labels={a.years}
            format="ratio"
            unit="x"
            preScaled
            datasets={[{ label: 'D/E', data: de, color: '#dc2626' }]}
          />
        </Box>
        <Box title="Balance Sheet Composition" sub="Assets, Debt, Equity — annual">
          <FinancialChart
            labels={a.years}
            datasets={[
              { label: 'Assets', data: a.total_assets, color: '#2563eb' },
              { label: 'Debt', data: a.total_debt, color: '#dc2626' },
              { label: 'Equity', data: a.equity, color: '#059669' },
            ]}
          />
        </Box>
      </div>

      <div className="ratio-grid" style={{ marginTop: 4 }}>
        <RC label="Total Assets" value={fmt(a.total_assets[4])} sub="FY24" />
        <RC label="Total Debt" value={fmt(a.total_debt[4])} sub="FY24" />
        <RC label="Equity" value={fmt(a.equity[4])} sub="FY24" />
        <RC label="D/E Ratio" value={de[4] + 'x'} sub="FY24" />
        <RC label="Current Ratio" value={f.ratios.current_ratio + 'x'} sub="Latest" />
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

function RC({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="ratio-card">
      <div className="ratio-label">{label}</div>
      <div className="ratio-value">{value}</div>
      <div className="ratio-sub">{sub}</div>
    </div>
  );
}
