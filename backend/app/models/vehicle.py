from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    vin: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True
    )

    make: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    vehicle_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    registration_date: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="active"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )
