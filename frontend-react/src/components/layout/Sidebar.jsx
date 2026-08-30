import {
  LayoutDashboard, Activity, Car, Brain, Search,
  FlaskConical, Wrench, FileText, Bell, Settings, Zap
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard, Activity, Car, Brain, Search,
  FlaskConical, Wrench, FileText, Bell, Settings,
};

const NAV_ITEMS = [
  { key: 'overview',     label: 'Overview',          icon: 'LayoutDashboard' },
  { key: 'telemetry',    label: 'Live Telemetry',    icon: 'Activity' },
  { key: 'twin',         label: 'Vehicle Twin',      icon: 'Car' },
  { key: 'ai',           label: 'AI Insights',       icon: 'Brain' },
  { key: 'diagnostics',  label: 'Diagnostics',       icon: 'Search' },
  { key: 'simulation',   label: 'Simulation Studio', icon: 'FlaskConical', badge: 'PRO' },
  { key: 'maintenance',  label: 'Maintenance',       icon: 'Wrench' },
  { key: 'reports',      label: 'Reports',           icon: 'FileText' },
  { key: 'alerts',       label: 'Alerts',            icon: 'Bell' },
  { key: 'settings',     label: 'Settings',          icon: 'Settings' },
];

export default function Sidebar({ activeTab = 'overview', onSelectTab, onOpenSimulation }) {
  const handleClick = (key) => {
    if (key === 'simulation' && onOpenSimulation) {
      onOpenSimulation();
    } else if (onSelectTab) {
      onSelectTab(key);
    }
  };

  return (
    <aside className="w-[220px] bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)] flex flex-col py-5 px-3 gap-6 overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-extrabold tracking-wide text-emerald-600">ELESPA HEV</div>
          <div className="text-[10px] text-[var(--color-text-muted)] font-medium -mt-0.5">Digital Twin Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider px-3 mb-1">
          Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item.key)}
              className={`
                relative flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium
                transition-all duration-150 cursor-pointer border-none w-full text-left
                ${isActive
                  ? 'bg-[var(--color-primary)] text-white shadow-md shadow-indigo-200'
                  : 'text-[var(--color-text-secondary)] hover:bg-slate-100 hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              <div className="flex items-center gap-3">
                {isActive && <span className="nav-active-bar" />}
                {Icon && <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />}
                {item.label}
              </div>
              {item.badge && (
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Simulation Launcher Banner */}
      <div className="mt-auto px-3">
        <button
          onClick={onOpenSimulation}
          className="w-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl p-3 shadow-md shadow-indigo-200 text-left hover:brightness-105 transition-all cursor-pointer border-none"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wide">Launch Simulation</span>
            <FlaskConical className="w-4 h-4 text-indigo-200" />
          </div>
          <div className="text-[10px] text-indigo-100 leading-snug">
            Run physics drive cycles, battery aging, and predictive maintenance tests.
          </div>
        </button>
      </div>
    </aside>
  );
}
