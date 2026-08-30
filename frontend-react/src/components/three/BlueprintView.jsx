import React, { useState } from 'react';
import { Camera, Maximize2, Compass, Layers } from 'lucide-react';

/**
 * BlueprintView — Technical engineering CAD blueprint mode with
 * orthographic projections (Side, Front, Top) and dimension callouts.
 */
export default function BlueprintView({ onOpenCadModal }) {
  const [projection, setProjection] = useState('side'); // 'side', 'front', 'top', 'full'

  return (
    <div className="absolute inset-0 bg-[#0F172A] flex flex-col overflow-hidden text-white font-mono z-20">
      {/* Blueprint Top Header Bar */}
      <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider text-cyan-300">CAD BLUEPRINT ORTHOGRAPHIC VIEWER</span>
          <span className="text-[10px] text-slate-500">• ISO 128 TECHNICAL SPEC</span>
        </div>

        {/* Projection Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-[10px]">
          {[
            { id: 'side', label: 'Side Elevation' },
            { id: 'front', label: 'Front Elevation' },
            { id: 'top', label: 'Plan (Top)' },
            { id: 'full', label: 'Full Spec Sheet' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setProjection(p.id)}
              className={`px-2.5 py-1 rounded transition-all cursor-pointer border-none ${
                projection === p.id
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-transparent'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenCadModal}
          className="flex items-center gap-1 px-3 py-1 bg-cyan-900/40 border border-cyan-700/50 text-cyan-300 rounded text-[10px] hover:bg-cyan-800/40 transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" /> Fullscreen
        </button>
      </div>

      {/* Blueprint Canvas / Technical Grid Image Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Technical Grid Overlay Lines */}
        <div className="absolute inset-0 border-2 border-cyan-900/40 pointer-events-none" />

        {/* Technical Image Display */}
        <img
          src="/assets/e_twin_full_cad.jpg"
          alt="E-TWIN CAD Engineering Drawing"
          className="max-w-[95%] max-h-[90%] object-contain rounded border border-cyan-800/60 shadow-2xl bg-white/5"
        />

        {/* Engineering Dimensions Callout Overlay */}
        <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-cyan-800/60 p-3 rounded text-[10px] leading-relaxed">
          <div className="text-cyan-400 font-bold mb-1 uppercase tracking-wide">E-TWIN Spec Dimensions</div>
          <div>• Overall Length: <span className="text-white font-bold">1,810 mm</span></div>
          <div>• Overall Height: <span className="text-white font-bold">1,120 mm</span></div>
          <div>• Width (Handlebars): <span className="text-white font-bold">700 mm</span></div>
          <div>• Wheelbase: <span className="text-white font-bold">1,300 mm</span></div>
          <div>• Ground Clearance: <span className="text-white font-bold">165 mm</span></div>
        </div>

        <div className="absolute top-4 right-4 bg-slate-900/90 border border-cyan-800/60 p-2.5 rounded text-[10px] text-right">
          <div className="text-cyan-400 font-bold uppercase">Scale: 1:10 (CAD Metric)</div>
          <div className="text-slate-400">Projection: 3rd Angle Orthographic</div>
        </div>
      </div>
    </div>
  );
}
