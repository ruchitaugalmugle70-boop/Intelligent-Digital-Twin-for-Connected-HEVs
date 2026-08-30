import { useEffect, useRef } from 'react';

export default function LocationMap({ telemetry }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.parentElement.clientWidth;
    const h = canvas.height = canvas.parentElement.clientHeight;

    // Light background
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < w; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
    }
    for (let i = 0; i < h; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Road network
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(30, h - 30); ctx.lineTo(w * 0.4, h * 0.6); ctx.lineTo(w * 0.8, h * 0.7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * 0.2, 30); ctx.lineTo(w * 0.5, h * 0.4); ctx.lineTo(w * 0.9, 40); ctx.stroke();

    // Labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Viman Nagar', w * 0.38, 35);
    ctx.fillText('Kharadi', w * 0.75, 65);
    ctx.fillText('Hadapsar', 35, h * 0.45);
    ctx.fillText('Magarpatta City', w * 0.62, h - 25);

    // Active route
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(79, 70, 229, 0.3)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(35, h * 0.45);
    ctx.quadraticCurveTo(w * 0.4, h * 0.35, w * 0.75, 65);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Vehicle marker
    const mx = w * (0.45 + Math.sin(Date.now() * 0.0005) * 0.15);
    const my = h * 0.42;

    // Pulse ring
    ctx.fillStyle = 'rgba(79, 70, 229, 0.12)';
    ctx.beginPath(); ctx.arc(mx, my, 16, 0, Math.PI * 2); ctx.fill();

    // Outer ring
    ctx.fillStyle = 'rgba(79, 70, 229, 0.25)';
    ctx.beginPath(); ctx.arc(mx, my, 10, 0, Math.PI * 2); ctx.fill();

    // Inner dot
    ctx.fillStyle = '#4F46E5';
    ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();

    // White center
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fill();
  }, [telemetry.gps_latitude, telemetry.gps_longitude]);

  return (
    <div className="card-glass overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] bg-slate-50/50">
        <h3 className="text-[12px] font-bold text-[var(--color-text-primary)]">Live Location</h3>
      </div>
      <div className="relative" style={{ height: 200 }}>
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      <div className="p-3 bg-slate-50/80 border-t border-[var(--color-border)]">
        <div className="text-[9px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
          Location Details
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
          <div>
            <span className="text-[var(--color-text-muted)]">Latitude: </span>
            <span className="font-mono font-semibold">{telemetry.gps_latitude?.toFixed(4)} °N</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Longitude: </span>
            <span className="font-mono font-semibold">{telemetry.gps_longitude?.toFixed(4)} °E</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Heading: </span>
            <span className="font-mono font-semibold">95° (East)</span>
          </div>
          <div>
            <span className="text-[var(--color-text-muted)]">Updated: </span>
            <span className="font-mono font-semibold">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
