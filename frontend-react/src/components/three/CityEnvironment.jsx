import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * CityEnvironment — Realistic optimized highway surroundings:
 * - Green roadside trees with layered canopies
 * - Modern city skyline towers
 * - Daylight sky dome with atmospheric perspective
 */
export default function CityEnvironment({ speed = 0 }) {
  const treesRef = useRef([]);
  const buildingsRef = useRef([]);

  useFrame((_, delta) => {
    if (speed <= 0) return;
    const scrollRate = (speed / 3.6) * delta * 2.5;

    treesRef.current.forEach((tree) => {
      if (!tree) return;
      tree.position.z += scrollRate;
      if (tree.position.z > 80) tree.position.z -= 240;
    });

    buildingsRef.current.forEach((bld) => {
      if (!bld) return;
      bld.position.z += scrollRate * 0.35;
      if (bld.position.z > 120) bld.position.z -= 300;
    });
  });

  const trees = useMemo(() => {
    const items = [];
    for (let z = -120; z < 120; z += 12) {
      const scale = 0.85 + (Math.sin(z * 1.7) + 1) * 0.25;
      items.push({
        id: `tree-${z}`,
        x: 8.5 + (Math.sin(z * 2.5) + 1) * 0.8,
        z,
        scale,
        trunkH: 2.2 * scale,
      });
    }
    return items;
  }, []);

  const skyscrapers = useMemo(() => {
    const items = [];
    const colors = ['#94A3B8', '#CBD5E1', '#E2E8F0', '#B0C4DE', '#A0B4C8'];
    for (let i = 0; i < 16; i++) {
      const z = -140 + i * 18;
      const x = -35 - (i % 3) * 12;
      const h = 25 + Math.abs(Math.sin(i * 3.7)) * 45;
      const w = 8 + (i % 4) * 3;
      const d = 8 + (i % 3) * 4;
      const color = colors[i % colors.length];
      items.push({ id: `tower-${i}`, x, z, h, w, d, color });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Daylight Sky Dome */}
      <mesh>
        <sphereGeometry args={[350, 32, 16]} />
        <meshBasicMaterial color="#7BA7D7" side={THREE.BackSide} />
      </mesh>

      {/* Atmospheric Horizon Layer */}
      <mesh position={[0, -20, 0]}>
        <sphereGeometry args={[320, 24, 12]} />
        <meshBasicMaterial color="#C5DBF2" side={THREE.BackSide} transparent opacity={0.65} />
      </mesh>

      {/* Roadside Trees */}
      {trees.map((t, i) => (
        <group
          key={t.id}
          ref={(el) => { treesRef.current[i] = el; }}
          position={[t.x, 0, t.z]}
        >
          <mesh position={[0, t.trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.22 * t.scale, 0.32 * t.scale, t.trunkH, 8]} />
            <meshStandardMaterial color="#5C3D2E" roughness={0.9} />
          </mesh>
          <mesh position={[0, t.trunkH + 0.9 * t.scale, 0]} castShadow scale={[1.4 * t.scale, 1.1 * t.scale, 1.4 * t.scale]}>
            <sphereGeometry args={[1.2, 12, 8]} />
            <meshStandardMaterial color="#1E5E2F" roughness={0.8} />
          </mesh>
          <mesh position={[0.2 * t.scale, t.trunkH + 1.8 * t.scale, 0.1 * t.scale]} castShadow scale={[1.1 * t.scale, 1.2 * t.scale, 1.1 * t.scale]}>
            <sphereGeometry args={[1.0, 10, 6]} />
            <meshStandardMaterial color="#2E7D32" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* Distant Skyline Skyscrapers */}
      {skyscrapers.map((b, i) => (
        <group
          key={b.id}
          ref={(el) => { buildingsRef.current[i] = el; }}
          position={[b.x, b.h / 2, b.z]}
        >
          <mesh castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={b.color} roughness={0.4} metalness={0.6} />
          </mesh>
          {Array.from({ length: 4 }, (_, k) => (
            <mesh key={k} position={[0, -b.h * 0.3 + k * (b.h * 0.16), b.d * 0.51]}>
              <planeGeometry args={[b.w * 0.85, 1.2]} />
              <meshBasicMaterial color="#E0F2FE" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
