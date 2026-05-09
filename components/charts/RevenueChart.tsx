'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  BarController,
  LineController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { ForecastPayload } from '@/lib/types';

// Register once. Multiple registrations of the same item are no-ops in Chart.js.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  BarController,
  LineController,
);

// Quarterly revenue history with two forecast paths overlaid (macro-adjusted blend
// + anchor-only). Used by Forecast View, Ticker Detail, and Comparison.
export function RevenueChart({ data, height = 240 }: { data: ForecastPayload; height?: number }) {
  const hist = data.revenue_history;
  if (hist.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate2)', fontSize: 13 }}>
        Revenue history not yet available for {data.ticker}
      </div>
    );
  }

  const ancRev = (data.forecast_revenue * (1 + data.anchor_yoy)) / (1 + data.forecast_revenue_yoy);
  const labels = [...hist.map((h) => h.q), `→ ${data.forecast_quarter} (proj.)`];
  const acts = hist.map((h) => h.v / 1e9);
  const lastAct = acts[acts.length - 1];
  const blend = [...Array(hist.length - 1).fill(null), lastAct, data.forecast_revenue / 1e9];
  const anch = [...Array(hist.length - 1).fill(null), lastAct, ancRev / 1e9];

  return (
    <div style={{ position: 'relative', height }}>
      <Chart
        type="bar"
        data={{
          labels,
          datasets: [
            {
              type: 'bar' as const,
              label: 'Actual',
              data: [...acts, null],
              backgroundColor: 'rgba(59,91,219,.22)',
              borderColor: 'rgba(59,91,219,.7)',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              type: 'line' as const,
              label: 'Macro-adj',
              data: blend,
              borderColor: '#059669',
              backgroundColor: 'rgba(5,150,105,.05)',
              borderWidth: 2.5,
              pointRadius: [...Array(hist.length - 1).fill(0), 5, 8],
              pointBackgroundColor: '#059669',
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              fill: false,
              tension: 0.3,
            },
            {
              type: 'line' as const,
              label: 'Anchor',
              data: anch,
              borderColor: '#94a3b8',
              borderWidth: 1.5,
              borderDash: [5, 4],
              pointRadius: [...Array(hist.length - 1).fill(0), 4, 6],
              pointBackgroundColor: '#94a3b8',
              pointBorderColor: 'white',
              pointBorderWidth: 2,
              fill: false,
              tension: 0.3,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 380, easing: 'easeOutQuart' },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, font: { family: 'Figtree', size: 11 }, color: '#64748b' },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: '#fff',
              borderColor: '#dde3f0',
              borderWidth: 1,
              titleColor: '#4a5770',
              bodyColor: '#0f172a',
              padding: 12,
              callbacks: {
                label: (c) => (c.parsed.y != null ? `${c.dataset.label}: $${c.parsed.y.toFixed(1)}B` : ''),
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8', font: { family: 'Figtree', size: 10 }, maxRotation: 45, autoSkip: false },
              grid: { color: 'rgba(0,0,0,.04)' },
              border: { color: '#e4e7ec' },
            },
            y: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Figtree', size: 10 },
                callback: (v) => '$' + (typeof v === 'number' ? v.toFixed(0) : v) + 'B',
              },
              grid: { color: 'rgba(0,0,0,.04)' },
              border: { color: '#e4e7ec' },
            },
          },
        }}
      />
    </div>
  );
}
