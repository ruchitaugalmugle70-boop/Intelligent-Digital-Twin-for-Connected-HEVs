"""
Vehicles API Router
===================
Handles vehicle registration and retrieval.
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleResponse

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post("/", response_model=VehicleResponse, status_code=201)
def register_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    """Register a new vehicle in the Digital Twin platform."""
    existing = db.query(Vehicle).filter(Vehicle.vin == payload.vin).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Vehicle with VIN '{payload.vin}' already exists"
        )
    vehicle = Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/", response_model=List[VehicleResponse])
def list_vehicles(db: Session = Depends(get_db)):
    """List all registered vehicles."""
    return db.query(Vehicle).all()


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get a single vehicle by ID."""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle
