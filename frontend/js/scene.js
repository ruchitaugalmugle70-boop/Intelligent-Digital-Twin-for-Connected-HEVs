/**
 * scene.js — Three.js scene orchestrator
 * Sets up the renderer, camera, lights, and animation loop.
 * Connects road scrolling and vehicle animations to live telemetry.
 */

import { createRoad }    from './road.js';
import { createVehicle } from './vehicle.js';

let renderer, scene, camera, road, vehicle;
let currentTelemetry = {};
let elapsed = 0;
let cameraMode = 'chase';

// ── Camera positions ────────────────────────────────────────────────
const CAMERA_PRESETS = {
  chase:  { pos: [0, 6, 16],  look: [0, 1, 0]  },
  side:   { pos: [18, 5, 0],  look: [0, 1.5, 0] },
  top:    { pos: [0, 25, 0],  look: [0, 0, 0]   },
};

export function initScene(canvasEl) {
  // ── Renderer ─────────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;

  // ── Scene ─────────────────────────────────────────────────────────
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020812, 0.012);

  // ── Camera ─────────────────────────────────────────────────────────
  camera = new THREE.PerspectiveCamera(
    60,
    canvasEl.clientWidth / canvasEl.clientHeight,
    0.1,
    600
  );
  setCameraMode('chase');

  // ── Lights ─────────────────────────────────────────────────────────
  const ambient = new THREE.AmbientLight(0x0a1428, 2.5);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x2244aa, 0.8);
  dirLight.position.set(5, 20, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Cyan rim light on vehicle
  const rimLight = new THREE.PointLight(0x00d2ff, 2, 12);
  rimLight.position.set(0, 4, 5);
  scene.add(rimLight);

  // ── Road & Vehicle ──────────────────────────────────────────────────
  road    = createRoad(THREE, scene);
  vehicle = createVehicle(THREE, scene);

  // ── Resize handler ──────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    const w = canvasEl.clientWidth;
    const h = canvasEl.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // ── Animation loop ──────────────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    elapsed += delta;

    const speed = currentTelemetry.speed || 0;

    road.scroll(speed, delta);
    vehicle.update(currentTelemetry, delta, elapsed);

    renderer.render(scene, camera);
  }

  animate();
}

export function updateTelemetry(telemetry) {
  currentTelemetry = telemetry;
}

export function setCameraMode(mode) {
  cameraMode = mode;
  const preset = CAMERA_PRESETS[mode] || CAMERA_PRESETS.chase;
  if (camera) {
    camera.position.set(...preset.pos);
    camera.lookAt(...preset.look);
  }
}
