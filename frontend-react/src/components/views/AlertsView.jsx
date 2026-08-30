import React from 'react';
import { Bell, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import AlertsPanel from '../dashboard/AlertsPanel';

export default function AlertsView() {
  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">System Alerts & Fault Notification Center</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Real-time safety monitors, sensor threshold warnings, and critical alarms</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
          All Safety Systems Normal
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <AlertsPanel />

        {/* Alert Threshold Configurations */}
        <div className="card-glass p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
              Automated Safety Threshold Triggers
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              {[
                { name: 'Motor Temperature Critical', threshold: '> 85 °C', action: 'Derate motor power by 50%' },
                { name: 'Battery Cell Under-Voltage', threshold: '< 2.8 V / cell', action: 'Trigger limp-home mode' },
                { name: 'Inverter Over-Current', threshold: '> 65 A', action: 'Open main contactor' },
                { name: 'Regen Brake Wear Warning', threshold: '< 3.0 mm', action: 'Notify service dashboard' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[10px] text-slate-500">Action: {item.action}</div>
                  </div>
                  <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px]">
                    {item.threshold}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
