from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Telemetry(Base):
    __tablename__ = "telemetry"

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

    battery_voltage: Mapped[Optional[float]] = mapped_column(Float)
    battery_current: Mapped[Optional[float]] = mapped_column(Float)
    battery_soc: Mapped[Optional[float]] = mapped_column(Float)
    battery_temperature: Mapped[Optional[float]] = mapped_column(Float)

    motor_rpm: Mapped[Optional[float]] = mapped_column(Float)
    motor_temperature: Mapped[Optional[float]] = mapped_column(Float)
    motor_torque: Mapped[Optional[float]] = mapped_column(Float)

    controller_temperature: Mapped[Optional[float]] = mapped_column(Float)
    controller_status: Mapped[Optional[str]] = mapped_column(String(50))

    brake_pressure: Mapped[Optional[float]] = mapped_column(Float)
    brake_temperature: Mapped[Optional[float]] = mapped_column(Float)

    speed: Mapped[Optional[float]] = mapped_column(Float)
    odometer: Mapped[Optional[float]] = mapped_column(Float)

    ambient_temperature: Mapped[Optional[float]] = mapped_column(Float)

    gps_latitude: Mapped[Optional[float]] = mapped_column(Float)
    gps_longitude: Mapped[Optional[float]] = mapped_column(Float)

    communication_status: Mapped[Optional[str]] = mapped_column(
        String(50)
    )