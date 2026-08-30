import React, { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Cpu, Wifi } from 'lucide-react';

export default function DiagnosticsView() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1200);
  };

  const dtcCodes = [
    { code: 'P0A80', module: 'BMS', desc: 'Battery Pack State of Charge Balance - Nominal', status: 'PASS', type: 'pass' },
    { code: 'P0A1F', module: 'ECU', desc: 'Motor Control Module Processor Self-Test', status: 'PASS', type: 'pass' },
    { code: 'P0C73', module: 'MOTOR', desc: 'Motor Inverter Temperature Sensor Circuit Range', status: 'PASS', type: 'pass' },
    { code: 'U0100', module: 'CAN', desc: 'Lost Communication With ECM/PCM Control Module', status: 'PASS', type: 'pass' },
    { code: 'B1245', module: 'BRAKE', desc: 'Regenerative Brake Pad Wear Sensor Warning - Advisory', status: 'INFO', type: 'warn' },
  ];

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div>
          <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">OBD-II & CAN Bus Diagnostic Scanner</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Real-time Diagnostic Trouble Code (DTC) reader and self-test suite</p>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning DTCs...' : 'Run Full System Self-Test'}</span>
        </button>
      </div>

      {/* Self-Test Status Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-glass p-4 border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">MIL (Check Engine)</div>
          <div className="text-lg font-extrabold text-emerald-600 my-1">OFF (Normal)</div>
          <div className="text-[10px] text-slate-500">Zero active critical faults</div>
        </div>
        <div className="card-glass p-4 border-l-4 border-l-emerald-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CAN Network Status</div>
          <div className="text-lg font-extrabold text-emerald-600 my-1">100% Online</div>
          <div className="text-[10px] text-slate-500">6 of 6 ECUs responding</div>
        </div>
        <div className="card-glass p-4 border-l-4 border-l-amber-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Pending Advisory DTCs</div>
          <div className="text-lg font-extrabold text-amber-600 my-1">1 Notice</div>
          <div className="text-[10px] text-slate-500">Brake pad wear notice</div>
        </div>
        <div className="card-glass p-4 border-l-4 border-l-blue-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last Full Scan</div>
          <div className="text-lg font-extrabold text-slate-800 my-1 font-mono">Today, 22:15</div>
          <div className="text-[10px] text-slate-500">Triggered automatically</div>
        </div>
      </div>

      {/* DTC Code Table */}
      <div className="card-glass overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--color-border)] bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Diagnostic Trouble Code (DTC) Log</h3>
          <span className="text-[10px] text-slate-400">SAE J1979 / ISO 14229 Standard</span>
        </div>
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 text-[10px] bg-slate-50/50">
              <th className="p-3 font-bold">DTC Code</th>
              <th className="p-3 font-bold">ECU Module</th>
              <th className="p-3 font-bold">Description</th>
              <th className="p-3 font-bold">Self-Test Result</th>
              <th className="p-3 font-bold">Action Required</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px]">
            {dtcCodes.map((dtc, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50">
                <td className="p-3 font-mono font-bold text-indigo-600">{dtc.code}</td>
                <td className="p-3 font-bold">{dtc.module}</td>
                <td className="p-3 text-slate-700">{dtc.desc}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    dtc.type === 'pass' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {dtc.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500">
                  {dtc.type === 'pass' ? 'None (System Nominal)' : 'Inspect brake pads at next scheduled check'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
