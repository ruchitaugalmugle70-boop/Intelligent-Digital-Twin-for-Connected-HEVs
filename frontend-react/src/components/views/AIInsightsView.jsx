import React from 'react';
import { Brain, Shield, TrendingDown, Cpu, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import AIInsights from '../dashboard/AIInsights';

export default function AIInsightsView({ telemetry }) {
  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">AI Predictive Analytics & Diagnostics Engine</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Machine learning algorithms forecasting component health, failure probabilities, and rider efficiency</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
          Model: XGBoost + LSTM v3.2
        </span>
      </div>

      {/* AI Metric Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { title: 'Overall Health Score', value: '92 / 100', status: 'Optimal Integrity', icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { title: 'Failure Risk Index', value: '3.8%', status: 'Very Low Probability', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Energy Efficiency', value: '87.4%', status: '+4.2% vs fleet average', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { title: 'Rider Behavior Score', value: '96 / 100', status: 'Smooth Acceleration & Braking', icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card-glass p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">{m.title}</span>
                <div className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
              </div>
              <div className="text-xl font-extrabold font-mono text-[var(--color-text-primary)]">{m.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{m.status}</div>
            </div>
          );
        })}
      </div>

      {/* AI Subsystem Health Breakdown Table */}
      <div className="grid grid-cols-[1.5fr_1fr] gap-5">
        <div className="card-glass p-5">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
            Subsystem Failure Risk & Anomaly Detection Matrix
          </h3>
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px]">
                <th className="pb-2">Subsystem</th>
                <th className="pb-2">Algorithm Model</th>
                <th className="pb-2">Anomaly Score</th>
                <th className="pb-2">Failure Prob. (30d)</th>
                <th className="pb-2">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              <tr>
                <td className="py-2.5 font-semibold text-slate-800">🔋 Li-Ion Battery</td>
                <td>Random Forest RUL</td>
                <td><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">0.04 (Low)</span></td>
                <td className="font-mono text-emerald-600 font-bold">1.2%</td>
                <td className="text-slate-500">Standard balancing cycle</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-slate-800">⚡ PMSM Hub Motor</td>
                <td>LSTM Vibration Net</td>
                <td><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">0.08 (Low)</span></td>
                <td className="font-mono text-emerald-600 font-bold">2.4%</td>
                <td className="text-slate-500">Normal thermal dissipation</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-slate-800">🔌 Motor Controller / ECU</td>
                <td>Thermal Cycling ODE</td>
                <td><span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold">0.02 (Optimal)</span></td>
                <td className="font-mono text-emerald-600 font-bold">0.8%</td>
                <td className="text-slate-500">Operating within safe envelope</td>
              </tr>
              <tr>
                <td className="py-2.5 font-semibold text-slate-800">🛑 Disc Brakes</td>
                <td>Friction Wear Estimator</td>
                <td><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-bold">0.36 (Notice)</span></td>
                <td className="font-mono text-amber-600 font-bold">8.5%</td>
                <td className="text-amber-700 font-semibold">Inspect pads in ~18 days</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AI Health Widget */}
        <AIInsights telemetry={telemetry} />
      </div>
    </div>
  );
}
