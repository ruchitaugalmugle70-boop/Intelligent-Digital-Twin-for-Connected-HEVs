"""
Simulation Pydantic Schemas
"""

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class DegradationConfig(BaseModel):
    subsystem: Literal["battery", "motor", "braking", "controller"] = "battery"
    horizon_hours: int = Field(500, ge=1, le=10000)


class MaintenanceConfig(BaseModel):
    health_threshold: float = Field(0.30, ge=0.0, le=1.0)
    lookahead_days: int = Field(365, ge=1, le=3650)


class TrendsConfig(BaseModel):
    trend_window_hours: int = Field(72, ge=1, le=720)
    projection_days: int = Field(30, ge=1, le=365)


class HypotheticalConfig(BaseModel):
    ambient_temperature: Optional[float] = None
    daily_km: Optional[float] = Field(None, ge=0)
    load_factor: Optional[float] = Field(None, ge=0.0, le=1.0)
    horizon_days: int = Field(90, ge=1, le=3650)


class SimulationRequest(BaseModel):
    vehicle_id: int
    scenario: Literal["degradation", "maintenance", "trends", "hypothetical"]
    config: Dict[str, Any] = {}


class SimulationDataPoint(BaseModel):
    hour: float
    health_score: float
    rul_hours: Optional[float] = None


class MaintenanceEvent(BaseModel):
    subsystem: str
    predicted_date: str
    days_remaining: int
    urgency: Literal["ok", "watch", "soon", "urgent"]
    current_health: float


class SimulationResponse(BaseModel):
    vehicle_id: int
    scenario: str
    ran_at: datetime
    subsystem: Optional[str] = None
    data_points: Optional[List[SimulationDataPoint]] = None
    maintenance_events: Optional[List[MaintenanceEvent]] = None
    trends: Optional[Dict[str, Any]] = None
    hypothetical_summary: Optional[Dict[str, Any]] = None
    message: str = "Simulation completed successfully"
