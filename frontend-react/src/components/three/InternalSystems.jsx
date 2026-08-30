import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * InternalSystems — Renders internal engineering CAD subsystems for System View:
 * - 72V Li-Ion Battery Pack (Green)
 * - BMS Intelligent Monitoring Module (Yellow)
 * - ECU Inverter Controller (Blue)
 * - PMSM Hub Motor (Red)
 * - Suspension Springs (Purple)
 * - High-Voltage Wiring Harness (Orange)
 */
export default function InternalSystems({
  visible = false,
  telemetry = {},
}) {
  const groupRef = useRef();

  if (!visible) return null;

  const motorTemp = telemetry.motor_temperature || 63;
  const batterySoc = telemetry.battery_soc || 82;
  const isHot = motorTemp > 75;

  return (
    <group ref={groupRef} position={[0, 0, 0]} rotation={[0, -0.6, 0]} scale={2.8}>
      {/* ── 1. BATTERY PACK (Under Floorboard / Tunnel) ── */}
      <group position={[0, 0.42, -0.15]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.16, 0.44]} />
          <meshStandardMaterial
            color="#10B981"
            emissive="#059669"
            emissiveIntensity={batterySoc > 20 ? 0.6 : 0.2}
            roughness={0.25}
            metalness={0.6}
          />
        </mesh>
        {/* Battery Cell Rows */}
        {[-0.08, 0, 0.08].map((x, i) => (
          <mesh key={`cell-${i}`} position={[x, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.38, 16]} />
            <meshStandardMaterial color="#34D399" metalness={0.8} roughness={0.2} />
          </mesh>
        ))}
      </group>

      {/* ── 2. BMS MODULE (Top of Battery) ── */}
      <mesh position={[0, 0.54, -0.05]} castShadow>
        <boxGeometry args={[0.16, 0.04, 0.12]} />
        <meshStandardMaterial
          color="#F59E0B"
          emissive="#D97706"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* ── 3. ECU INVERTER CONTROLLER (Under Seat) ── */}
      <mesh position={[0, 0.42, -0.38]} castShadow>
        <boxGeometry args={[0.18, 0.10, 0.16]} />
        <meshStandardMaterial
          color="#0284C7"
          emissive="#0369A1"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* ── 4. PMSM HUB MOTOR (Rear Wheel Hub) ── */}
      <mesh position={[0, 0.24, -0.58]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.12, 32]} />
        <meshStandardMaterial
          color={isHot ? '#EF4444' : '#DC2626'}
          emissive={isHot ? '#EF4444' : '#991B1B'}
          emissiveIntensity={isHot ? 1.5 : 0.6}
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* ── 5. REAR SUSPENSION SHOCK SPRINGS ── */}
      {[-1, 1].map((side) => (
        <group key={`susp-${side}`} position={[side * 0.12, 0.42, -0.48]} rotation={[0.4, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.016, 0.016, 0.28, 12]} />
            <meshStandardMaterial
              color="#A855F7"
              emissive="#7E22CE"
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={j} position={[0, -0.1 + j * 0.06, 0]}>
              <torusGeometry args={[0.022, 0.005, 8, 16]} />
              <meshStandardMaterial color="#D8B4FE" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── 6. HIGH-VOLTAGE WIRING HARNESS ── */}
      <mesh position={[0.06, 0.46, -0.22]} rotation={[Math.PI / 2, 0, 0.15]}>
        <cylinderGeometry args={[0.009, 0.009, 0.55, 12]} />
        <meshStandardMaterial
          color="#F97316"
          emissive="#C2410C"
          emissiveIntensity={0.5}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  );
}
