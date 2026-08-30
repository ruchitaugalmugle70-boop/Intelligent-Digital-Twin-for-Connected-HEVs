"""
Component Degradation Scenario
================================
Projects subsystem health score over a future time horizon.
Uses current telemetry as the starting state and runs the appropriate
physics model forward in time.

Returns a time-series: [{hour, health_score, rul_hours}, ...]
"""

from typing import Any, Dict, List

from simulation.models import battery, motor, braking, controller


def run(
    subsystem: str,
    horizon_hours: int,
    telemetry: Dict[str, Any],
    current_health: float = 0.85,
) -> List[Dict]:
    """
    Run the degradation scenario for the given subsystem.

    Args:
        subsystem:       one of 'battery', 'motor', 'braking', 'controller'
        horizon_hours:   how far into the future to project
        telemetry:       latest telemetry dict from the database
        current_health:  starting health score (0–1)

    Returns:
        List of data points [{hour, health_score, rul_hours}]
    """

    if subsystem == "battery":
        return battery.compute_degradation(
            current_health=current_health,
            battery_temperature=telemetry.get("battery_temperature", 32.0),
            battery_soc=telemetry.get("battery_soc", 75.0),
            hours=horizon_hours,
        )

    elif subsystem == "motor":
        return motor.compute_degradation(
            current_health=current_health,
            motor_rpm=telemetry.get("motor_rpm", 2000.0),
            motor_temperature=telemetry.get("motor_temperature", 70.0),
            motor_torque=telemetry.get("motor_torque", 15.0),
            hours=horizon_hours,
        )

    elif subsystem == "braking":
        return braking.compute_degradation(
            current_health=current_health,
            brake_pressure=telemetry.get("brake_pressure", 1.5),
            brake_temperature=telemetry.get("brake_temperature", 40.0),
            hours=horizon_hours,
        )

    elif subsystem == "controller":
        return controller.compute_degradation(
            current_health=current_health,
            controller_temperature=telemetry.get("controller_temperature", 45.0),
            battery_current=telemetry.get("battery_current", 10.0),
            hours=horizon_hours,
        )

    else:
        raise ValueError(f"Unknown subsystem: {subsystem}")
