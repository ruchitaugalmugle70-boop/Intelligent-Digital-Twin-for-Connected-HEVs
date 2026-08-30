import React from 'react';
import { Settings, Wifi, Database, Cpu, Shield, Save } from 'lucide-react';
import { API_BASE, WS_BASE, VEHICLE_ID } from '../../utils/constants';

export default function SettingsView() {
  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">Platform Settings & IoT Configuration</h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Manage WebSocket endpoints, CAN network settings, and vehicle profile</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Connection Settings */}
        <div className="card-glass p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            Network & Telemetry Gateway
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Backend API URL</label>
            <input
              type="text"
              defaultValue={API_BASE}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">WebSocket Live Stream Endpoint</label>
            <input
              type="text"
              defaultValue={`${WS_BASE}/ws/vehicle/${VEHICLE_ID}`}
              className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Telemetry Broadcast Rate</label>
            <select className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
              <option>10 Hz (Real-time)</option>
              <option>20 Hz (High Fidelity)</option>
              <option>5 Hz (Power Save)</option>
            </select>
          </div>
        </div>

        {/* Vehicle Registration Settings */}
        <div className="card-glass p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
            Digital Twin Identity
          </h3>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vehicle VIN</label>
            <input
              type="text"
              defaultValue="HEV_2025_001"
              disabled
              className="w-full text-xs font-mono p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Vehicle Model & Trim</label>
            <input
              type="text"
              defaultValue="ELESPA E-TWIN Connected Hybrid Electric Scooter"
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="mt-auto pt-4 flex justify-end">
            <button className="flex items-center gap-2 px-5 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200">
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
