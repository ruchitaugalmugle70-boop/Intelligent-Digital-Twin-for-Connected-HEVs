"""
Telemetry Pydantic Schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TelemetryIngest(BaseModel):
    """Schema for incoming telemetry from vehicle / simulator."""

    vehicle_id: int
    timestamp: datetime

    # Battery
    battery_voltage: Optional[float] = None
    battery_current: Optional[float] = None
    battery_soc: Optional[float] = Field(None, ge=0, le=100)
    battery_temperature: Optional[float] = None

    # Motor
    motor_rpm: Optional[float] = Field(None, ge=0)
    motor_temperature: Optional[float] = None
    motor_torque: Optional[float] = None

    # Controller
    controller_temperature: Optional[float] = None
    controller_status: Optional[str] = None

    # Braking
    brake_pressure: Optional[float] = Field(None, ge=0)
    brake_temperature: Optional[float] = None

    # Vehicle
    speed: Optional[float] = Field(None, ge=0)
    odometer: Optional[float] = Field(None, ge=0)
    ambient_temperature: Optional[float] = None

    # GPS
    gps_latitude: Optional[float] = Field(None, ge=-90, le=90)
    gps_longitude: Optional[float] = Field(None, ge=-180, le=180)

    # Comms
    communication_status: Optional[str] = None


class TelemetryResponse(BaseModel):
    """Schema for outgoing telemetry data to dashboard."""

    id: int
    vehicle_id: int
    timestamp: datetime

    battery_voltage: Optional[float] = None
    battery_current: Optional[float] = None
    battery_soc: Optional[float] = None
    battery_temperature: Optional[float] = None

    motor_rpm: Optional[float] = None
    motor_temperature: Optional[float] = None
    motor_torque: Optional[float] = None

    controller_temperature: Optional[float] = None
    controller_status: Optional[str] = None

    brake_pressure: Optional[float] = None
    brake_temperature: Optional[float] = None

    speed: Optional[float] = None
    odometer: Optional[float] = None
    ambient_temperature: Optional[float] = None

    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None

    communication_status: Optional[str] = None

    class Config:
        from_attributes = True
