"""
Hypothetical "What-If" Scenario
==================================
Lets the user override operating conditions and see the projected impact
on vehicle health and maintenance schedule.

Example: "What if I drive 200km/day at 45°C ambient temperature?"
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from simulation.models import battery, motor, braking, controller


def _override_telemetry(
    base_telemetry: Dict[str, Any],
    ambient_temperature: Optional[float],
    daily_km: Optional[float],
    load_factor: Optional[float],
) -> Dict[str, Any]:
    """
    Build a synthetic telemetry dict by overriding base values
    with the user-specified hypothetical conditions.
    """
    t = dict(base_telemetry)

    if ambient_temperature is not None:
        t["ambient_temperature"] = ambient_temperature
        # Heat soaks into battery and motor
        t["battery_temperature"] = (t.get("battery_temperature", 30.0)
                                    + (ambient_temperature - 25.0) * 0.6)
        t["motor_temperature"] = (t.get("motor_temperature", 70.0)
                                  + (ambient_temperature - 25.0) * 0.4)
        t["controller_temperature"] = (t.get("controller_temperature", 45.0)
                                       + (ambient_temperature - 25.0) * 0.3)

    if daily_km is not None:
        # Derive approximate speed and RPM from daily distance
        # Assume 8 hours of driving per day
        avg_speed = daily_km / 8.0
        t["speed"] = avg_speed
        t["motor_rpm"] = avg_speed * 40
        t["motor_torque"] = (avg_speed / 80.0) * 35
        # More driving = more battery drain = more current
        t["battery_current"] = (avg_speed / 80.0) * 25

    if load_factor is not None:
        # Scale all stress parameters by load factor
        t["motor_torque"] = t.get("motor_torque", 15.0) * load_factor
        t["battery_current"] = t.get("battery_current", 10.0) * load_factor
        t["brake_pressure"] = t.get("brake_pressure", 1.5) * load_factor

    return t


def run(
    base_telemetry: Dict[str, Any],
    health_scores: Dict[str, float],
    ambient_temperature: Optional[float] = None,
    daily_km: Optional[float] = None,
    load_factor: Optional[float] = None,
    horizon_days: int = 90,
    threshold: float = 0.30,
) -> Dict[str, Any]:
    """
    Run a what-if simulation with overridden operating conditions.

    Returns degradation curves + maintenance impact summary.
    """
    horizon_hours = horizon_days * 24
    synthetic = _override_telemetry(
        base_telemetry, ambient_temperature, daily_km, load_factor
    )

    # Run degradation models with synthetic conditions
    bat_points = battery.compute_degradation(
        current_health=health_scores.get("battery", 0.85),
        battery_temperature=synthetic.get("battery_temperature", 32.0),
        battery_soc=synthetic.get("battery_soc", 75.0),
        hours=horizon_hours,
    )
    mot_points = motor.compute_degradation(
        current_health=health_scores.get("motor", 0.80),
        motor_rpm=synthetic.get("motor_rpm", 2000.0),
        motor_temperature=synthetic.get("motor_temperature", 70.0),
        motor_torque=synthetic.get("motor_torque", 15.0),
        hours=horizon_hours,
    )
    brk_points = braking.compute_degradation(
        current_health=health_scores.get("braking", 0.75),
        brake_pressure=synthetic.get("brake_pressure", 1.5),
        brake_temperature=synthetic.get("brake_temperature", 40.0),
        hours=horizon_hours,
    )
    ctl_points = controller.compute_degradation(
        current_health=health_scores.get("controller", 0.92),
        controller_temperature=synthetic.get("controller_temperature", 45.0),
        battery_current=synthetic.get("battery_current", 10.0),
        hours=horizon_hours,
    )

    now = datetime.now(timezone.utc)

    def first_below_threshold(points, sub):
        for p in points:
            if p["health_score"] <= threshold:
                days = int(p["hour"] / 24)
                return {
                    "subsystem": sub,
                    "maintenance_in_days": days,
                    "predicted_date": (now + timedelta(days=days)).strftime("%Y-%m-%d"),
                    "final_health": p["health_score"],
                }
        last = points[-1] if points else {}
        return {
            "subsystem": sub,
            "maintenance_in_days": horizon_days,
            "predicted_date": (now + timedelta(days=horizon_days)).strftime("%Y-%m-%d"),
            "final_health": last.get("health_score", health_scores.get(sub, 1.0)),
        }

    # Sample every 24 hours (daily data points) for response size
    step = 24
    return {
        "conditions_applied": {
            "ambient_temperature": ambient_temperature,
            "daily_km": daily_km,
            "load_factor": load_factor,
            "horizon_days": horizon_days,
        },
        "battery_curve": bat_points[::step],
        "motor_curve": mot_points[::step],
        "maintenance_impact": [
            first_below_threshold(bat_points, "battery"),
            first_below_threshold(mot_points, "motor"),
            first_below_threshold(brk_points, "braking"),
            first_below_threshold(ctl_points, "controller"),
        ],
    }
