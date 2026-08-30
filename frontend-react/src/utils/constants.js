// ── API & WebSocket ──
export const API_BASE = 'http://localhost:8000';
export const WS_BASE = 'ws://localhost:8000';
export const VEHICLE_ID = 1;

// ── Paint Colors ──
export const PAINT_COLORS = {
  white:  { hex: '#EDE9E1', label: 'Arctic Cream',    image: '/assets/etwin_white.jpg' },
  black:  { hex: '#141416', label: 'Matte Black',     image: '/assets/etwin_black.jpg' },
  blue:   { hex: '#0284C7', label: 'Electric Blue',   image: '/assets/etwin_blue.jpg' },
  red:    { hex: '#DC2626', label: 'Cherry Red',      image: '/assets/etwin_red.jpg' },
  grey:   { hex: '#64748B', label: 'Graphite Grey',   image: '/assets/etwin_grey.jpg' },
};

// ── Camera Presets (Tuned to reference image) ──
export const CAMERA_PRESETS = {
  chase: { position: [-3.2, 1.8, 4.2], target: [0.3, 1.1, 0] },
  side:  { position: [-6.5, 1.5, 0.2], target: [0, 1.1, 0] },
  top:   { position: [0, 12, 0.5],     target: [0, 0, 0] },
  front: { position: [-0.5, 1.6, 6.0], target: [0, 1.0, 0] },
};

// ── Default Telemetry ──
export const DEFAULT_TELEMETRY = {
  speed: 48,
  battery_soc: 82,
  battery_voltage: 72.4,
  battery_current: 12.5,
  battery_temperature: 32,
  motor_temperature: 63,
  motor_rpm: 2800,
  motor_torque: 18.5,
  controller_temperature: 45,
  controller_status: 'ok',
  brake_pressure: 0,
  brake_temperature: 28,
  health_score: 92,
  gps_latitude: 18.5204,
  gps_longitude: 73.8567,
  odometer: 1250,
};

// ── Subsystem Config ──
export const SUBSYSTEMS = [
  { key: 'battery',      label: 'Battery Pack',     icon: 'Battery' },
  { key: 'motor',        label: 'Hub Motor',        icon: 'Zap' },
  { key: 'controller',   label: 'Controller/ECU',   icon: 'Cpu' },
  { key: 'bms',          label: 'BMS Module',       icon: 'CircuitBoard' },
  { key: 'braking',      label: 'Braking System',   icon: 'Disc' },
  { key: 'communication',label: 'Communication',    icon: 'Wifi' },
];

// ── Nav Items ──
export const NAV_ITEMS = [
  { key: 'overview',     label: 'Overview',       icon: 'LayoutDashboard' },
  { key: 'telemetry',    label: 'Live Telemetry', icon: 'Activity' },
  { key: 'twin',         label: 'Vehicle Twin',   icon: 'Car' },
  { key: 'ai',           label: 'AI Insights',    icon: 'Brain' },
  { key: 'diagnostics',  label: 'Diagnostics',    icon: 'Search' },
  { key: 'simulation',   label: 'Simulation',     icon: 'FlaskConical' },
  { key: 'maintenance',  label: 'Maintenance',    icon: 'Wrench' },
  { key: 'reports',      label: 'Reports',        icon: 'FileText' },
  { key: 'alerts',       label: 'Alerts',         icon: 'Bell' },
  { key: 'settings',     label: 'Settings',       icon: 'Settings' },
];

// ── Material Colors ──
export const CAD_COLORS = {
  battery:    '#10B981',
  bms:        '#F59E0B',
  controller: '#0284C7',
  motor:      '#EF4444',
  suspension: '#A855F7',
  harness:    '#F97316',
};
