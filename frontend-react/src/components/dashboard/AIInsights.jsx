import { useEffect, useRef } from 'react';
import { Shield, Calendar, User, Zap } from 'lucide-react';

export default function AIInsights({ telemetry }) {
  const canvasRef = useRef(null);
  const score = telemetry.health_score || 92;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 28, cy = 28, r = 22;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = 56 * dpr;
    canvas.height = 56 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, 56, 56);

    // Background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Score arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.strokeStyle = score >= 80 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [score]);

  const insights = [
    { icon: Shield, label: 'Failure Risk',      value: 'Low Risk',   color: 'text-emerald-600' },
    { icon: Calendar, label: 'Next Maintenance', value: 'in 15 days', color: 'text-[var(--color-text-primary)]' },
    { icon: User, label: 'Rider Behavior',       value: 'Safe',       color: 'text-emerald-600' },
    { icon: Zap, label: 'Energy Efficiency',     value: '87%',        color: 'text-emerald-600' },
  ];

  return (
    <div className="card-glass overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">AI Insights</h3>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {/* Donut Score */}
        <div className="flex items-center gap-4 mb-1">
          <div className="relative w-14 h-14 shrink-0">
            <canvas ref={canvasRef} className="w-14 h-14" style={{ width: 56, height: 56 }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="metric-value text-sm">{score.toFixed(0)}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)]">Health Score</h4>
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {score.toFixed(0)} / 100 System Integrity
            </span>
          </div>
        </div>

        {/* Metrics */}
        {insights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
              <span className={`font-semibold ${item.color}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
