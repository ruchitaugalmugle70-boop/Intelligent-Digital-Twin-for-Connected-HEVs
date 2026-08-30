"""
WebSocket Manager
=================
Provides real-time live telemetry push to connected dashboard clients.
When new telemetry arrives via POST /telemetry/ingest, it is broadcast
to all WebSocket clients watching that vehicle.
"""

import json
from typing import Dict, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """Manages active WebSocket connections per vehicle."""

    def __init__(self):
        # vehicle_id → list of active WebSocket connections
        self._connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, vehicle_id: int, websocket: WebSocket):
        await websocket.accept()
        if vehicle_id not in self._connections:
            self._connections[vehicle_id] = []
        self._connections[vehicle_id].append(websocket)

    def disconnect(self, vehicle_id: int, websocket: WebSocket):
        if vehicle_id in self._connections:
            try:
                self._connections[vehicle_id].remove(websocket)
            except ValueError:
                pass

    async def broadcast(self, vehicle_id: int, data: dict):
        """Push a message to all clients watching this vehicle."""
        if vehicle_id not in self._connections:
            return
        dead = []
        for ws in self._connections[vehicle_id]:
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(vehicle_id, ws)

    def active_count(self, vehicle_id: int) -> int:
        return len(self._connections.get(vehicle_id, []))


# Singleton manager — imported by telemetry router to broadcast on ingest
manager = ConnectionManager()


@router.websocket("/ws/vehicle/{vehicle_id}")
async def vehicle_websocket(vehicle_id: int, websocket: WebSocket):
    """
    WebSocket endpoint — dashboard connects here to receive live telemetry.
    The server pushes data the instant new telemetry is ingested.
    """
    await manager.connect(vehicle_id, websocket)
    try:
        await websocket.send_text(json.dumps({
            "type": "connected",
            "vehicle_id": vehicle_id,
            "message": "Live telemetry stream connected"
        }))
        # Keep connection alive — wait for client to disconnect
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(vehicle_id, websocket)
