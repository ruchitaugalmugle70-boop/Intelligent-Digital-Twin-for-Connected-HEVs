from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, Enum as SQLEnum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class SubsystemType(str, Enum):
    BATTERY = "battery"
    MOTOR = "motor"
    CONTROLLER = "controller"
    BRAKING = "braking"


class SubsystemHealth(Base):
    __tablename__ = "subsystem_health"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        index=True
    )

    subsystem_type: Mapped[SubsystemType] = mapped_column(
        SQLEnum(SubsystemType),
        nullable=False,
        index=True
    )

    health_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )

    remaining_useful_life_hours: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )

    degradation_rate: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )

    confidence: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True
    )

    source_system: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
