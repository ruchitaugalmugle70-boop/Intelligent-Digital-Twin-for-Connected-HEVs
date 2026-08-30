/**
 * road.js — Infinite scrolling road environment
 * Creates the Three.js road, environment, and sky using
 * texture scrolling to simulate forward vehicle movement.
 */

export function createRoad(THREE, scene) {
  const road = {};

  // ── Road Plane ─────────────────────────────────────────────────
  const roadGeo = new THREE.PlaneGeometry(14, 400);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.95,
    metalness: 0.0,
  });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  roadMesh.receiveShadow = true;
  scene.add(roadMesh);
  road.mesh = roadMesh;

  // ── Road Edge Lines ────────────────────────────────────────────
  function makeLine(x) {
    const geo = new THREE.BoxGeometry(0.15, 0.01, 400);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x888888 });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, 0.01, 0);
    scene.add(m);
    return m;
  }
  makeLine(-6.5);
  makeLine(6.5);

  // ── Centre Dashed Lane Markers ─────────────────────────────────
  road.dashes = [];
  for (let z = -200; z < 200; z += 12) {
    const geo = new THREE.BoxGeometry(0.25, 0.011, 5);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0x443300,
    });
    const dash = new THREE.Mesh(geo, mat);
    dash.position.set(0, 0.01, z);
    scene.add(dash);
    road.dashes.push(dash);
  }

  // ── Ground plane (extends beyond road) ────────────────────────
  const groundGeo = new THREE.PlaneGeometry(400, 400);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a1505, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.02;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Streetlights ───────────────────────────────────────────────
  road.lights = [];
  road.lightSources = [];

  function makeStreetlight(x, z) {
    const group = new THREE.Group();

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 7, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x555566 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.5;
    group.add(pole);

    // Arm
    const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(x > 0 ? -1.25 : 1.25, 7, 0);
    group.add(arm);

    // Lamp head
    const lampGeo = new THREE.SphereGeometry(0.3, 8, 6);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffa040,
      emissive: 0xffa040,
      emissiveIntensity: 2,
    });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x > 0 ? -2.5 : 2.5, 7, 0);
    group.add(lamp);

    // Point light
    const light = new THREE.PointLight(0xffa040, 1.5, 20);
    light.position.set(x > 0 ? -2.5 : 2.5, 6.5, 0);
    group.add(light);
    road.lightSources.push(light);

    group.position.set(x, 0, z);
    scene.add(group);
    road.lights.push(group);
  }

  for (let z = -180; z < 200; z += 30) {
    makeStreetlight(9, z);
    makeStreetlight(-9, z);
  }

  // ── Buildings on sides ─────────────────────────────────────────
  road.buildings = [];
  const buildingColors = [0x0d1b2a, 0x0a1520, 0x0f1d30, 0x081218];

  function makeBuilding(x, z) {
    const w = 8 + Math.random() * 12;
    const h = 15 + Math.random() * 50;
    const d = 8 + Math.random() * 12;
    const geo = new THREE.BoxGeometry(w, h, d);
    const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: 0x0a0f1a,
      roughness: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    scene.add(mesh);
    road.buildings.push(mesh);

    // Random window glow points
    for (let i = 0; i < 6; i++) {
      const winLight = new THREE.PointLight(0x4488ff, 0.3, 5);
      winLight.position.set(
        x + (Math.random() - 0.5) * w * 0.8,
        h * Math.random() * 0.8,
        z + (Math.random() - 0.5) * d * 0.4
      );
      scene.add(winLight);
    }
  }

  for (let z = -190; z < 200; z += 25) {
    makeBuilding(22 + Math.random() * 8, z);
    makeBuilding(-22 - Math.random() * 8, z);
  }

  // ── Sky dome ───────────────────────────────────────────────────
  const skyGeo = new THREE.SphereGeometry(500, 32, 16);
  const skyMat = new THREE.MeshBasicMaterial({
    color: 0x020812,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));

  // ── Stars ──────────────────────────────────────────────────────
  const starGeo = new THREE.BufferGeometry();
  const starPositions = [];
  for (let i = 0; i < 1500; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 400 + Math.random() * 50;
    starPositions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
  scene.add(new THREE.Points(starGeo, starMat));

  // ── Scroll function ────────────────────────────────────────────
  const LOOP_LENGTH = 12;   // dash spacing

  road.scroll = function(speedKmh, delta) {
    if (speedKmh <= 0) return;

    // Convert speed to scroll rate (m/s → units/frame)
    const scrollRate = (speedKmh / 3.6) * delta * 2.5;

    // Scroll dashes
    for (const dash of road.dashes) {
      dash.position.z += scrollRate;
      if (dash.position.z > 120) dash.position.z -= 400;
    }

    // Scroll streetlights
    for (const lamp of road.lights) {
      lamp.position.z += scrollRate;
      if (lamp.position.z > 150) lamp.position.z -= 360;
    }

    // Scroll buildings
    for (const bldg of road.buildings) {
      bldg.position.z += scrollRate;
      if (bldg.position.z > 150) bldg.position.z -= 380;
    }
  };

  return road;
}
