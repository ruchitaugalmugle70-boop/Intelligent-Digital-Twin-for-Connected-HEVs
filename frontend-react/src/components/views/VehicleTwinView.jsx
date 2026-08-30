import React, { useState } from 'react';
import ScooterScene from '../three/ScooterScene';
import { Box, Layers, Eye, Cpu, Battery, Disc, Zap } from 'lucide-react';

export default function VehicleTwinView({ telemetry, onOpenCadModal, onOpenSimulation }) {
  const [selectedComponent, setSelectedComponent] = useState('scooter');

  const components = [
    { id: 'scooter', name: 'Whole Vehicle Assembly', status: 'Optimal', temp: '42 °C', health: '92%', icon: Box, desc: 'Connected E-TWIN Hybrid Electric Scooter chassis and powertrain.' },
    { id: 'battery', name: '72V 40Ah Li-Ion Battery Pack', status: 'Healthy', temp: '32 °C', health: '94%', icon: Battery, desc: 'LFP chemistry battery pack with integrated intelligent BMS module.' },
    { id: 'motor', name: '3.0 kW PMSM Hub Motor', status: 'Healthy', temp: '63 °C', health: '88%', icon: Zap, desc: 'High-torque permanent magnet synchronous rear wheel hub motor.' },
    { id: 'controller', name: 'Field Oriented Controller (FOC)', status: 'Optimal', temp: '45 °C', health: '95%', icon: Cpu, desc: 'Sine-wave 3-phase inverter controller with CAN-FD telemetry node.' },
    { id: 'brakes', name: 'Regenerative Hydraulic Braking', status: 'Good', temp: '28 °C', health: '64%', icon: Disc, desc: 'Dual-circuit hydraulic disc brakes with variable regen energy capture.' },
  ];

  return (
    <div className="flex flex-col gap-5 fade-in">
      {/* Top Banner */}
      <div className="card-glass p-5 flex justify-between items-center bg-gradient-to-r from-white via-indigo-50/30 to-white">
        <div>
          <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">3D Vehicle Twin & CAD Engineering Model</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">High-fidelity WebGL 3D virtual twin with interactive sub-assembly inspection</p>
        </div>
        <button
          onClick={onOpenCadModal}
          className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200"
        >
          Open CAD Specification Sheet
        </button>
      </div>

      {/* Main 3D Viewport & Part Inspector */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-5">
        <div>
          <ScooterScene
            telemetry={telemetry}
            onOpenCadModal={onOpenCadModal}
            onOpenSimulation={onOpenSimulation}
          />
        </div>

        {/* Sub-Assembly Inspector Card */}
        <div className="card-glass flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)] bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-xs font-bold text-[var(--color-text-primary)]">Subsystem Component Inspector</h3>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">5 Subsystems Live</span>
          </div>

          <div className="p-4 flex flex-col gap-2.5 flex-1 overflow-y-auto">
            {components.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedComponent === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedComponent(c.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-indigo-50/50 shadow-sm'
                      : 'border-[var(--color-border)] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5 font-bold text-xs text-[var(--color-text-primary)]">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--color-primary)]' : 'text-slate-400'}`} />
                      {c.name}
                    </div>
                    <span className="text-[10px] font-bold font-mono text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
                      {c.health}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mb-2">{c.desc}</p>
                  <div className="flex gap-4 text-[10px] text-[var(--color-text-muted)] font-mono">
                    <span>Status: <strong className="text-emerald-700">{c.status}</strong></span>
                    <span>Core Temp: <strong className="text-slate-700">{c.temp}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
