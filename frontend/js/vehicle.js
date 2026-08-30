/**
 * vehicle.js — Scooter model, animations, and subsystem visual effects
 * Loads the scooter image as a sprite and applies live-data-driven effects.
 */

export function createVehicle(THREE, scene) {
  const vehicle = {
    group: new THREE.Group(),
    wheelFL: null,
    wheelRL: null,
    speed: 0,
    targetLean: 0,
    currentLean: 0,
    headlight: null,
    brakeLight: null,
  };

  scene.add(vehicle.group);

  // ── Load scooter image as a texture sprite ─────────────────────
  const loader = new THREE.TextureLoader();
  loader.load(
    './assets/scooter.png',
    (texture) => {
      // Main scooter billboard
      const aspect = texture.image.width / texture.image.height;
      const geo = new THREE.PlaneGeometry(aspect * 5, 5);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const scooterPlane = new THREE.Mesh(geo, mat);
      scooterPlane.position.set(0, 2.5, 0);
      vehicle.group.add(scooterPlane);
      vehicle.scooterMesh = scooterPlane;

      // Glow disc beneath scooter
      const glowGeo = new THREE.CircleGeometry(3.5, 64);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
      });
      const glowDisc = new THREE.Mesh(glowGeo, glowMat);
      glowDisc.rotation.x = -Math.PI / 2;
      glowDisc.position.y = 0.02;
      vehicle.group.add(glowDisc);
      vehicle.glowDisc = glowDisc;

      // Outer pulsing ring
      const ringGeo = new THREE.RingGeometry(3.6, 3.9, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.03;
      vehicle.group.add(ring);
      vehicle.ring = ring;

      // Second outer ring
      const ring2Geo = new THREE.RingGeometry(4.5, 4.7, 64);
      const ring2Mat = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      });
      const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
      ring2.rotation.x = -Math.PI / 2;
      ring2.position.y = 0.03;
      vehicle.group.add(ring2);
      vehicle.ring2 = ring2;
    },
    undefined,
    () => {
      // Fallback: simple box if image fails to load
      console.warn('[vehicle] scooter.png not found — using placeholder');
      const geo = new THREE.BoxGeometry(3, 1.5, 6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x334466 });
      const box = new THREE.Mesh(geo, mat);
      box.position.y = 1;
      vehicle.group.add(box);
    }
  );

  // ── Headlight ──────────────────────────────────────────────────
  vehicle.headlight = new THREE.SpotLight(0x00d2ff, 3, 30, Math.PI / 8, 0.5);
  vehicle.headlight.position.set(0, 2, -3.5);
  vehicle.headlight.target.position.set(0, 0, -20);
  vehicle.group.add(vehicle.headlight);
  vehicle.group.add(vehicle.headlight.target);

  // Headlight cone glow
  const coneGeo = new THREE.ConeGeometry(0.3, 4, 16, 1, true);
  const coneMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    transparent: true,
    opacity: 0.05,
    side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = Math.PI / 2;
  cone.position.set(0, 1.5, -5);
  vehicle.group.add(cone);
  vehicle.headlightCone = cone;

  // ── Brake light (rear red) ─────────────────────────────────────
  vehicle.brakeLight = new THREE.PointLight(0xff3344, 0, 8);
  vehicle.brakeLight.position.set(0, 1.5, 3.5);
  vehicle.group.add(vehicle.brakeLight);

  // Rear glow plane
  const rearGeo = new THREE.PlaneGeometry(1.5, 0.3);
  const rearMat = new THREE.MeshBasicMaterial({
    color: 0xff3344,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const rearGlow = new THREE.Mesh(rearGeo, rearMat);
  rearGlow.position.set(0, 1.5, 3.6);
  vehicle.group.add(rearGlow);
  vehicle.rearGlow = rearGlow;

  // Vehicle positioned slightly forward in scene
  vehicle.group.position.set(0, 0, 2);

  // ── Update function — called every animation frame ─────────────
  vehicle.update = function(telemetry, delta, elapsed) {
    const speed    = telemetry.speed || 0;
    const rpm      = telemetry.motor_rpm || 0;
    const braking  = (telemetry.brake_pressure || 0) > 0.5;
    const accel    = speed > (vehicle._prevSpeed || 0);
    const soc      = telemetry.battery_soc || 80;
    const motorTemp = telemetry.motor_temperature || 60;

    vehicle._prevSpeed = speed;

    // ── Lean: forward on acceleration, back on braking ──────────
    if (speed < 1) {
      vehicle.targetLean = 0;
    } else if (braking) {
      vehicle.targetLean = 0.04;    // lean back
    } else if (accel) {
      vehicle.targetLean = -0.06;   // lean forward
    } else {
      vehicle.targetLean = -0.02;
    }
    vehicle.currentLean += (vehicle.targetLean - vehicle.currentLean) * 0.08;
    vehicle.group.rotation.x = vehicle.currentLean;

    // ── Subtle idle bob ─────────────────────────────────────────
    vehicle.group.position.y = Math.sin(elapsed * 1.2) * 0.015;

    // ── Glow rings pulse ────────────────────────────────────────
    if (vehicle.ring) {
      const pulse = 0.3 + 0.15 * Math.sin(elapsed * 2);
      vehicle.ring.material.opacity = speed > 1 ? pulse : 0.12;
      if (vehicle.ring2) {
        vehicle.ring2.material.opacity = speed > 1
          ? 0.1 + 0.08 * Math.sin(elapsed * 1.5 + 1)
          : 0.05;
      }
    }

    // ── Headlight brightness tied to battery SOC ────────────────
    if (vehicle.headlight) {
      vehicle.headlight.intensity = soc > 30 ? 3 : soc > 15 ? 1.5 : 0.5;
    }

    // ── Brake light ─────────────────────────────────────────────
    if (vehicle.brakeLight) {
      vehicle.brakeLight.intensity = braking ? 4 : 0;
      if (vehicle.rearGlow) {
        vehicle.rearGlow.material.opacity = braking ? 0.8 : 0;
      }
    }

    // ── Motor overheat shimmer effect ────────────────────────────
    if (vehicle.scooterMesh && motorTemp > 90) {
      const shimmer = 1 + 0.02 * Math.sin(elapsed * 30 + Math.random());
      vehicle.scooterMesh.scale.x = shimmer;
    } else if (vehicle.scooterMesh) {
      vehicle.scooterMesh.scale.x = 1;
    }

    // ── Glowing disc speed-up ────────────────────────────────────
    if (vehicle.glowDisc) {
      vehicle.glowDisc.material.opacity = 0.04 + (speed / 100) * 0.12;
      vehicle.glowDisc.rotation.z += (speed / 100) * 0.02;
    }
  };

  return vehicle;
}
