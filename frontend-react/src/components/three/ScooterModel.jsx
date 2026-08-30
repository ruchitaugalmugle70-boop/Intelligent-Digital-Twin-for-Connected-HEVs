import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Procedural fallback 3D scooter if GLB is loading or in transit
 */
function ProceduralScooter({ paintColor, speed, braking }) {
  const group = useRef();
  useFrame((_, delta) => {
    if (group.current && speed > 1) {
      group.current.position.y = Math.sin(Date.now() * 0.015) * 0.008;
    }
  });

  return (
    <group ref={group} scale={2.8} rotation={[0, -0.6, 0]}>
      {/* Front Wheel */}
      <mesh position={[0, 0.24, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.055, 16, 32]} />
        <meshStandardMaterial color="#111215" roughness={0.9} />
      </mesh>
      {/* Rear Wheel */}
      <mesh position={[0, 0.24, -0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.06, 16, 32]} />
        <meshStandardMaterial color="#111215" roughness={0.9} />
      </mesh>
      {/* Front Apron */}
      <mesh position={[0, 0.65, 0.35]} scale={[1.1, 0.8, 1.4]}>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial color={paintColor} roughness={0.2} metalness={0.15} />
      </mesh>
      {/* Handlebars */}
      <mesh position={[0, 0.95, 0.38]}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#181A20" roughness={0.5} />
      </mesh>
      {/* Floorboard */}
      <mesh position={[0, 0.26, -0.05]}>
        <boxGeometry args={[0.42, 0.06, 0.55]} />
        <meshStandardMaterial color="#181A20" roughness={0.5} />
      </mesh>
      {/* Body & Seat */}
      <mesh position={[0, 0.46, -0.32]}>
        <boxGeometry args={[0.32, 0.3, 0.62]} />
        <meshStandardMaterial color={paintColor} roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.65, -0.28]}>
        <boxGeometry args={[0.3, 0.1, 0.68]} />
        <meshStandardMaterial color="#141416" roughness={0.85} />
      </mesh>
      {/* Rider Helmet */}
      <mesh position={[0, 1.48, -0.08]} scale={[0.95, 1.15, 1.05]}>
        <sphereGeometry args={[0.13, 24, 16]} />
        <meshStandardMaterial color="#101114" roughness={0.15} metalness={0.4} />
      </mesh>
      {/* Rider Torso */}
      <mesh position={[0, 1.15, -0.12]} rotation={[0.18, 0, 0]}>
        <boxGeometry args={[0.34, 0.32, 0.24]} />
        <meshStandardMaterial color="#1E2024" roughness={0.75} />
      </mesh>
    </group>
  );
}

/**
 * GLBScooter — Renders the loaded Blender 3D model with material color updates
 */
function GLBScooter({ gltfScene, paintColor, telemetry, showInternals }) {
  const groupRef = useRef();
  const prevSpeed = useRef(0);
  const currentLean = useRef(0);

  const speed = telemetry.speed || 0;
  const braking = (telemetry.brake_pressure || 0) > 0.5;

  const clonedScene = useMemo(() => {
    if (!gltfScene) return null;
    try {
      const clone = gltfScene.clone(true);
      clone.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return clone;
    } catch (e) {
      console.warn('[3D GLTF Clone Warning]', e);
      return gltfScene;
    }
  }, [gltfScene]);

  // Update body paint color dynamically
  useEffect(() => {
    if (!clonedScene) return;
    try {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          const matName = child.material.name || '';
          const objName = child.name || '';

          if (
            matName.includes('ScooterBody') ||
            matName.includes('Ivory') ||
            objName.includes('Apron') ||
            objName.includes('Fender') ||
            objName.includes('Body_Side') ||
            objName.includes('Body_Center')
          ) {
            child.material = child.material.clone();
            child.material.color = new THREE.Color(paintColor);
            child.material.roughness = 0.2;
            child.material.metalness = 0.15;
            child.material.needsUpdate = true;
          }

          if (matName.includes('LiIon') || matName.includes('BMS') || matName.includes('ECU') || matName.includes('PMSM')) {
            child.visible = showInternals;
          }
        }
      });
    } catch (err) {
      console.warn('[Paint Color Update]', err);
    }
  }, [paintColor, showInternals, clonedScene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const accel = speed > prevSpeed.current;
    let targetLean = 0;
    if (speed < 1) targetLean = 0;
    else if (braking) targetLean = 0.04;
    else if (accel) targetLean = -0.05;
    else targetLean = -0.02;

    currentLean.current += (targetLean - currentLean.current) * 0.08;
    groupRef.current.rotation.x = currentLean.current;

    if (speed > 1) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.015) * 0.008;
    } else {
      groupRef.current.position.y = Math.sin(Date.now() * 0.0015) * 0.004;
    }

    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh && (child.name.includes('Tire') || child.name.includes('Rim') || child.name.includes('Spoke') || child.name.includes('Hub'))) {
          child.rotation.x += (speed / 3.6) * delta * 5;
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

/**
 * Main ScooterModel with Suspense & GLTF error safety
 */
export default function ScooterModel({ paintColor = '#EDE9E1', telemetry = {}, showInternals = false }) {
  let gltf = null;
  try {
    gltf = useGLTF('/assets/scooter_rider.glb');
  } catch (err) {
    console.warn('[useGLTF Error fallback]', err);
  }

  if (gltf && gltf.scene) {
    return (
      <GLBScooter
        gltfScene={gltf.scene}
        paintColor={paintColor}
        telemetry={telemetry}
        showInternals={showInternals}
      />
    );
  }

  return (
    <ProceduralScooter
      paintColor={paintColor}
      speed={telemetry.speed || 0}
      braking={(telemetry.brake_pressure || 0) > 0.5}
    />
  );
}

// Preload GLB
try {
  useGLTF.preload('/assets/scooter_rider.glb');
} catch (_) {}
