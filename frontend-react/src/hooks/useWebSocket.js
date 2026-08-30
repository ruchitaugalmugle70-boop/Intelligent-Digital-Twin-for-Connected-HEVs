import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_BASE, VEHICLE_ID } from '../utils/constants';

/**
 * useWebSocket — manages WebSocket connection with auto-reconnect.
 * Returns { isConnected, lastMessage }.
 */
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_BASE}/ws/vehicle/${VEHICLE_ID}`);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'connected') {
            setLastMessage(data);
          }
        } catch (_) { /* ignore parse errors */ }
      };

      ws.onerror = () => {
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        // Auto-reconnect after 5s
        reconnectTimer.current = setTimeout(connect, 5000);
      };

      wsRef.current = ws;
    } catch (_) {
      setIsConnected(false);
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  return { isConnected, lastMessage };
}
