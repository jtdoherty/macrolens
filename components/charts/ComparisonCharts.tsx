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
import { Line, Bar } from 'react-chartjs-2';
import type { ForecastPayload } from '@/lib/types';

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

const COLORS = ['#3b5bdb', '#0d9e6e', '#c47a0c', '#e03e3e'];

// Multi-ticker revenue history overlay. Skips tickers with no history.
export function ComparisonRevenueChart({ tickers, height = 240 }: { tickers: ForecastPayload[]; height?: number }) {
  const withHistory = tickers.filter((t) => t.revenue_history.length > 0);
  if (withHistory.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate2)', fontSize: 13 }}>
        Selected tickers don&apos;t have revenue history yet (extended dataset only includes forecast metrics).
      </div>
    );
  }

  const labels = withHistory[0].revenue_history.map((h) => h.q);

  return (
    <div style={{ height, position: 'relative' }}>
      <Line
        data={{
          labels,
          datasets: tickers.map((t, i) => ({
            label: t.ticker,
            data: t.revenue_history.length > 0 ? t.revenue_history.map((h) => h.v / 1e9) : [],
            borderColor: COLORS[i % COLORS.length],
            backgroundColor: COLORS[i % COLORS.length] + '22',
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: COLORS[i % COLORS.length],
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            fill: false,
            tension: 0.3,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, font: { family: 'Figtree', size: 11 }, color: '#64748b' },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'white',
              borderColor: '#dde3f0',
              borderWidth: 1,
              titleColor: '#4a5770',
              bodyColor: '#0f172a',
              padding: 12,
              callbacks: {
                label: (c) => (c.parsed.y != null ? ` ${c.dataset.label}: $${c.parsed.y.toFixed(1)}B` : ''),
              },
            },
          },
          scales: {
            x: {
              ticks: { color: '#94a3b8', font: { family: 'Figtree', size: 10 }, maxRotation: 45 },
              grid: { color: 'rgba(0,0,0,.04)' },
              border: { color: '#e2e6ef' },
            },
            y: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Figtree', size: 10 },
                callback: (v) => '$' + (typeof v === 'number' ? v : 0) + 'B',
              },
              grid: { color: 'rgba(0,0,0,.04)' },
              border: { color: '#e2e6ef' },
            },
          },
        }}
      />
    </div>
  );
}

// Grouped bar chart: macro-adjusted blend YoY vs anchor-only YoY per ticker.
export function ComparisonForecastChart({ tickers, height = 160 }: { tickers: ForecastPayload[]; height?: number }) {
  return (
    <div style={{ height, position: 'relative' }}>
      <Bar
        data={{
          labels: tickers.map((t) => t.ticker),
          datasets: [
            {
              label: 'Macro-adj YoY',
              data: tickers.map((t) => +(t.forecast_revenue_yoy * 100).toFixed(2)),
              backgroundColor: tickers.map((_, i) => COLORS[i % COLORS.length] + '55'),
              borderColor: tickers.map((_, i) => COLORS[i % COLORS.length]),
              borderWidth: 2,
              borderRadius: 6,
            },
            {
              label: 'Anchor YoY',
              data: tickers.map((t) => +(t.anchor_yoy * 100).toFixed(2)),
              backgroundColor: tickers.map((_, i) => COLORS[i % COLORS.length] + '22'),
              borderColor: tickers.map((_, i) => COLORS[i % COLORS.length]),
              borderWidth: 1.5,
              borderRadius: 6,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: { boxWidth: 10, font: { family: 'Figtree', size: 11 }, color: '#64748b' },
            },
            tooltip: {
              backgroundColor: 'white',
              borderColor: '#dde3f0',
              borderWidth: 1,
              titleColor: '#4a5770',
              bodyColor: '#0f172a',
              padding: 10,
              callbacks: {
                label: (c) => {
                  const y = c.parsed.y;
                  if (y == null) return '';
                  return ` ${c.dataset.label}: ${y > 0 ? '+' : ''}${y}%`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { family: 'Figtree', size: 11 } }, grid: { display: false }, border: { color: '#e2e6ef' } },
            y: {
              ticks: {
                color: '#94a3b8',
                font: { family: 'Figtree', size: 10 },
                callback: (v) => v + '%',
              },
              grid: { color: 'rgba(0,0,0,.04)' },
              border: { color: '#e2e6ef' },
            },
          },
        }}
      />
    </div>
  );
}

export { COLORS as COMPARISON_COLORS };
