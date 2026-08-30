import { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';

// Layout
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Dashboard Overview
import MetricStrip from './components/dashboard/MetricStrip';
import SubsystemStatus from './components/dashboard/SubsystemStatus';
import AIInsights from './components/dashboard/AIInsights';
import AlertsPanel from './components/dashboard/AlertsPanel';
import TelemetryChart from './components/dashboard/TelemetryChart';
import LocationMap from './components/dashboard/LocationMap';
import FeatureCards from './components/dashboard/FeatureCards';
import ScooterScene from './components/three/ScooterScene';

// Views for Tabs
import TelemetryView from './components/views/TelemetryView';
import VehicleTwinView from './components/views/VehicleTwinView';
import AIInsightsView from './components/views/AIInsightsView';
import DiagnosticsView from './components/views/DiagnosticsView';
import MaintenanceView from './components/views/MaintenanceView';
import ReportsView from './components/views/ReportsView';
import AlertsView from './components/views/AlertsView';
import SettingsView from './components/views/SettingsView';

// Modals
import CadModal from './components/modals/CadModal';
import SimulationModal from './components/modals/SimulationModal';

export default function App() {
  const { telemetry, isConnected, chartData } = useTelemetry();
  const [activeTab, setActiveTab] = useState('overview');
  const [cadModalOpen, setCadModalOpen] = useState(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulatedOverrides, setSimulatedOverrides] = useState({});

  // Merge simulated live drive controls with base telemetry
  const activeTelemetry = {
    ...telemetry,
    ...simulatedOverrides,
  };

  const handleApplySimulation = (overrides) => {
    setSimulatedOverrides(prev => ({ ...prev, ...overrides }));
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[var(--color-bg-main)]">
      {/* Left Sidebar with Active Tab Controller */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenSimulation={() => setSimulationModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isConnected={isConnected}
          onOpenSimulation={() => setSimulationModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 min-w-0">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4 fade-in">
              <MetricStrip telemetry={activeTelemetry} />

              <div className="grid grid-cols-[1.35fr_1fr] gap-4">
                <ScooterScene
                  telemetry={activeTelemetry}
                  onOpenCadModal={() => setCadModalOpen(true)}
                  onOpenSimulation={() => setSimulationModalOpen(true)}
                />
                <LocationMap telemetry={activeTelemetry} />
              </div>

              <div className="grid grid-cols-[1.25fr_0.9fr_1fr_1fr] gap-4">
                <TelemetryChart chartData={chartData} />
                <SubsystemStatus />
                <AIInsights telemetry={activeTelemetry} />
                <AlertsPanel />
              </div>

              <FeatureCards />
            </div>
          )}

          {/* TAB 2: LIVE TELEMETRY */}
          {activeTab === 'telemetry' && (
            <TelemetryView telemetry={activeTelemetry} chartData={chartData} />
          )}

          {/* TAB 3: VEHICLE TWIN */}
          {activeTab === 'twin' && (
            <VehicleTwinView
              telemetry={activeTelemetry}
              onOpenCadModal={() => setCadModalOpen(true)}
              onOpenSimulation={() => setSimulationModalOpen(true)}
            />
          )}

          {/* TAB 4: AI INSIGHTS */}
          {activeTab === 'ai' && (
            <AIInsightsView telemetry={activeTelemetry} />
          )}

          {/* TAB 5: DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <DiagnosticsView />
          )}

          {/* TAB 6: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <MaintenanceView />
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {/* TAB 8: ALERTS */}
          {activeTab === 'alerts' && (
            <AlertsView />
          )}

          {/* TAB 9: SETTINGS */}
          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Modals */}
      <CadModal isOpen={cadModalOpen} onClose={() => setCadModalOpen(false)} />
      <SimulationModal
        isOpen={simulationModalOpen}
        onClose={() => setSimulationModalOpen(false)}
        telemetry={activeTelemetry}
        onApplySimulation={handleApplySimulation}
      />
    </div>
  );
}
