"""
Vehicle Pydantic Schemas
"""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class VehicleCreate(BaseModel):
    vin: str
    make: str
    model: str
    year: int
    vehicle_type: str
    registration_date: Optional[date] = None
    status: str = "active"


class VehicleResponse(BaseModel):
    id: int
    vin: str
    make: str
    model: str
    year: int
    vehicle_type: str
    registration_date: Optional[date] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
