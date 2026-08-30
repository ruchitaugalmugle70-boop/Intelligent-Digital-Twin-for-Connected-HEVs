import { Bell, Search, FlaskConical, Sparkles } from 'lucide-react';

export default function Header({ isConnected, onOpenSimulation }) {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      {/* Left: Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--color-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search telemetry, diagnostics..."
            className="pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] w-64 transition-all"
          />
        </div>
      </div>

      {/* Center: Title */}
      <div className="text-center flex-1">
        <h1 className="text-base font-extrabold text-[var(--color-text-primary)] tracking-tight">
          Intelligent Digital Twin Dashboard
        </h1>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
          Real-time Virtual Representation & Physics Twin of Connected Hybrid Electric Vehicle
        </p>
      </div>

      {/* Right: Status + Actions */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        {/* Simulation Launcher Button */}
        <button
          onClick={onOpenSimulation}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all cursor-pointer shadow-sm"
        >
          <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
          <span>Simulation Studio</span>
        </button>

        {/* Vehicle ID */}
        <span className="text-[11px] font-mono font-semibold text-[var(--color-text-muted)] bg-slate-50 px-3 py-1.5 rounded-md border border-[var(--color-border)]">
          VIN: HEV_2025_001
        </span>

        {/* Live Badge */}
        <div className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold border
          ${isConnected
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
          }
        `}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 live-dot' : 'bg-red-500'}`} />
          {isConnected ? 'LIVE' : 'SIMULATED'}
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent">
          <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
