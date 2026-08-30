import { Battery, Zap, Cpu, CircuitBoard, Disc, Wifi } from 'lucide-react';

const ICON_MAP = { Battery, Zap, Cpu, CircuitBoard, Disc, Wifi };

const SUBSYSTEMS = [
  { key: 'battery',       label: 'Battery Pack',     icon: 'Battery',      status: 'Healthy',   state: 'healthy' },
  { key: 'motor',         label: 'Hub Motor (PMSM)', icon: 'Zap',          status: 'Healthy',   state: 'healthy' },
  { key: 'controller',    label: 'Controller / ECU', icon: 'Cpu',          status: 'Healthy',   state: 'healthy' },
  { key: 'bms',           label: 'BMS Module',       icon: 'CircuitBoard', status: 'Healthy',   state: 'healthy' },
  { key: 'braking',       label: 'Braking System',   icon: 'Disc',         status: 'OK',        state: 'warning' },
  { key: 'communication', label: 'Communication',    icon: 'Wifi',         status: 'Connected', state: 'healthy' },
];

export default function SubsystemStatus() {
  return (
    <div className="card-glass overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">Subsystem Status</h3>
      </div>
      <div className="p-3 flex flex-col gap-1">
        {SUBSYSTEMS.map((sub) => {
          const Icon = ICON_MAP[sub.icon];
          return (
            <div
              key={sub.key}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-[var(--color-text-muted)]" />
                <span className="text-[12px] font-medium text-[var(--color-text-primary)]">
                  {sub.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold ${
                  sub.state === 'healthy' ? 'text-emerald-600' :
                  sub.state === 'warning' ? 'text-amber-600' : 'text-red-600'
                }`}>
                  {sub.status}
                </span>
                <span className={`status-dot ${sub.state}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
