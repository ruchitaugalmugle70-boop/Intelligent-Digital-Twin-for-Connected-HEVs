import React, { useState, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { RotateCcw, Pause, Play, Camera, Palette, FlaskConical } from 'lucide-react';
import ViewManager from './ViewManager';
import { PAINT_COLORS } from '../../utils/constants';

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('[3D Canvas Error]', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-600 p-6 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-bold text-sm mb-1">3D Canvas Initializing</div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer border-none"
          >
            Reset 3D Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const VIEW_MODES = [
  { key: '3d', label: '3D View' },
  { key: 'system', label: 'System View' },
  { key: 'blueprint', label: 'Blueprint CAD' },
];

const CAMERA_MODES = [
  { key: 'chase', label: 'Chase' },
  { key: 'side', label: 'Side' },
  { key: 'top', label: 'Top' },
  { key: 'front', label: 'Front' },
];

export default function ScooterScene({
  telemetry = {},
  onOpenCadModal,
  onOpenSimulation,
}) {
  const [viewMode, setViewMode] = useState('3d');
  const [cameraMode, setCameraMode] = useState('chase');
  const [paintColor, setPaintColor] = useState('white');
  const [paused, setPaused] = useState(false);

  const speed = paused ? 0 : (telemetry.speed || 0);
  const currentPaintHex = PAINT_COLORS[paintColor]?.hex || '#EDE9E1';

  return (
    <div className="card-glass overflow-hidden flex flex-col">
      {/* Card Header */}
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">3D Vehicle Digital Twin</h3>
          <p className="text-[10px] text-[var(--color-text-muted)]">E-TWIN Connected Electric Vehicle Model</p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {VIEW_MODES.map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer border-none
                ${viewMode === v.key
                  ? 'bg-[var(--color-primary)] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Viewport Area */}
      <div className="three-viewport relative" style={{ height: 380, minHeight: 380 }}>
        {viewMode === 'blueprint' ? (
          <ViewManager
            viewMode="blueprint"
            onOpenCadModal={onOpenCadModal}
          />
        ) : (
          <CanvasErrorBoundary>
            <Canvas
              shadows
              camera={{ position: [-3.2, 1.8, 4.2], fov: 45 }}
              gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
              }}
              onCreated={({ gl }) => {
                gl.toneMapping = 1; // ACESFilmicToneMapping
                gl.toneMappingExposure = 1.1;
              }}
            >
              <ViewManager
                viewMode={viewMode}
                cameraMode={cameraMode}
                paintColor={currentPaintHex}
                telemetry={{ ...telemetry, speed }}
                onOpenCadModal={onOpenCadModal}
              />
            </Canvas>
          </CanvasErrorBoundary>
        )}

        {/* HUD Controls — Bottom Left */}
        {viewMode !== 'blueprint' && (
          <div className="hud-overlay bottom-14 left-3 flex items-center gap-1.5 z-10">
            <button
              onClick={() => setCameraMode('chase')}
              className="bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm"
              title="Reset Camera"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPaused(!paused)}
              className="bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm"
              title={paused ? 'Resume' : 'Pause'}
            >
              {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            {CAMERA_MODES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCameraMode(c.key)}
                className={`bg-white/90 backdrop-blur-md border rounded-lg px-2.5 py-1.5 text-[10px] font-semibold transition-all cursor-pointer shadow-sm
                  ${cameraMode === c.key
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-indigo-50/90 font-bold'
                    : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                  }
                `}
              >
                {c.label}
              </button>
            ))}
            <button
              onClick={onOpenSimulation}
              className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-2.5 py-1.5 text-[10px] font-bold hover:bg-indigo-100 transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
              Drive Sim
            </button>
            <button
              onClick={onOpenCadModal}
              className="bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all cursor-pointer shadow-sm flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" /> CAD
            </button>
          </div>
        )}

        {/* Paint Color Customizer — Bottom Right */}
        {viewMode === '3d' && (
          <div className="hud-overlay bottom-14 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[var(--color-border)] rounded-full px-3 py-1.5 shadow-sm z-10">
            <Palette className="w-3.5 h-3.5 text-[var(--color-text-muted)] mr-1" />
            {Object.entries(PAINT_COLORS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setPaintColor(key)}
                className={`w-5 h-5 rounded-full border-2 transition-all cursor-pointer
                  ${paintColor === key
                    ? 'border-[var(--color-primary)] scale-125 shadow-md'
                    : 'border-slate-200 hover:scale-110'
                  }
                `}
                style={{ backgroundColor: val.hex }}
                title={val.label}
              />
            ))}
          </div>
        )}

        {/* System View Component Legend */}
        {viewMode === 'system' && (
          <div className="hud-overlay top-3 right-3 bg-white/95 backdrop-blur-md border border-[var(--color-border)] rounded-lg p-3 shadow-sm z-10">
            <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
              Engineering CAD Subsystems
            </div>
            {[
              { color: '#10B981', label: '72V Li-Ion Battery Pack' },
              { color: '#F59E0B', label: 'BMS Monitoring Module' },
              { color: '#0284C7', label: 'ECU / Power Inverter' },
              { color: '#EF4444', label: '3.0 kW PMSM Hub Motor' },
              { color: '#A855F7', label: 'Suspension Dampers' },
              { color: '#F97316', label: 'HV Wiring Harness' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] text-[var(--color-text-primary)]">{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Telemetry Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--color-border)] grid grid-cols-6 z-10">
          {[
            { icon: '🏎️', label: 'Speed', value: `${speed.toFixed(0)} km/h` },
            { icon: '📍', label: 'Range', value: `${Math.round((telemetry.battery_soc || 80) * 1.56)} km` },
            { icon: '🔋', label: 'Battery', value: `${(telemetry.battery_soc || 80).toFixed(0)}%` },
            { icon: '🌡️', label: 'Motor Temp', value: `${(telemetry.motor_temperature || 63).toFixed(0)} °C` },
            { icon: '📏', label: 'Odometer', value: `${telemetry.odometer || 1250} km` },
            { icon: '🕐', label: 'Status', value: 'Nominal' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-3 py-2 border-r border-[var(--color-border)] last:border-r-0">
              <span className="text-xs">{stat.icon}</span>
              <div>
                <div className="text-[8px] text-[var(--color-text-muted)] uppercase tracking-wide">{stat.label}</div>
                <div className="text-[11px] font-bold font-mono text-[var(--color-text-primary)]">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
