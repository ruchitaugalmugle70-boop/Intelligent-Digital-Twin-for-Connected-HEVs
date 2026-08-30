import React from 'react';
import { FileText, Download, TrendingUp, Zap, Leaf } from 'lucide-react';

export default function ReportsView() {
  const reports = [
    { title: 'Monthly Fleet Efficiency & Carbon Offset Report', date: 'August 2026', size: '2.4 MB', type: 'PDF' },
    { title: 'Battery State-of-Health (SOH) Degradation Log', date: 'August 2026', size: '1.1 MB', type: 'CSV' },
    { title: 'CAN Bus High-Frequency Raw Telemetry Dump', date: 'August 2026', size: '14.8 MB', type: 'JSON' },
    { title: 'Predictive Maintenance & Component Lifespan Audit', date: 'July 2026', size: '3.2 MB', type: 'PDF' },
  ];

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">Vehicle Performance Reports & Export Center</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Automated telemetry summary reports, energy efficiency, and audit exports</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-glass p-4">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
            <Leaf className="w-4 h-4" /> Carbon Offset Saved
          </div>
          <div className="text-2xl font-extrabold text-slate-800">142.6 kg CO₂</div>
          <div className="text-[10px] text-slate-500 mt-1">Equivalent to 6 mature trees planted</div>
        </div>

        <div className="card-glass p-4">
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
            <Zap className="w-4 h-4" /> Energy Consumption
          </div>
          <div className="text-2xl font-extrabold text-slate-800">28.4 Wh/km</div>
          <div className="text-[10px] text-slate-500 mt-1">Class-leading electric efficiency</div>
        </div>

        <div className="card-glass p-4">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
            <TrendingUp className="w-4 h-4" /> Regenerative Recovery
          </div>
          <div className="text-2xl font-extrabold text-slate-800">18.2%</div>
          <div className="text-[10px] text-slate-500 mt-1">Total kinetic energy returned to pack</div>
        </div>
      </div>

      {/* Available Reports Table */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Generated Audit & Telemetry Reports</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {reports.map((rep, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="font-bold text-xs text-slate-800">{rep.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{rep.date} • {rep.size} • Format: {rep.type}</div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer bg-white">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
