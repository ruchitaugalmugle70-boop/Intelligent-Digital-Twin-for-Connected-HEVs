import { Battery, Gauge, Thermometer, Heart, MapPin, Leaf } from 'lucide-react';

const METRICS = [
  {
    key: 'soc',
    label: 'Battery SOC',
    icon: Battery,
    color: '#059669',
    bgColor: '#ECFDF5',
    getValue: (t) => `${t.battery_soc?.toFixed(0)}%`,
    getBar: (t) => t.battery_soc,
  },
  {
    key: 'speed',
    label: 'Vehicle Speed',
    icon: Gauge,
    color: '#0284C7',
    bgColor: '#F0F9FF',
    getValue: (t) => `${t.speed?.toFixed(0)}`,
    unit: 'km/h',
    getBar: (t) => t.speed,
  },
  {
    key: 'temp',
    label: 'Motor Temp.',
    icon: Thermometer,
    color: '#DC2626',
    bgColor: '#FEF2F2',
    getValue: (t) => `${t.motor_temperature?.toFixed(0)}`,
    unit: '°C',
    getBar: (t) => (t.motor_temperature / 120) * 100,
  },
  {
    key: 'health',
    label: 'Health Score',
    icon: Heart,
    color: '#059669',
    bgColor: '#ECFDF5',
    getValue: (t) => `${t.health_score?.toFixed(0)}`,
    unit: '/100',
    getBar: (t) => t.health_score,
  },
  {
    key: 'range',
    label: 'Range',
    icon: MapPin,
    color: '#0284C7',
    bgColor: '#F0F9FF',
    getValue: (t) => `${Math.round(t.battery_soc * 1.56)}`,
    unit: 'km',
    getBar: (t) => (t.battery_soc * 1.56) / 200 * 100,
  },
  {
    key: 'mode',
    label: 'Drive Mode',
    icon: Leaf,
    color: '#059669',
    bgColor: '#ECFDF5',
    getValue: () => 'Hybrid',
    isText: true,
  },
];

export default function MetricStrip({ telemetry }) {
  return (
    <div className="grid grid-cols-6 gap-3">
      {METRICS.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.key} className="card-glass flex items-center gap-3 p-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: m.bgColor }}
            >
              <Icon className="w-5 h-5" style={{ color: m.color }} strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">
                {m.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="metric-value text-lg leading-tight"
                  style={m.isText ? { color: m.color, fontSize: '14px' } : {}}
                >
                  {m.getValue(telemetry)}
                </span>
                {m.unit && (
                  <span className="text-[11px] text-[var(--color-text-muted)] font-medium">
                    {m.unit}
                  </span>
                )}
              </div>
              {m.getBar && (
                <div className="w-full h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, m.getBar(telemetry))}%`,
                      backgroundColor: m.color,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
