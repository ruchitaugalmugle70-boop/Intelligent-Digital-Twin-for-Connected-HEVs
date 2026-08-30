import sys
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.telemetry import Telemetry
from app.schemas.simulation import (
    DegradationConfig,
    HypotheticalConfig,
    MaintenanceConfig,
    TrendsConfig,
    SimulationResponse,
    SimulationDataPoint,
    MaintenanceEvent,
)

# ── Ensure project root (parent of 'backend/') is on sys.path ────────
# This allows importing the top-level 'simulation' package.
_project_root = Path(__file__).resolve().parents[3]   # backend/app/api/ → project root
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from simulation.scenarios import (
    component_degradation,
    maintenance_prediction,
    operational_trends,
    hypothetical,
)

router = APIRouter(prefix="/simulation", tags=["Simulation"])


# ─── Helper ─────────────────────────────────────────────────────────────────

def _fetch_latest_telemetry(vehicle_id: int, db: Session) -> Dict[str, Any]:
    """Fetch most recent telemetry as a plain dict for scenario engines."""
    record = (
        db.query(Telemetry)
        .filter(Telemetry.vehicle_id == vehicle_id)
        .order_by(Telemetry.timestamp.desc())
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=404,
            detail=f"No telemetry data found for vehicle {vehicle_id}. "
                   "Ensure the simulator is running."
        )
    return {col.name: getattr(record, col.name) for col in record.__table__.columns}


def _default_health_scores() -> Dict[str, float]:
    """Default health scores when SubsystemHealth table has no records yet."""
    return {
        "battery": 0.85,
        "motor": 0.80,
        "braking": 0.75,
        "controller": 0.92,
    }


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/degradation", response_model=SimulationResponse)
def run_degradation(config: DegradationConfig, db: Session = Depends(get_db)):
    """
    Project subsystem health degradation over a future time horizon.
    Returns a time-series of health_score and RUL values.
    """
    telemetry = _fetch_latest_telemetry(1, db)  # default vehicle 1
    health_scores = _default_health_scores()

    data_points_raw = component_degradation.run(
        subsystem=config.subsystem,
        horizon_hours=config.horizon_hours,
        telemetry=telemetry,
        current_health=health_scores.get(config.subsystem, 0.85),
    )

    # Sample every 10 hours to keep response size reasonable
    step = max(1, len(data_points_raw) // 100)
    sampled = data_points_raw[::step]

    return SimulationResponse(
        vehicle_id=1,
        scenario="degradation",
        ran_at=datetime.now(timezone.utc),
        subsystem=config.subsystem,
        data_points=[SimulationDataPoint(**p) for p in sampled],
        message=f"Degradation projection for {config.subsystem} over {config.horizon_hours} hours",
    )


@router.post("/maintenance", response_model=SimulationResponse)
def run_maintenance(config: MaintenanceConfig, db: Session = Depends(get_db)):
    """
    Predict when each subsystem will need maintenance based on current health.
    Returns a sorted maintenance schedule with urgency levels.
    """
    telemetry = _fetch_latest_telemetry(1, db)
    health_scores = _default_health_scores()

    events_raw = maintenance_prediction.run(
        telemetry=telemetry,
        health_scores=health_scores,
        threshold=config.health_threshold,
        lookahead_days=config.lookahead_days,
    )

    return SimulationResponse(
        vehicle_id=1,
        scenario="maintenance",
        ran_at=datetime.now(timezone.utc),
        maintenance_events=[MaintenanceEvent(**e) for e in events_raw],
        message=f"Maintenance prediction with threshold {config.health_threshold:.0%}",
    )


@router.post("/trends", response_model=SimulationResponse)
def run_trends(config: TrendsConfig, db: Session = Depends(get_db)):
    """
    Analyse historical telemetry trends and project forward.
    Returns trend direction and projected values for key metrics.
    """
    records = (
        db.query(Telemetry)
        .filter(Telemetry.vehicle_id == 1)
        .order_by(Telemetry.timestamp.desc())
        .limit(config.trend_window_hours * 20)   # ~20 records/hour at 3s interval
        .all()
    )

    history = [
        {col.name: getattr(r, col.name) for col in r.__table__.columns}
        for r in records
    ]

    trends_result = operational_trends.run(
        history=history,
        projection_days=config.projection_days,
    )

    return SimulationResponse(
        vehicle_id=1,
        scenario="trends",
        ran_at=datetime.now(timezone.utc),
        trends=trends_result,
        message=f"Operational trend analysis projected {config.projection_days} days ahead",
    )


@router.post("/hypothetical", response_model=SimulationResponse)
def run_hypothetical(config: HypotheticalConfig, db: Session = Depends(get_db)):
    """
    Run a what-if scenario with overridden operating conditions.
    Returns projected degradation curves and maintenance impact.
    """
    telemetry = _fetch_latest_telemetry(1, db)
    health_scores = _default_health_scores()

    result = hypothetical.run(
        base_telemetry=telemetry,
        health_scores=health_scores,
        ambient_temperature=config.ambient_temperature,
        daily_km=config.daily_km,
        load_factor=config.load_factor,
        horizon_days=config.horizon_days,
    )

    # Build summary data points from battery curve
    data_points = [
        SimulationDataPoint(
            hour=p["hour"],
            health_score=p["health_score"],
            rul_hours=p.get("rul_hours"),
        )
        for p in result.get("battery_curve", [])
    ]

    return SimulationResponse(
        vehicle_id=1,
        scenario="hypothetical",
        ran_at=datetime.now(timezone.utc),
        subsystem="all",
        data_points=data_points,
        hypothetical_summary=result,
        message=f"What-if simulation over {config.horizon_days} days",
    )
