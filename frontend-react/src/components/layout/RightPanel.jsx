import { Info, ChevronDown } from 'lucide-react';

export default function RightPanel() {
  return (
    <aside className="w-[260px] bg-[var(--color-bg-sidebar)] border-l border-[var(--color-border)] flex flex-col py-5 px-4 gap-5 overflow-y-auto shrink-0">

      {/* What is this? */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-[var(--color-primary)]" />
          <h3 className="text-[11px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider">
            What is this?
          </h3>
        </div>
        <p className="text-[12px] text-[var(--color-text-secondary)] leading-relaxed">
          This is an <strong className="text-[var(--color-text-primary)]">Intelligent Digital Twin Dashboard</strong>.
          It shows the live virtual representation of the real vehicle.
          It receives data from the physical vehicle (through IoT sensors)
          and updates the virtual model, health, location, and predictions in real-time.
        </p>
      </div>

      {/* How It Works */}
      <div>
        <h3 className="text-[11px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider mb-3">
          How It Works
        </h3>
        <div className="flex flex-col gap-1.5">
          <div className="flow-step green">
            <span>🛵</span>
            <span className="text-[11px]">Physical Vehicle (ESP32 + Sensors + CAN)</span>
          </div>
          <div className="text-center text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4 mx-auto" />
          </div>
          <div className="flow-step blue">
            <span>📡</span>
            <span className="text-[11px]">IoT / Telemetry (Data Transmission)</span>
          </div>
          <div className="text-center text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4 mx-auto" />
          </div>
          <div className="flow-step yellow">
            <span>🗄️</span>
            <span className="text-[11px]">Backend Server (FastAPI + Database)</span>
          </div>
          <div className="text-center text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4 mx-auto" />
          </div>
          <div className="flow-step purple">
            <span>🧠</span>
            <span className="text-[11px]">AI Engine (Health, Prediction, Behavior)</span>
          </div>
          <div className="text-center text-[var(--color-text-muted)]">
            <ChevronDown className="w-4 h-4 mx-auto" />
          </div>
          <div className="flow-step red">
            <span>🖥️</span>
            <span className="text-[11px]">Digital Twin Dashboard (This Screen)</span>
          </div>
        </div>
      </div>

      {/* Data Flow Note */}
      <div className="bg-slate-50 border border-dashed border-[var(--color-border)] rounded-lg p-3">
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
          Data flows from vehicle → cloud → dashboard in real-time, keeping the virtual model always synchronized with the physical vehicle.
        </p>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="text-[11px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider mb-2">
          Technology Stack
        </h3>
        <div className="flex flex-col gap-1.5">
          {[
            ['Frontend', 'React + Three.js + R3F'],
            ['Backend', 'FastAPI (Python)'],
            ['Database', 'PostgreSQL / Timescale'],
            ['Real-time', 'WebSocket / MQTT'],
            ['AI / ML', 'Scikit-learn, PyTorch'],
            ['IoT', 'ESP32 + CAN-FD'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-[11px]">
              <span className="text-[var(--color-text-muted)]">{label}</span>
              <span className="text-[var(--color-text-primary)] font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
