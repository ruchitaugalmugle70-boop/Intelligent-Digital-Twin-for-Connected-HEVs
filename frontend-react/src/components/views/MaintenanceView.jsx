import React from 'react';
import { Wrench, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function MaintenanceView() {
  const schedule = [
    { title: 'Disc Brake Inspection & Pad Replacement', due: 'in 18 days (1,500 km)', date: '2026-09-17', status: 'Upcoming', urgency: 'Moderate', color: 'bg-amber-50 text-amber-700' },
    { title: 'PMSM Motor Bearing Lubrication', due: 'in 92 days (4,000 km)', date: '2026-11-30', status: 'Scheduled', urgency: 'Normal', color: 'bg-emerald-50 text-emerald-700' },
    { title: 'Battery Pack Balancing & Impedance Check', due: 'in 145 days (6,500 km)', date: '2027-01-22', status: 'Scheduled', urgency: 'Normal', color: 'bg-emerald-50 text-emerald-700' },
    { title: 'Tire Tread Depth & Suspension Alignment', due: 'in 180 days (8,000 km)', date: '2027-02-28', status: 'Scheduled', urgency: 'Normal', color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">Maintenance Schedule & Service Lifecycle</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Automated telemetry-driven predictive service intervals and service logs</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-all cursor-pointer shadow-sm">
          Book Authorized Service
        </button>
      </div>

      {/* Maintenance Timeline Cards */}
      <div className="grid grid-cols-2 gap-4">
        {schedule.map((item, idx) => (
          <div key={idx} className="card-glass p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-xs text-slate-800">{item.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.color}`}>
                  {item.urgency}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Due: <strong className="text-slate-700">{item.due}</strong></span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">Target Date: {item.date}</span>
              <button className="text-indigo-600 font-semibold hover:underline cursor-pointer border-none bg-transparent">
                View Checklist →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
