import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const ALERTS = [
  {
    type: 'warn',
    icon: AlertTriangle,
    title: 'High Motor Temperature',
    subtitle: '63 °C (Normal < 80 °C)',
    time: '2 min ago',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
  },
  {
    type: 'ok',
    icon: CheckCircle,
    title: 'All Systems Normal',
    subtitle: 'No critical issues detected',
    time: '5 min ago',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-500',
  },
  {
    type: 'info',
    icon: Info,
    title: 'Next Service Due',
    subtitle: 'Scheduled in 15 days',
    time: '10 min ago',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
  },
];

export default function AlertsPanel() {
  return (
    <div className="card-glass overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">Alerts</h3>
      </div>
      <div className="p-3 flex flex-col gap-2">
        {ALERTS.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${alert.bg} ${alert.border} transition-all hover:shadow-sm`}
            >
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${alert.iconColor}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-[var(--color-text-primary)]">
                  {alert.title}
                </div>
                <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  {alert.subtitle}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  {alert.time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
