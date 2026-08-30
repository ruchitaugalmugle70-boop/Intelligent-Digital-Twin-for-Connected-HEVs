import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

const PRESETS = {
  chase: { pos: [-3.2, 1.8, 4.2], target: [0.3, 1.1, 0] },
  side:  { pos: [-6.5, 1.5, 0.2], target: [0, 1.1, 0] },
  top:   { pos: [0, 12, 0.5],     target: [0, 0, 0] },
  front: { pos: [-0.5, 1.6, 6.0], target: [0, 1.0, 0] },
};

/**
 * CameraController — OrbitControls with smooth target damping
 * and preset position transitions (Chase, Side, Top, Front).
 */
export default function CameraController({ mode = 'chase' }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  useEffect(() => {
    const preset = PRESETS[mode] || PRESETS.chase;
    camera.position.set(...preset.pos);
    if (controlsRef.current) {
      controlsRef.current.target.set(...preset.target);
      controlsRef.current.update();
    }
  }, [mode, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={2.5}
      maxDistance={25}
      maxPolarAngle={Math.PI / 2.05}
      target={[0.3, 1.1, 0]}
    />
  );
}
