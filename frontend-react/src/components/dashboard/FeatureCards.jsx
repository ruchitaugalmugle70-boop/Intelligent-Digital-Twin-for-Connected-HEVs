import { Box, MapPin, Activity, Cog, Lightbulb } from 'lucide-react';

const FEATURES = [
  {
    title: '3D Vehicle Twin',
    desc: 'Interactive 3D model of the E-TWIN scooter. Parts change color and status based on real-time telemetry data.',
    icon: Box,
  },
  {
    title: 'Live Location',
    desc: 'Real-time GPS tracking showing exact vehicle position, heading, and route history on the map.',
    icon: MapPin,
  },
  {
    title: 'Telemetry & AI',
    desc: 'Live CAN bus charts with AI-powered health scoring, failure prediction, and maintenance scheduling.',
    icon: Activity,
  },
  {
    title: 'Decision Support',
    desc: 'Intelligent alerts and actionable recommendations for operators and service engineers.',
    icon: Lightbulb,
  },
];

const TECH_STACK = [
  ['Frontend', 'React + Three.js + R3F'],
  ['Backend', 'FastAPI (Python)'],
  ['Database', 'PostgreSQL / Timescale'],
  ['Real-time', 'WebSocket / MQTT'],
  ['AI / ML', 'Scikit-learn, PyTorch'],
  ['IoT Device', 'ESP32 + Sensors + CAN-FD'],
];

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <div
            key={i}
            className="card-glass p-4 flex flex-col gap-2 cursor-pointer hover:-translate-y-0.5 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] font-extrabold text-[var(--color-text-primary)] uppercase tracking-wide">
                {i + 1}. {f.title}
              </h3>
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed">
              {f.desc}
            </p>
          </div>
        );
      })}

      {/* Tech card */}
      <div className="card-glass p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Cog className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-[10px] font-extrabold text-[var(--color-text-primary)] uppercase tracking-wide">
            Technologies
          </h3>
        </div>
        <div className="flex flex-col gap-1">
          {TECH_STACK.map(([k, v]) => (
            <div key={k} className="flex justify-between text-[10px]">
              <span className="text-[var(--color-text-muted)]">{k}</span>
              <span className="text-[var(--color-text-primary)] font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
