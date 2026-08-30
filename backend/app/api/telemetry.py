"""
Telemetry API Router
====================
Handles ingestion of incoming vehicle telemetry data and serves
the latest / historical telemetry for the dashboard.
"""

from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.telemetry import Telemetry
from app.schemas.telemetry import TelemetryIngest, TelemetryResponse

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.post("/ingest", response_model=TelemetryResponse, status_code=201)
def ingest_telemetry(payload: TelemetryIngest, db: Session = Depends(get_db)):
    """
    Receive telemetry data from the vehicle TCU or simulator.
    Stores the reading in the database and returns the saved record.
    """
    record = Telemetry(
        vehicle_id=payload.vehicle_id,
        timestamp=payload.timestamp,
        battery_voltage=payload.battery_voltage,
        battery_current=payload.battery_current,
        battery_soc=payload.battery_soc,
        battery_temperature=payload.battery_temperature,
        motor_rpm=payload.motor_rpm,
        motor_temperature=payload.motor_temperature,
        motor_torque=payload.motor_torque,
        controller_temperature=payload.controller_temperature,
        controller_status=payload.controller_status,
        brake_pressure=payload.brake_pressure,
        brake_temperature=payload.brake_temperature,
        speed=payload.speed,
        odometer=payload.odometer,
        ambient_temperature=payload.ambient_temperature,
        gps_latitude=payload.gps_latitude,
        gps_longitude=payload.gps_longitude,
        communication_status=payload.communication_status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/latest/{vehicle_id}", response_model=TelemetryResponse)
def get_latest_telemetry(vehicle_id: int, db: Session = Depends(get_db)):
    """
    Return the most recent telemetry record for a given vehicle.
    Used by the 3D dashboard to get the current vehicle state.
    """
    record = (
        db.query(Telemetry)
        .filter(Telemetry.vehicle_id == vehicle_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No telemetry found for vehicle {vehicle_id}"
        )
    return record


@router.get("/history/{vehicle_id}", response_model=List[TelemetryResponse])
def get_telemetry_history(
    vehicle_id: int,
    limit: int = Query(default=100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Return the last N telemetry records for a given vehicle.
    Used for trend charts and simulation input data.
    """
    records = (
        db.query(Telemetry)
        .filter(Telemetry.vehicle_id == vehicle_id)
        .order_by(Telemetry.timestamp.desc())
        .limit(limit)
        .all()
    )
    return records
