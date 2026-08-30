import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * ProceduralScooterFallback — Used ONLY as a fallback if the realistic GLB model
 * fails to load or is not accessible.
 */
export default function ProceduralScooterFallback({
  paintColor = '#EDE9E1',
  telemetry = {},
}) {
  const groupRef = useRef();
  const speed = telemetry.speed || 0;

  useFrame(() => {
    if (groupRef.current && speed > 1) {
      groupRef.current.position.y = Math.sin(Date.now() * 0.015) * 0.008;
    }
  });

  return (
    <group ref={groupRef} scale={2.8} rotation={[0, -0.6, 0]}>
      {/* Wheels */}
      <mesh position={[0, 0.24, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.055, 16, 32]} />
        <meshStandardMaterial color="#111215" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.24, -0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.06, 16, 32]} />
        <meshStandardMaterial color="#111215" roughness={0.9} />
      </mesh>
      {/* Apron & Body */}
      <mesh position={[0, 0.65, 0.35]} scale={[1.1, 0.8, 1.4]}>
        <sphereGeometry args={[0.32, 24, 16]} />
        <meshStandardMaterial color={paintColor} roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.95, 0.38]}>
        <boxGeometry args={[0.5, 0.1, 0.1]} />
        <meshStandardMaterial color="#181A20" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.26, -0.05]}>
        <boxGeometry args={[0.42, 0.06, 0.55]} />
        <meshStandardMaterial color="#181A20" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.46, -0.32]}>
        <boxGeometry args={[0.32, 0.3, 0.62]} />
        <meshStandardMaterial color={paintColor} roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.65, -0.28]}>
        <boxGeometry args={[0.3, 0.1, 0.68]} />
        <meshStandardMaterial color="#141416" roughness={0.85} />
      </mesh>
    </group>
  );
}
