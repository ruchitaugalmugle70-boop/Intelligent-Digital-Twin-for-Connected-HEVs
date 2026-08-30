/**
 * app.js — Main application controller
 * Manages WebSocket connection, live telemetry updates,
 * callout card updates, stats bar, GPS minimap, and UI events.
 */

import { initScene, updateTelemetry, setCameraMode } from './scene.js';
import { initSimulationPanel } from './simulation.js';

const API_BASE = 'http://localhost:8000';
const WS_BASE  = 'ws://localhost:8000';
const VEHICLE_ID = 1;
const POLL_INTERVAL_MS = 3000;

// ── State ───────────────────────────────────────────────────────────
let latestTelemetry = {};
let ws = null;
let isPollingFallback = false;

// GPS route for minimap
const GPS_ROUTE = [
  [18.5204, 73.8567], [18.5220, 73.8600], [18.5250, 73.8640],
  [18.5280, 73.8610], [18.5270, 73.8570], [18.5250, 73.8540],
  [18.5220, 73.8530], [18.5204, 73.8567],
];
let minimapCtx = null;
let gpsTrail = [];


// ── Boot ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async () => {
  initUI();
  initMinimap();
  initSimulationPanel();

  // Init Three.js scene
  const canvas = document.getElementById('three-canvas');
  initScene(canvas);

  // Try WebSocket first, fall back to polling
  connectWebSocket();

  // Hide loading overlay after a short delay
  setTimeout(() => {
    document.getElementById('loading-overlay')?.classList.add('hidden');
  }, 1800);
});


// ── WebSocket ───────────────────────────────────────────────────────
function connectWebSocket() {
  try {
    ws = new WebSocket(`${WS_BASE}/ws/vehicle/${VEHICLE_ID}`);

    ws.onopen = () => {
      setLiveBadge(true);
      isPollingFallback = false;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'connected') return;
        handleTelemetry(data);
      } catch (_) {}
    };

    ws.onerror = () => {
      if (!isPollingFallback) startPolling();
    };

    ws.onclose = () => {
      setLiveBadge(false);
      setTimeout(connectWebSocket, 5000);  // reconnect after 5s
    };

  } catch (_) {
    startPolling();
  }
}

function startPolling() {
  if (isPollingFallback) return;
  isPollingFallback = true;
  console.log('[app] WebSocket unavailable — falling back to polling');

  setInterval(async () => {
    try {
      const resp = await fetch(`${API_BASE}/telemetry/latest/${VEHICLE_ID}`);
      if (resp.ok) {
        const data = await resp.json();
        setLiveBadge(true);
        handleTelemetry(data);
      }
    } catch (_) {
      setLiveBadge(false);
    }
  }, POLL_INTERVAL_MS);
}


// ── Handle incoming telemetry ────────────────────────────────────────
function handleTelemetry(data) {
  latestTelemetry = data;
  updateTelemetry(data);          // update Three.js scene
  updateCallouts(data);           // update subsystem cards
  updateStatsBar(data);           // update bottom bar
  updateMinimap(data);            // update GPS map
  updateSystemView(data);         // update system view cards
}


// ── Callout Cards ────────────────────────────────────────────────────
function updateCallouts(t) {
  // Battery
  const soc = t.battery_soc ?? '--';
  const socNum = parseFloat(soc);
  const batState = socNum >= 60 ? 'good' : socNum >= 30 ? 'warning' : 'critical';
  const batLabel = socNum >= 60 ? 'Good' : socNum >= 30 ? 'Warning' : 'Critical';
  setCallout('battery', `${soc}%`, `${t.battery_temperature ?? '--'}°C`, batState, batLabel);

  // Motor
  const mTemp = parseFloat(t.motor_temperature ?? 0);
  const motState = mTemp < 80 ? 'good' : mTemp < 95 ? 'warning' : 'critical';
  const motLabel = mTemp < 80 ? 'Healthy' : mTemp < 95 ? 'Warm' : 'Overheating';
  setCallout('motor', `${t.motor_rpm?.toFixed(0) ?? '--'} RPM`, `${t.motor_temperature ?? '--'}°C`, motState, motLabel);

  // Controller
  const ctrlStatus = (t.controller_status || 'ok').toLowerCase();
  const ctrlState  = ctrlStatus === 'ok' || ctrlStatus === 'charging' ? 'good' : 'warning';
  const ctrlLabel  = ctrlStatus === 'charging' ? 'Charging' : ctrlStatus === 'ok' ? 'OK' : 'Warning';
  setCallout('controller', `${t.controller_temperature ?? '--'}°C`, 'Controller', ctrlState, ctrlLabel);

  // Braking
  const bp = parseFloat(t.brake_pressure ?? 0);
  const brkState  = bp > 3 ? 'warning' : 'good';
  const brkLabel  = bp > 0.5 ? 'Braking' : 'Standby';
  setCallout('braking', `${t.brake_pressure?.toFixed(1) ?? '--'} bar`, `${t.brake_temperature ?? '--'}°C`, brkState, brkLabel);
}

function setCallout(name, valueText, sublabel, state, statusText) {
  const card = document.querySelector(`.callout.${name}`);
  if (!card) return;

  card.setAttribute('data-state', state);
  const dot  = card.querySelector('.status-dot');
  const text = card.querySelector('.status-text');
  const val  = card.querySelector('.callout-value');
  const sub  = card.querySelector('.callout-sublabel');

  if (dot)  { dot.setAttribute('data-state', state); }
  if (text) text.textContent = statusText;
  if (val)  val.textContent  = valueText;
  if (sub)  sub.textContent  = sublabel;
}


// ── Stats Bar ─────────────────────────────────────────────────────────
function updateStatsBar(t) {
  setText('stat-speed',    t.speed?.toFixed(0) ?? '--', 'km/h');
  setText('stat-battery',  t.battery_soc?.toFixed(0) ?? '--', '%');
  setText('stat-temp',     t.battery_temperature?.toFixed(0) ?? '--', '°C');
  setText('stat-odo',      t.odometer?.toFixed(0) ?? '--', 'km');
  setText('stat-updated',  '0', 's ago');

  // Range estimate (very rough: km left at current drain)
  const rangeEst = t.battery_soc ? Math.round(t.battery_soc * 1.2) : '--';
  setText('stat-range', `${rangeEst}`, 'km');
}

function setText(id, val, unit) {
  const el = document.getElementById(id);
  if (el) el.textContent = `${val} ${unit}`;
}


// ── GPS Minimap ────────────────────────────────────────────────────────
function initMinimap() {
  const canvas = document.getElementById('minimap-canvas');
  if (!canvas) return;
  minimapCtx = canvas.getContext('2d');
  canvas.width  = 140;
  canvas.height = 140;
}

function updateMinimap(t) {
  if (!minimapCtx) return;

  const lat = t.gps_latitude;
  const lon = t.gps_longitude;
  if (!lat || !lon) return;

  const ctx = minimapCtx;
  const W = 140, H = 140;

  // Map GPS bounds to canvas
  const latMin = 18.518, latMax = 18.530;
  const lonMin = 73.852, lonMax = 73.866;

  const x = ((lon - lonMin) / (lonMax - lonMin)) * W;
  const y = H - ((lat - latMin) / (latMax - latMin)) * H;

  gpsTrail.push({ x, y });
  if (gpsTrail.length > 80) gpsTrail.shift();

  // Clear
  ctx.fillStyle = '#050d1a';
  ctx.fillRect(0, 0, W, H);

  // Draw route skeleton
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(0,210,255,0.12)';
  ctx.lineWidth = 4;
  GPS_ROUTE.forEach(([rlat, rlon], i) => {
    const rx = ((rlon - lonMin) / (lonMax - lonMin)) * W;
    const ry = H - ((rlat - latMin) / (latMax - latMin)) * H;
    i === 0 ? ctx.moveTo(rx, ry) : ctx.lineTo(rx, ry);
  });
  ctx.closePath();
  ctx.stroke();

  // Draw trail
  if (gpsTrail.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,210,255,0.5)';
    ctx.lineWidth = 1.5;
    gpsTrail.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();
  }

  // Draw vehicle dot
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#00d2ff';
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pulse ring
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0,210,255,0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();
}


// ── System View cards ──────────────────────────────────────────────────
function updateSystemView(t) {
  updateSubsysCard('card-battery', t.battery_soc ?? 85, [
    ['SOC',  `${t.battery_soc?.toFixed(1) ?? '--'}%`],
    ['Volt', `${t.battery_voltage?.toFixed(1) ?? '--'}V`],
    ['Curr', `${t.battery_current?.toFixed(1) ?? '--'}A`],
    ['Temp', `${t.battery_temperature?.toFixed(1) ?? '--'}°C`],
  ]);
  updateSubsysCard('card-motor', motorHealthFromTemp(t.motor_temperature), [
    ['RPM',   `${t.motor_rpm?.toFixed(0) ?? '--'}`],
    ['Torque',`${t.motor_torque?.toFixed(1) ?? '--'} Nm`],
    ['Temp',  `${t.motor_temperature?.toFixed(1) ?? '--'}°C`],
  ]);
  updateSubsysCard('card-controller', controllerHealth(t.controller_temperature), [
    ['Temp',   `${t.controller_temperature?.toFixed(1) ?? '--'}°C`],
    ['Status', `${t.controller_status ?? '--'}`],
  ]);
  updateSubsysCard('card-braking', brakingHealth(t.brake_pressure, t.brake_temperature), [
    ['Pressure', `${t.brake_pressure?.toFixed(1) ?? '--'} bar`],
    ['Temp',     `${t.brake_temperature?.toFixed(1) ?? '--'}°C`],
  ]);
}

function motorHealthFromTemp(temp) {
  if (!temp) return 80;
  if (temp < 70) return 95;
  if (temp < 85) return 75;
  if (temp < 95) return 50;
  return 25;
}

function controllerHealth(temp) {
  if (!temp) return 90;
  if (temp < 50) return 95;
  if (temp < 70) return 75;
  return 45;
}

function brakingHealth(pressure, temp) {
  if (!pressure && !temp) return 85;
  const p = pressure || 0;
  const t = temp || 25;
  return Math.max(20, 95 - p * 5 - Math.max(0, t - 60) * 0.5);
}

function updateSubsysCard(id, healthPct, metrics) {
  const card = document.getElementById(id);
  if (!card) return;

  const fill  = card.querySelector('.health-bar-fill');
  const label = card.querySelector('.health-pct-label');
  const rows  = card.querySelectorAll('.metric-row');

  const pct = Math.max(0, Math.min(100, healthPct));
  const color = pct >= 60 ? '#00ff88' : pct >= 30 ? '#ffd700' : '#ff4455';

  if (fill)  { fill.style.width = `${pct}%`; fill.style.background = color; }
  if (label) label.textContent = `${pct.toFixed(0)}%`;

  metrics.forEach(([, val], i) => {
    if (rows[i]) rows[i].querySelector('.metric-val').textContent = val;
  });
}


// ── UI wiring ──────────────────────────────────────────────────────────
function initUI() {
  // View tabs
  document.querySelectorAll('.view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.view-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const view = tab.dataset.view;
      const canvas  = document.getElementById('three-canvas');
      const callouts = document.querySelectorAll('.callout');
      const minimap  = document.getElementById('minimap-container');
      const sysView  = document.getElementById('system-view');

      if (view === '3d') {
        canvas.style.display  = 'block';
        minimap.style.display = 'block';
        callouts.forEach(c => c.style.display = 'block');
        sysView.classList.remove('active');
      } else {
        canvas.style.display  = 'none';
        minimap.style.display = 'none';
        callouts.forEach(c => c.style.display = 'none');
        sysView.classList.add('active');
      }
    });
  });

  // Camera mode buttons
  document.querySelectorAll('[data-camera]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-camera]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setCameraMode(btn.dataset.camera);
    });
  });

  // Simulation panel open/close
  document.getElementById('open-sim-btn')?.addEventListener('click', () => {
    document.getElementById('sim-panel').classList.add('open');
  });

  document.getElementById('sim-close-btn')?.addEventListener('click', () => {
    document.getElementById('sim-panel').classList.remove('open');
  });

  // Pause/resume
  let paused = false;
  document.getElementById('pause-btn')?.addEventListener('click', (e) => {
    paused = !paused;
    e.target.textContent = paused ? '▶ Resume' : '⏸ Pause';
    if (ws && paused) ws.close();
    else if (!paused) connectWebSocket();
  });
}

// ── Live badge ──────────────────────────────────────────────────────────
function setLiveBadge(connected) {
  const badge = document.getElementById('live-badge');
  if (!badge) return;
  const dot = badge.querySelector('.live-dot');
  const text = badge.querySelector('.live-text');
  badge.classList.toggle('disconnected', !connected);
  if (dot)  dot.style.background = connected ? 'var(--green)' : 'var(--red)';
  if (text) text.textContent = connected ? 'LIVE' : 'OFFLINE';
}
