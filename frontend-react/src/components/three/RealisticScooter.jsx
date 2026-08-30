import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const GLB_URL = '/assets/models/etwin_scooter.glb';

/**
 * RealisticScooter — Primary high-fidelity GLB 3D model with PBR materials,
 * dynamic telemetry bindings, body panel paint recoloring, and System View fade.
 */
export default function RealisticScooter({
  paintColor = '#EDE9E1',
  telemetry = {},
  isSystemView = false,
  steeringAngle = 0,
}) {
  const groupRef = useRef();
  const frontForkRef = useRef();
  const prevSpeed = useRef(0);
  const currentLean = useRef(0);
  const currentPitch = useRef(0);

  // Load realistic GLB with Drei useGLTF
  const { scene } = useGLTF(GLB_URL);

  // Clone scene with useMemo so each instance maintains clean state
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Ensure materials have correct PBR properties
        if (child.material) {
          child.material = child.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  // Handle Paint Color Switching (Body panels only) & System View Fade
  useEffect(() => {
    if (!clonedScene) return;

    clonedScene.traverse((child) => {
      if (child.isMesh && child.material) {
        const matName = (child.material.name || '').toLowerCase();
        const objName = (child.name || '').toLowerCase();

        const isBodyPanel =
          matName.includes('body') ||
          matName.includes('ivory') ||
          matName.includes('paint') ||
          objName.includes('body') ||
          objName.includes('apron') ||
          objName.includes('fender') ||
          objName.includes('skirt') ||
          objName.includes('cowl');

        const isInternalCAD =
          matName.includes('cad') ||
          matName.includes('battery') ||
          matName.includes('bms') ||
          matName.includes('ecu') ||
          matName.includes('motor') ||
          matName.includes('wiring') ||
          objName.includes('internal');

        if (isBodyPanel) {
          if (isSystemView) {
            // System View: Fade body to semi-transparent glass
            child.material.transparent = true;
            child.material.opacity = 0.18;
            child.material.color = new THREE.Color('#CBD5E1');
            child.material.roughness = 0.1;
            child.material.metalness = 0.1;
          } else {
            // Normal View: Solid automotive clearcoat paint
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.color = new THREE.Color(paintColor);
            child.material.roughness = 0.16;
            child.material.metalness = 0.15;
          }
          child.material.needsUpdate = true;
        }

        // Hide internal CAD modules in realistic mode (InternalSystems handles them in System View)
        if (isInternalCAD) {
          child.visible = isSystemView;
        }

        // Brake light activation
        const braking = (telemetry.brake_pressure || 0) > 0.5;
        if (matName.includes('taillight') || objName.includes('taillight')) {
          child.material.emissive = new THREE.Color('#EF4444');
          child.material.emissiveIntensity = braking ? 6.0 : 1.5;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [paintColor, isSystemView, clonedScene, telemetry.brake_pressure]);

  const speed = telemetry.speed || 0;
  const braking = (telemetry.brake_pressure || 0) > 0.5;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 1. Acceleration / Braking Pitch (IMU)
    const accel = speed > prevSpeed.current;
    let targetPitch = 0;
    if (braking) targetPitch = 0.04;
    else if (accel && speed > 5) targetPitch = -0.04;
    else targetPitch = 0;

    currentPitch.current += (targetPitch - currentPitch.current) * 0.08;
    groupRef.current.rotation.x = currentPitch.current;

    // 2. Cornering / Acceleration Roll (IMU Lean)
    const targetLean = (steeringAngle || 0) * -0.3;
    currentLean.current += (targetLean - currentLean.current) * 0.1;
    groupRef.current.rotation.z = currentLean.current;

    // 3. Riding Road Vibration
    if (speed > 1) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.018) * 0.006 + (Math.random() - 0.5) * 0.0015;
    } else {
      groupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.003;
    }

    // 4. Wheels Rotation (Tires, Rims, Spokes)
    if (clonedScene) {
      const wheelDelta = (speed / 3.6) * delta * 5.2;
      clonedScene.traverse((child) => {
        if (
          child.isMesh &&
          (child.name.includes('Wheel') ||
            child.name.includes('Tire') ||
            child.name.includes('Rim') ||
            child.name.includes('Spoke') ||
            child.name.includes('Hub'))
        ) {
          child.rotation.x += wheelDelta;
        }

        // 5. Steering / Front Fork Yaw
        if (
          child.name.includes('Steering') ||
          child.name.includes('Handlebar') ||
          child.name.includes('Fork')
        ) {
          child.rotation.y = THREE.MathUtils.degToRad(steeringAngle || 0);
        }
      });
    }

    prevSpeed.current = speed;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, -0.6, 0]} scale={2.8}>
      {clonedScene && <primitive object={clonedScene} />}
    </group>
  );
}

// Preload the GLB model
try {
  useGLTF.preload(GLB_URL);
} catch (_) {}
