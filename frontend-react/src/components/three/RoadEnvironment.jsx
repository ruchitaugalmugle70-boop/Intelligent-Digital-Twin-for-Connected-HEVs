import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RoadEnvironment — Realistic highway road matching reference image:
 * - Multi-lane dark asphalt road with subtle texture
 * - Solid bright yellow line on left shoulder
 * - White dashed lane dividers scrolling with speed
 * - Concrete jersey barrier along right shoulder
 * - Lush flower beds & green bushes
 * - Street light poles
 */
export default function RoadEnvironment({ speed = 0 }) {
  const dashesRef = useRef([]);
  const flowerBedsRef = useRef([]);

  useFrame((_, delta) => {
    if (speed <= 0) return;
    const scrollRate = (speed / 3.6) * delta * 2.5;

    // Scroll white dashes
    dashesRef.current.forEach((dash) => {
      if (!dash) return;
      dash.position.z += scrollRate;
      if (dash.position.z > 80) dash.position.z -= 240;
    });

    // Scroll flower bed clusters
    flowerBedsRef.current.forEach((item) => {
      if (!item) return;
      item.position.z += scrollRate;
      if (item.position.z > 80) item.position.z -= 240;
    });
  });

  const flowerClusters = useMemo(() => {
    const items = [];
    for (let z = -120; z < 120; z += 4) {
      items.push({
        id: `flower-${z}`,
        z,
        scale: 0.75 + (Math.sin(z * 1.3) + 1) * 0.25,
        hasFlower: Math.sin(z * 2.1) > -0.2,
      });
    }
    return items;
  }, []);

  return (
    <group>
      {/* ── 1. ASPHALT ROAD SURFACE ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 300]} />
        <meshStandardMaterial color="#333742" roughness={0.88} metalness={0.1} />
      </mesh>

      {/* ── 2. ROAD MARKINGS ── */}
      {/* Solid Bright Yellow Line (Left Shoulder) */}
      <mesh position={[-3.8, 0.01, 0]}>
        <boxGeometry args={[0.22, 0.015, 300]} />
        <meshStandardMaterial color="#EAB308" emissive="#CA8A04" emissiveIntensity={0.2} roughness={0.4} />
      </mesh>

      {/* White Dashed Lane Markers */}
      {Array.from({ length: 24 }, (_, i) => (
        <mesh
          key={`dash-${i}`}
          ref={(el) => { dashesRef.current[i] = el; }}
          position={[0.8, 0.01, -120 + i * 10]}
        >
          <boxGeometry args={[0.18, 0.015, 4.5]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
        </mesh>
      ))}

      {/* White Right Road Shoulder Line */}
      <mesh position={[4.2, 0.01, 0]}>
        <boxGeometry args={[0.20, 0.015, 300]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.3} />
      </mesh>

      {/* ── 3. CONCRETE HIGHWAY BARRIER (JERSEY WALL) ── */}
      <group position={[4.8, 0.35, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.45, 0.70, 300]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.9} metalness={0.05} />
        </mesh>
        <mesh position={[-0.15, -0.22, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.25, 0.26, 300]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.36, 0]}>
          <boxGeometry args={[0.38, 0.08, 300]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.8} />
        </mesh>
      </group>

      {/* ── 4. FLOWER BEDS & GREEN BUSHES ── */}
      {flowerClusters.map((cluster, i) => (
        <group
          key={cluster.id}
          ref={(el) => { flowerBedsRef.current[i] = el; }}
          position={[5.6, 0.25, cluster.z]}
        >
          <mesh position={[0, 0.15, 0]} castShadow scale={[0.9 * cluster.scale, 0.65 * cluster.scale, 1.8]}>
            <sphereGeometry args={[0.5, 12, 8]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
          <mesh position={[0.2, 0.28, 0.3]} castShadow scale={[0.75 * cluster.scale, 0.55 * cluster.scale, 1.4]}>
            <sphereGeometry args={[0.45, 10, 8]} />
            <meshStandardMaterial color="#15803D" roughness={0.8} />
          </mesh>

          {cluster.hasFlower && (
            <mesh position={[-0.1, 0.35, 0.1]} scale={[0.8, 0.45, 1.6]}>
              <sphereGeometry args={[0.4, 8, 6]} />
              <meshStandardMaterial color="#F43F5E" emissive="#BE123C" emissiveIntensity={0.25} roughness={0.7} />
            </mesh>
          )}
        </group>
      ))}

      {/* ── 5. STREET LIGHT POLES ── */}
      {Array.from({ length: 8 }, (_, i) => {
        const z = -100 + i * 32;
        return (
          <group key={`lamp-${i}`} position={[6.8, 0, z]}>
            <mesh position={[0, 3.2, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.09, 6.5, 12]} />
              <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[-0.8, 6.2, 0]} rotation={[0, 0, Math.PI / 3.5]}>
              <cylinderGeometry args={[0.04, 0.05, 2.2, 8]} />
              <meshStandardMaterial color="#64748B" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[-1.6, 6.6, 0]}>
              <boxGeometry args={[0.45, 0.08, 0.22]} />
              <meshStandardMaterial color="#F8FAFC" emissive="#FEF08A" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0.2, 6.6, 0]} rotation={[0.4, 0, 0]}>
              <boxGeometry args={[0.6, 0.04, 0.8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        );
      })}

      {/* Left highway shoulder verge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-12, -0.02, 0]} receiveShadow>
        <planeGeometry args={[12, 300]} />
        <meshStandardMaterial color="#475569" roughness={1} />
      </mesh>
    </group>
  );
}
