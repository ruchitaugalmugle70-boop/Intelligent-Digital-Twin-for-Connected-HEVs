import React from 'react';

/**
 * Lighting — Realistic studio/outdoor daylight lighting with soft shadows,
 * key sun light, sky fill, and subtle rim accents.
 */
export default function Lighting() {
  return (
    <>
      {/* Soft warm ambient daylight */}
      <ambientLight intensity={1.1} color="#FFFFFF" />

      {/* Main directional sun light */}
      <directionalLight
        position={[-10, 18, 10]}
        intensity={2.2}
        color="#FFFDF5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-far={60}
        shadow-camera-near={0.5}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />

      {/* Sky fill bounce light */}
      <directionalLight
        position={[10, 12, -5]}
        intensity={0.65}
        color="#BAE6FD"
      />

      {/* Rim light on scooter silhouette */}
      <pointLight
        position={[0, 4, -8]}
        intensity={1.2}
        color="#E0F2FE"
        distance={20}
      />

      {/* Ground bounce / road reflection light */}
      <directionalLight
        position={[0, -5, 5]}
        intensity={0.3}
        color="#CBD5E1"
      />

      {/* Realistic hemisphere ambient blend */}
      <hemisphereLight args={['#7BA7D7', '#333742', 0.65]} />
    </>
  );
}
