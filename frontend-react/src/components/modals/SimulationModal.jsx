import { useState } from 'react';
import { X, Play, RotateCcw, TrendingUp, Wrench, Activity, Sparkles, Gauge, Battery, Thermometer } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export default function SimulationModal({ isOpen, onClose, telemetry, onApplySimulation }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('drive'); // 'drive', 'degradation', 'maintenance', 'hypothetical'
  
  // ── Drive Cycle Simulation State ──
  const [drivePreset, setDrivePreset] = useState('cruise');
  const [simSpeed, setSimSpeed] = useState(telemetry.speed || 48);
  const [simSoc, setSimSoc] = useState(telemetry.battery_soc || 82);
  const [simAmbientTemp, setSimAmbientTemp] = useState(32);
  const [simThrottle, setSimThrottle] = useState(60);
  const [simBrake, setSimBrake] = useState(0);

  // ── Degradation Horizon ──
  const [horizonHours, setHorizonHours] = useState(500);
  const [selectedSubsystem, setSelectedSubsystem] = useState('battery');

  // ── Hypothetical Scenario State ──
  const [hypoDailyKm, setHypoDailyKm] = useState(80);
  const [hypoTemp, setHypoTemp] = useState(42);

  // Calculate Degradation Curve Points
  const degradationData = (() => {
    const points = [];
    let currentHealth = 92;
    const rate = selectedSubsystem === 'battery' ? 0.00045 : selectedSubsystem === 'motor' ? 0.00035 : 0.00025;
    const step = Math.max(1, Math.floor(horizonHours / 10));

    for (let h = 0; h <= horizonHours; h += step) {
      const drop = (h * rate * (1 + (simAmbientTemp - 25) * 0.03)) * (100 / 92);
      const health = Math.max(20, Math.round((currentHealth - drop) * 10) / 10);
      points.push({ hour: `${h}h`, health });
    }
    return points;
  })();

  const degradationChartConfig = {
    labels: degradationData.map(p => p.hour),
    datasets: [
      {
        label: `${selectedSubsystem.toUpperCase()} Health Score (%)`,
        data: degradationData.map(p => p.health),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4F46E5',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { font: { size: 11, family: 'Inter' }, color: '#475569' },
      },
    },
    scales: {
      x: { grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
      y: { min: 0, max: 100, grid: { color: '#F1F5F9' }, ticks: { color: '#94A3B8', font: { size: 10 } } },
    },
  };

  // Handle live drive preset apply
  const handleApplyDrivePreset = (preset) => {
    setDrivePreset(preset);
    let speed = 45, throttle = 50, brake = 0, motorTemp = 60, current = 12;

    if (preset === 'acceleration') {
      speed = 78;
      throttle = 95;
      motorTemp = 74;
      current = 28;
    } else if (preset === 'cruise') {
      speed = 52;
      throttle = 55;
      motorTemp = 62;
      current = 14;
    } else if (preset === 'braking') {
      speed = 15;
      throttle = 0;
      brake = 80;
      motorTemp = 58;
      current = -8; // Regen
    } else if (preset === 'eco') {
      speed = 35;
      throttle = 35;
      motorTemp = 52;
      current = 8;
    }

    setSimSpeed(speed);
    setSimThrottle(throttle);
    setSimBrake(brake);

    if (onApplySimulation) {
      onApplySimulation({
        speed,
        motor_temperature: motorTemp,
        battery_current: current,
        brake_pressure: brake > 0 ? 3.5 : 0,
        motor_rpm: speed * 58,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--color-text-primary)]">
                Digital Twin Simulation Studio
              </h2>
              <p className="text-xs text-[var(--color-text-muted)]">
                Physics-based Drive Cycle, Subsystem Aging, & Predictive Maintenance Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-border)] px-6 bg-slate-50/40">
          {[
            { id: 'drive', label: '🎮 Live Drive Physics', icon: Gauge },
            { id: 'degradation', label: '📉 Degradation Model', icon: TrendingUp },
            { id: 'maintenance', label: '🔧 Maintenance Prediction', icon: Wrench },
            { id: 'hypothetical', label: '🔮 What-If Scenarios', icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-white'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* 1. LIVE DRIVE SIMULATION */}
          {activeTab === 'drive' && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
                  Select Real-time Drive Cycle Phase
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'cruise', name: '🛣️ Highway Cruise', speed: '52 km/h', desc: 'Optimal motor efficiency' },
                    { id: 'acceleration', name: '⚡ Full Acceleration', speed: '78 km/h', desc: 'Peak torque & current' },
                    { id: 'braking', name: '🛑 Regen Braking', speed: '15 km/h', desc: 'Kinetic energy recovery' },
                    { id: 'eco', name: '🍃 Eco City Mode', speed: '35 km/h', desc: 'Minimal battery drain' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyDrivePreset(preset.id)}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        drivePreset === preset.id
                          ? 'border-[var(--color-primary)] bg-indigo-50/60 shadow-sm'
                          : 'border-[var(--color-border)] hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold text-xs text-[var(--color-text-primary)]">{preset.name}</div>
                      <div className="text-base font-extrabold font-mono text-[var(--color-primary)] my-1">{preset.speed}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">{preset.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Controls Sliders */}
              <div className="grid grid-cols-3 gap-4 bg-slate-50/80 p-4 rounded-xl border border-[var(--color-border)]">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Vehicle Speed</span>
                    <span className="font-mono text-[var(--color-primary)]">{simSpeed} km/h</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simSpeed}
                    onChange={(e) => {
                      const spd = Number(e.target.value);
                      setSimSpeed(spd);
                      if (onApplySimulation) {
                        onApplySimulation({
                          speed: spd,
                          motor_rpm: spd * 58,
                          motor_temperature: 45 + spd * 0.35,
                          battery_current: 5 + spd * 0.25,
                        });
                      }
                    }}
                    className="w-full accent-indigo-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Throttle Input</span>
                    <span className="font-mono text-emerald-600">{simThrottle}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simThrottle}
                    onChange={(e) => setSimThrottle(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Regen Brake Pressure</span>
                    <span className="font-mono text-amber-600">{simBrake}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simBrake}
                    onChange={(e) => {
                      const brk = Number(e.target.value);
                      setSimBrake(brk);
                      if (onApplySimulation) {
                        onApplySimulation({ brake_pressure: brk > 0 ? (brk / 20) : 0 });
                      }
                    }}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. DEGRADATION MODEL */}
          {activeTab === 'degradation' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold">Subsystem:</span>
                  {['battery', 'motor', 'controller'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubsystem(sub)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                        selectedSubsystem === sub
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Projection Horizon:</span>
                  <span className="text-xs font-bold font-mono text-[var(--color-primary)]">{horizonHours} Hours</span>
                </div>
              </div>

              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={horizonHours}
                onChange={e => setHorizonHours(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />

              <div className="h-64 mt-2">
                <Line data={degradationChartConfig} options={chartOptions} />
              </div>

              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] text-emerald-700 font-semibold uppercase">Initial Health</div>
                  <div className="text-lg font-bold text-emerald-800">92.0%</div>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">Projected at {horizonHours}h</div>
                  <div className="text-lg font-bold text-amber-800">
                    {degradationData[degradationData.length - 1]?.health}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                  <div className="text-[10px] text-indigo-700 font-semibold uppercase">Estimated Remaining Life</div>
                  <div className="text-lg font-bold text-indigo-800">
                    {Math.round(horizonHours * 1.8)} Hours
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. MAINTENANCE PREDICTION */}
          {activeTab === 'maintenance' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--color-text-secondary)]">
                AI predictive maintenance based on operating temperatures, vibration frequency, and duty cycle logs:
              </p>

              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <th className="p-3 font-bold">Subsystem</th>
                    <th className="p-3 font-bold">Current Health</th>
                    <th className="p-3 font-bold">Service In</th>
                    <th className="p-3 font-bold">Est. Date</th>
                    <th className="p-3 font-bold">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: '🔋 Li-ion Battery Pack', health: '92%', days: '145 days', date: '2027-01-22', urgency: 'Normal', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
                    { name: '⚙️ PMSM Hub Motor', health: '88%', days: '92 days', date: '2026-11-30', urgency: 'Normal', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
                    { name: '💡 Power Inverter / ECU', health: '95%', days: '210 days', date: '2027-03-28', urgency: 'Optimal', color: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700' },
                    { name: '🛑 Disc Brake Pads', health: '64%', days: '18 days', date: '2026-09-17', urgency: 'Attention', color: 'text-amber-600', badge: 'bg-amber-50 text-amber-700' },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold">{row.name}</td>
                      <td className="p-3 font-mono">{row.health}</td>
                      <td className="p-3 font-mono font-bold">{row.days}</td>
                      <td className="p-3 text-slate-500">{row.date}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${row.badge}`}>
                          {row.urgency}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. WHAT-IF SCENARIOS */}
          {activeTab === 'hypothetical' && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-[var(--color-text-secondary)]">
                Stress-test vehicle longevity by simulating extreme ambient conditions and intensive daily usage:
              </p>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Simulated Ambient Heat</span>
                    <span className="font-mono text-red-600 font-bold">{hypoTemp} °C</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="50"
                    value={hypoTemp}
                    onChange={e => setHypoTemp(Number(e.target.value))}
                    className="w-full accent-red-600"
                  />
                  <span className="text-[10px] text-slate-400">Extreme thermal stress accelerates aging</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-2">
                    <span>Daily Distance Run</span>
                    <span className="font-mono text-indigo-600 font-bold">{hypoDailyKm} km/day</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={hypoDailyKm}
                    onChange={e => setHypoDailyKm(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="text-[10px] text-slate-400">Heavy commercial usage profile</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col gap-2">
                <div className="text-xs font-bold text-amber-800">
                  ⚠️ AI Impact Prediction for {hypoTemp}°C @ {hypoDailyKm} km/day
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Under continuous {hypoTemp}°C operating temperature and {hypoDailyKm} km daily usage, battery thermal degradation rate increases by <strong>+{Math.round((hypoTemp - 25) * 3.2)}%</strong>. 
                  Recommended cooling fan duty cycle is <strong>90%</strong> and service interval should be adjusted to <strong>every 45 days</strong>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-[var(--color-border)] bg-slate-50/50 flex justify-between items-center">
          <span className="text-[11px] text-slate-400">
            ELESPA Simulation Core v2.4 • Physics & Thermal Equations
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-all cursor-pointer shadow-sm shadow-indigo-200"
          >
            Apply & Close
          </button>
        </div>

      </div>
    </div>
  );
}
