import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './useWebSocket';
import { DEFAULT_TELEMETRY } from '../utils/constants';

/**
 * useTelemetry — combines WebSocket data with simulated fallback.
 * Returns { telemetry, isConnected, chartData }.
 */
export function useTelemetry() {
  const { isConnected, lastMessage } = useWebSocket();
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [chartData, setChartData] = useState({
    labels: [],
    voltage: [],
    current: [],
    speed: [],
  });
  const simRef = useRef(null);

  // Apply incoming WebSocket data
  useEffect(() => {
    if (lastMessage) {
      setTelemetry(prev => ({ ...prev, ...lastMessage }));
    }
  }, [lastMessage]);

  // Simulated fallback when WebSocket is disconnected
  useEffect(() => {
    simRef.current = setInterval(() => {
      setTelemetry(prev => {
        const n = (Math.random() - 0.5) * 2;
        const speed = Math.max(20, Math.min(80, prev.speed + n));
        const motorTemp = Math.max(55, Math.min(75, prev.motor_temperature + (speed > 60 ? 0.2 : -0.1)));
        const soc = Math.max(20, prev.battery_soc - 0.01);
        const voltage = 72 + Math.sin(Date.now() * 0.001) * 0.8;
        const current = 10 + (speed / 5);

        return {
          ...prev,
          speed,
          motor_temperature: motorTemp,
          battery_soc: soc,
          battery_voltage: voltage,
          battery_current: current,
          motor_rpm: speed * 58,
          motor_torque: 8 + speed * 0.2,
          controller_temperature: 40 + speed * 0.1,
          health_score: 92,
          gps_latitude: 18.5204 + Math.sin(Date.now() * 0.0002) * 0.005,
          gps_longitude: 73.8567 + Math.cos(Date.now() * 0.0002) * 0.005,
        };
      });
    }, 2000);

    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  // Update chart data when telemetry changes
  useEffect(() => {
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    setChartData(prev => {
      const labels = [...prev.labels, timestamp];
      const voltage = [...prev.voltage, telemetry.battery_voltage];
      const current = [...prev.current, telemetry.battery_current];
      const speed = [...prev.speed, telemetry.speed];

      // Keep last 10 data points
      if (labels.length > 10) {
        labels.shift();
        voltage.shift();
        current.shift();
        speed.shift();
      }

      return { labels, voltage, current, speed };
    });
  }, [telemetry.speed]); // eslint-disable-line react-hooks/exhaustive-deps

  return { telemetry, isConnected, chartData };
}
