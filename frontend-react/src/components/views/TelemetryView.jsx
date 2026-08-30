import React, { useState } from 'react';
import { Activity, Zap, Battery, Gauge, Thermometer, Waves, RefreshCw } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function TelemetryView({ telemetry, chartData }) {
  const [selectedSensor, setSelectedSensor] = useState('all');

  const detailedChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Battery Voltage (V)',
        data: chartData.voltage,
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.08)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Motor Current (A)',
        data: chartData.current,
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Vehicle Speed (km/h)',
        data: chartData.speed,
        borderColor: '#D97706',
        backgroundColor: 'rgba(217, 119, 6, 0.08)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
      },
      {
        label: 'Motor Temp (°C)',
        data: chartData.speed.map(s => Math.round(50 + s * 0.25)),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        borderWidth: 2,
        tension: 0.35,
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { font: { family: 'Inter', size: 11 }, color: '#475569', usePointStyle: true },
      },
    },
    scales: {
      x: { grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
      y: { min: 0, max: 120, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
    },
  };

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div>
          <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">Live CAN Bus & Sensor Telemetry</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">High-frequency synchronized physical-to-virtual telemetry streaming @ 20Hz</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-dot" /> CAN 2.0B Active
          </span>
        </div>
      </div>

      {/* Expanded Multi-Channel Telemetry Chart */}
      <div className="card-glass p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Multi-Channel Sensor Signal Graph</h3>
          <span className="text-[11px] text-[var(--color-text-muted)]">Sampling Window: 10 Data Points</span>
        </div>
        <div style={{ height: 280 }}>
          <Line data={detailedChartData} options={chartOptions} />
        </div>
      </div>

      {/* Telemetry Sensor Matrix */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Battery Voltage', value: `${telemetry.battery_voltage?.toFixed(1)} V`, sub: 'Nominal 72V pack', icon: Battery, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Motor Current', value: `${telemetry.battery_current?.toFixed(1)} A`, sub: 'Peak draw 45A', icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Motor RPM', value: `${telemetry.motor_rpm?.toFixed(0)} RPM`, sub: 'Direct hub drive', icon: Gauge, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Controller Temp', value: `${telemetry.controller_temperature?.toFixed(1)} °C`, sub: 'Safe limit < 85°C', icon: Thermometer, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Motor Torque', value: `${telemetry.motor_torque?.toFixed(1)} Nm`, sub: 'Instant PMSM torque', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Brake Pressure', value: `${telemetry.brake_pressure?.toFixed(1)} Bar`, sub: 'Hydraulic disc caliper', icon: Waves, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Battery Pack Temp', value: `${telemetry.battery_temperature?.toFixed(0)} °C`, sub: 'Active liquid cooling', icon: Thermometer, color: 'text-teal-600', bg: 'bg-teal-50' },
          { label: 'Odometer Reading', value: `${telemetry.odometer || 1250} km`, sub: 'Total distance run', icon: RefreshCw, color: 'text-slate-600', bg: 'bg-slate-50' },
        ].map((sensor, i) => {
          const Icon = sensor.icon;
          return (
            <div key={i} className="card-glass p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${sensor.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${sensor.color}`} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">{sensor.label}</div>
                <div className="text-base font-extrabold font-mono text-[var(--color-text-primary)] my-0.5">{sensor.value}</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">{sensor.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw CAN Bus Live Packet Stream */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border)] bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Live CAN Bus Frame Stream</h3>
          <span className="text-[10px] font-mono text-slate-400">Baud Rate: 500 kbps • Protocol: CAN-FD</span>
        </div>
        <div className="p-4 font-mono text-xs overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-slate-400 border-b border-slate-100">
                <th className="pb-2">CAN ID</th>
                <th className="pb-2">Message Description</th>
                <th className="pb-2">DLC</th>
                <th className="pb-2">Data Payload (HEX)</th>
                <th className="pb-2">Decoded Physical Value</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2 text-indigo-600 font-bold">0x180</td>
                <td>BMS_Cell_Voltage</td>
                <td>8</td>
                <td>48 02 D4 02 12 03 A0 01</td>
                <td className="font-bold text-emerald-600">{telemetry.battery_voltage?.toFixed(2)} V</td>
                <td><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">ACK</span></td>
              </tr>
              <tr>
                <td className="py-2 text-indigo-600 font-bold">0x280</td>
                <td>MCU_Speed_Torque</td>
                <td>8</td>
                <td>{(Math.round(telemetry.speed || 48)).toString(16).toUpperCase()} 00 5C 01 00 00 00 00</td>
                <td className="font-bold text-blue-600">{telemetry.speed?.toFixed(1)} km/h • {telemetry.motor_rpm?.toFixed(0)} RPM</td>
                <td><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">ACK</span></td>
              </tr>
              <tr>
                <td className="py-2 text-indigo-600 font-bold">0x380</td>
                <td>MCU_Thermal_State</td>
                <td>6</td>
                <td>{(Math.round(telemetry.motor_temperature || 63)).toString(16).toUpperCase()} 2C 00 00 00 00</td>
                <td className="font-bold text-amber-600">{telemetry.motor_temperature?.toFixed(1)} °C</td>
                <td><span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">ACK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
