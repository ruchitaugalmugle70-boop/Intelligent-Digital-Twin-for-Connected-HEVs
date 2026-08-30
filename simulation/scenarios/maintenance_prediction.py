"""
Maintenance Prediction Scenario
=================================
Predicts when each subsystem will breach a health threshold
and generates a prioritised maintenance schedule.

Returns a list of maintenance events with urgency levels.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

from simulation.models import battery, motor, braking, controller


def _urgency(days_remaining: int) -> str:
    if days_remaining <= 7:
        return "urgent"
    elif days_remaining <= 30:
        return "soon"
    elif days_remaining <= 90:
        return "watch"
    return "ok"


def run(
    telemetry: Dict[str, Any],
    health_scores: Dict[str, float],
    threshold: float = 0.30,
    lookahead_days: int = 365,
) -> List[Dict]:
    """
    Predict maintenance events for all 4 subsystems.

    Args:
        telemetry:     latest telemetry dict
        health_scores: current health score per subsystem {name: float}
        threshold:     health score that triggers maintenance
        lookahead_days: max days ahead to predict

    Returns:
        List of maintenance event dicts sorted by urgency
    """
    now = datetime.now(timezone.utc)
    events = []

    # ── Battery ────────────────────────────────────────────────────────────
    bat_health = health_scores.get("battery", 0.85)
    bat_rul = battery.estimate_rul(
        current_health=bat_health,
        battery_temperature=telemetry.get("battery_temperature", 32.0),
        threshold=threshold,
    )
    bat_days = int(bat_rul / 24)
    events.append({
        "subsystem": "battery",
        "current_health": round(bat_health, 3),
        "predicted_date": (now + timedelta(days=bat_days)).strftime("%Y-%m-%d"),
        "days_remaining": bat_days,
        "urgency": _urgency(bat_days),
    })

    # ── Motor ──────────────────────────────────────────────────────────────
    mot_health = health_scores.get("motor", 0.80)
    mot_rul = motor.estimate_rul(
        current_health=mot_health,
        motor_rpm=telemetry.get("motor_rpm", 2000.0),
        motor_temperature=telemetry.get("motor_temperature", 70.0),
        motor_torque=telemetry.get("motor_torque", 15.0),
        threshold=threshold,
    )
    mot_days = int(mot_rul / 24)
    events.append({
        "subsystem": "motor",
        "current_health": round(mot_health, 3),
        "predicted_date": (now + timedelta(days=mot_days)).strftime("%Y-%m-%d"),
        "days_remaining": mot_days,
        "urgency": _urgency(mot_days),
    })

    # ── Braking ────────────────────────────────────────────────────────────
    brk_health = health_scores.get("braking", 0.75)
    brk_rul = braking.estimate_rul(
        current_health=brk_health,
        brake_pressure=telemetry.get("brake_pressure", 1.5),
        brake_temperature=telemetry.get("brake_temperature", 40.0),
        threshold=threshold,
    )
    brk_days = int(brk_rul / 24)
    events.append({
        "subsystem": "braking",
        "current_health": round(brk_health, 3),
        "predicted_date": (now + timedelta(days=brk_days)).strftime("%Y-%m-%d"),
        "days_remaining": brk_days,
        "urgency": _urgency(brk_days),
    })

    # ── Controller ─────────────────────────────────────────────────────────
    ctl_health = health_scores.get("controller", 0.92)
    ctl_rul = controller.estimate_rul(
        current_health=ctl_health,
        controller_temperature=telemetry.get("controller_temperature", 45.0),
        battery_current=telemetry.get("battery_current", 10.0),
        threshold=threshold,
    )
    ctl_days = int(ctl_rul / 24)
    events.append({
        "subsystem": "controller",
        "current_health": round(ctl_health, 3),
        "predicted_date": (now + timedelta(days=ctl_days)).strftime("%Y-%m-%d"),
        "days_remaining": ctl_days,
        "urgency": _urgency(ctl_days),
    })

    # Sort by urgency (fewest days first)
    events.sort(key=lambda e: e["days_remaining"])
    return events
