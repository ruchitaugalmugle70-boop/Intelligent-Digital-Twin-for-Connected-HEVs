import React, { Suspense } from 'react';
import RealisticScooter from './RealisticScooter';
import ProceduralScooterFallback from './ProceduralScooterFallback';
import InternalSystems from './InternalSystems';
import BlueprintView from './BlueprintView';
import RoadEnvironment from './RoadEnvironment';
import CityEnvironment from './CityEnvironment';
import Lighting from './Lighting';
import CameraController from './CameraController';

class GLBErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err) {
    console.warn('[GLB Error Catch - Using Procedural Fallback]', err);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * ViewManager — Coordinates rendering between:
 * - 3D Realistic View (GLB primary + Road + City)
 * - System View (Faded Body + Internal CAD modules)
 * - Blueprint CAD View (Technical orthographic view)
 */
export default function ViewManager({
  viewMode = '3d', // '3d', 'system', 'blueprint'
  cameraMode = 'chase',
  paintColor = '#EDE9E1',
  telemetry = {},
  steeringAngle = 0,
  onOpenCadModal,
}) {
  if (viewMode === 'blueprint') {
    return <BlueprintView onOpenCadModal={onOpenCadModal} />;
  }

  const speed = telemetry.speed || 0;
  const isSystemView = viewMode === 'system';

  return (
    <>
      <Lighting />
      <CameraController mode={cameraMode} />

      {/* Primary Realistic GLB Scooter with Fallback Guard */}
      <GLBErrorBoundary
        fallback={
          <ProceduralScooterFallback
            paintColor={paintColor}
            telemetry={telemetry}
          />
        }
      >
        <Suspense
          fallback={
            <ProceduralScooterFallback
              paintColor={paintColor}
              telemetry={telemetry}
            />
          }
        >
          <RealisticScooter
            paintColor={paintColor}
            telemetry={telemetry}
            isSystemView={isSystemView}
            steeringAngle={steeringAngle}
          />
        </Suspense>
      </GLBErrorBoundary>

      {/* Internal Engineering CAD Systems (Revealed in System View) */}
      <InternalSystems visible={isSystemView} telemetry={telemetry} />

      {/* Road & City Environments */}
      <RoadEnvironment speed={speed} />
      <CityEnvironment speed={speed} />
    </>
  );
}
