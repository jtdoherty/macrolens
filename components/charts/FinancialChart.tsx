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
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

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

export type FinancialDataset = {
  label: string;
  data: (number | null)[];
  color: string;
  type?: 'bar' | 'line';
  // For bars: color positive green and negative red. Overrides `color`.
  diverging?: boolean;
  borderDash?: number[];
  invert?: boolean;          // negate the data (used for CapEx-as-outflow)
  yAxisID?: string;
};

export type FinancialChartProps = {
  labels: string[];
  datasets: FinancialDataset[];
  format?: 'dollars' | 'percent' | 'ratio';
  // Display unit for y-axis labels and tooltips. 'B' for billions, '' for raw.
  unit?: 'B' | 'M' | '%' | 'x' | '';
  // If true, data is already scaled to the unit (e.g. pre-divided by 1e9 for 'B').
  preScaled?: boolean;
  height?: number;
  showLegend?: boolean;
};

const POS_BG = 'rgba(5,150,105,.25)';
const NEG_BG = 'rgba(220,38,38,.25)';
const POS_BORDER = '#059669';
const NEG_BORDER = '#dc2626';

export function FinancialChart({
  labels,
  datasets,
  format = 'dollars',
  unit = 'B',
  preScaled = false,
  height = 200,
  showLegend,
}: FinancialChartProps) {
  // Chart.js mixed charts use type='bar' at the top with per-dataset overrides.
  const data: ChartData = {
    labels,
    datasets: datasets.map((ds) => {
      const data = ds.invert ? ds.data.map((v) => (v == null ? null : -v)) : ds.data;
      const scaled = preScaled || format === 'percent' || format === 'ratio'
        ? data
        : data.map((v) => (v == null ? null : v / (unit === 'B' ? 1e9 : unit === 'M' ? 1e6 : 1)));

      const isLine = ds.type === 'line';

      if (isLine) {
        return {
          type: 'line' as const,
          label: ds.label,
          data: scaled,
          borderColor: ds.color,
          backgroundColor: ds.color + '0d',
          borderWidth: 2.5,
          borderDash: ds.borderDash,
          pointRadius: 3,
          pointBackgroundColor: ds.color,
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          fill: false,
          tension: 0.3,
          yAxisID: ds.yAxisID ?? 'y',
        };
      }

      const bg = ds.diverging
        ? scaled.map((v) => (v == null ? 'transparent' : v >= 0 ? POS_BG : NEG_BG))
        : ds.color + '38';
      const border = ds.diverging
        ? scaled.map((v) => (v == null ? 'transparent' : v >= 0 ? POS_BORDER : NEG_BORDER))
        : ds.color;

      return {
        type: 'bar' as const,
        label: ds.label,
        data: scaled,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1.5,
        borderRadius: 3,
        yAxisID: ds.yAxisID ?? 'y',
      };
    }),
  };

  const fmtTooltip = (v: number) => {
    if (format === 'percent') return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
    if (format === 'ratio') return `${v.toFixed(2)}x`;
    if (unit === '') return `$${v.toFixed(2)}`;
    return `$${v.toFixed(1)}${unit}`;
  };

  const fmtAxis = (v: number) => {
    if (format === 'percent') return v + '%';
    if (format === 'ratio') return v + 'x';
    if (unit === '') return '$' + v;
    return '$' + v + unit;
  };

  const options: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 380, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        display: showLegend ?? datasets.length > 1,
        position: 'top',
        labels: { boxWidth: 10, font: { family: 'Figtree', size: 11 }, color: '#64748b' },
      },
      tooltip: {
        backgroundColor: 'white',
        borderColor: '#e4e7ec',
        borderWidth: 1,
        titleColor: '#64748b',
        bodyColor: '#0f172a',
        padding: 10,
        callbacks: {
          label: (c) => {
            const y = c.parsed.y;
            if (y == null) return '';
            return ` ${c.dataset.label}: ${fmtTooltip(y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'Figtree', size: 10 }, maxRotation: 45 },
        grid: { color: 'rgba(0,0,0,.04)' },
        border: { color: '#e4e7ec' },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { family: 'Figtree', size: 10 },
          callback: (v) => fmtAxis(typeof v === 'number' ? v : 0),
        },
        grid: { color: 'rgba(0,0,0,.04)' },
        border: { color: '#e4e7ec' },
      },
    },
  };

  return (
    <div style={{ height, position: 'relative' }}>
      <Chart type="bar" data={data} options={options} />
    </div>
  );
}
