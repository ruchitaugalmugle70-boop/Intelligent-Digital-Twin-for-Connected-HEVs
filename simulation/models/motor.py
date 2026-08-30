"""
Motor Wear Physics Model
========================
Models motor degradation from:
  - Cumulative RPM load (mechanical stress)
  - Thermal cycling stress (temperature above 80°C threshold)
  - Torque-driven mechanical wear

Output: health_score (0–1), rul_hours, wear_index
"""

# ─── Constants ──────────────────────────────────────────────────────────────
RPM_WEAR_RATE = 0.000001       # health loss per RPM per hour
THERMAL_WEAR_RATE = 0.00005    # extra health loss per °C above threshold per hour
THERMAL_THRESHOLD = 80.0       # °C — above this, accelerated wear starts
TORQUE_WEAR_RATE = 0.000003    # health loss per Nm per hour
MIN_HEALTH = 0.0


def compute_degradation(
    current_health: float,
    motor_rpm: float,
    motor_temperature: float,
    motor_torque: float,
    hours: int = 1,
) -> list:
    """
    Compute motor health degradation over `hours` time steps.
    Returns [{hour, health_score, rul_hours}]
    """
    health = current_health
    results = []

    thermal_stress = max(0.0, motor_temperature - THERMAL_THRESHOLD)

    rate = (
        RPM_WEAR_RATE * motor_rpm
        + THERMAL_WEAR_RATE * thermal_stress
        + TORQUE_WEAR_RATE * motor_torque
    )
    rate = max(rate, 0.000001)  # minimum baseline wear

    for h in range(1, hours + 1):
        health = max(MIN_HEALTH, health - rate)
        rul = (health - 0.30) / rate if health > 0.30 else 0.0
        results.append({
            "hour": h,
            "health_score": round(health, 4),
            "rul_hours": round(max(0.0, rul), 1),
        })

    return results


def estimate_rul(
    current_health: float,
    motor_rpm: float,
    motor_temperature: float,
    motor_torque: float,
    threshold: float = 0.30,
) -> float:
    """Estimate remaining useful life in hours."""
    thermal_stress = max(0.0, motor_temperature - THERMAL_THRESHOLD)
    rate = (
        RPM_WEAR_RATE * motor_rpm
        + THERMAL_WEAR_RATE * thermal_stress
        + TORQUE_WEAR_RATE * motor_torque
    )
    rate = max(rate, 0.000001)
    if current_health <= threshold:
        return 0.0
    return (current_health - threshold) / rate
