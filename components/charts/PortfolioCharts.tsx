'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  BarController,
  DoughnutController,
);

const COLORS = ['#3b5bdb', '#0d9e6e', '#c47a0c', '#e03e3e', '#6c47ff', '#0891b2', '#e11d48', '#65a30d'];

export type PortfolioRow = {
  ticker: string;
  marketValue: number;   // $K
  pnl: number;           // $K
  forecastYoY: number;   // %
};

export function AllocationDonut({ rows, height = 200 }: { rows: PortfolioRow[]; height?: number }) {
  return (
    <div style={{ height, position: 'relative' }}>
      <Doughnut
        data={{
          labels: rows.map((r) => r.ticker),
          datasets: [{
            data: rows.map((r) => r.marketValue),
            backgroundColor: rows.map((_, i) => COLORS[i % COLORS.length] + 'cc'),
            borderColor: 'white',
            borderWidth: 2,
            hoverOffset: 8,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { boxWidth: 10, font: { family: 'Figtree', size: 11 }, color: '#4a5770' },
            },
            tooltip: {
              backgroundColor: 'white',
              borderColor: '#dde3f0',
              borderWidth: 1,
              bodyColor: '#0f172a',
              callbacks: {
                label: (c) => `${c.label}: $${(c.parsed as number).toFixed(0)}K`,
              },
            },
          },
        }}
      />
    </div>
  );
}

export function PnlBar({ rows, height = 200 }: { rows: PortfolioRow[]; height?: number }) {
  return (
    <div style={{ height, position: 'relative' }}>
      <Bar
        data={{
          labels: rows.map((r) => r.ticker),
          datasets: [{
            label: 'P&L ($K)',
            data: rows.map((r) => r.pnl),
            backgroundColor: rows.map((r, i) => COLORS[i % COLORS.length] + (r.pnl >= 0 ? '55' : '44')),
            borderColor: rows.map((_, i) => COLORS[i % COLORS.length]),
            borderWidth: 2,
            borderRadius: 6,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'white',
              borderColor: '#dde3f0',
              borderWidth: 1,
              bodyColor: '#0f172a',
              callbacks: {
                label: (c) => {
                  const y = c.parsed.y;
                  if (y == null) return '';
                  return `P&L: ${y >= 0 ? '+' : ''}$${y.toFixed(1)}K`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false }, border: { color: '#e2e6ef' } },
            y: { ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => v + 'K' }, grid: { color: 'rgba(0,0,0,.04)' }, border: { color: '#e2e6ef' } },
          },
        }}
      />
    </div>
  );
}

export function ForecastYoYBar({ rows, height = 160 }: { rows: PortfolioRow[]; height?: number }) {
  return (
    <div style={{ height, position: 'relative' }}>
      <Bar
        data={{
          labels: rows.map((r) => r.ticker),
          datasets: [{
            label: 'Next Q YoY %',
            data: rows.map((r) => r.forecastYoY),
            backgroundColor: rows.map((r, i) => COLORS[i % COLORS.length] + (r.forecastYoY >= 0 ? '55' : '44')),
            borderColor: rows.map((_, i) => COLORS[i % COLORS.length]),
            borderWidth: 2,
            borderRadius: 6,
          }],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'white',
              borderColor: '#dde3f0',
              borderWidth: 1,
              bodyColor: '#0f172a',
              callbacks: {
                label: (c) => {
                  const y = c.parsed.y;
                  if (y == null) return '';
                  return `Forecast YoY: ${y >= 0 ? '+' : ''}${y}%`;
                },
              },
            },
          },
          scales: {
            x: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false }, border: { color: '#e2e6ef' } },
            y: { ticks: { color: '#94a3b8', font: { size: 10 }, callback: (v) => v + '%' }, grid: { color: 'rgba(0,0,0,.04)' }, border: { color: '#e2e6ef' } },
          },
        }}
      />
    </div>
  );
}
