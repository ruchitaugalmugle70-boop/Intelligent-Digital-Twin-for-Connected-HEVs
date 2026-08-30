import { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TelemetryChart({ chartData }) {
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Battery Voltage (V)',
        data: chartData.voltage,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.06)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Motor Current (A)',
        data: chartData.current,
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.06)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Vehicle Speed (km/h)',
        data: chartData.speed,
        borderColor: '#D97706',
        backgroundColor: 'rgba(217, 119, 6, 0.06)',
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#475569',
          font: { size: 10, family: 'Inter' },
          boxWidth: 10,
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#0F172A',
        bodyColor: '#475569',
        borderColor: '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 11, weight: '600' },
        bodyFont: { size: 10 },
      },
    },
    scales: {
      x: {
        grid: { color: '#F1F5F9', drawBorder: false },
        ticks: { color: '#94A3B8', font: { size: 9, family: 'Inter' } },
        border: { display: false },
      },
      y: {
        grid: { color: '#F1F5F9', drawBorder: false },
        ticks: { color: '#94A3B8', font: { size: 9, family: 'Inter' } },
        border: { display: false },
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <div className="card-glass overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">
          Live Telemetry (Real-time)
        </h3>
      </div>
      <div className="p-4">
        <div className="chart-container">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
