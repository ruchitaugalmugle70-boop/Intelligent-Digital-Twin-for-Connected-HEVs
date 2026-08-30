"""
Controller Aging Physics Model
================================
Models power electronics controller degradation from:
  - Thermal cycling stress (temperature fluctuations)
  - Electrical stress (high current draw)

Output: health_score (0–1), rul_hours, aging_index
"""

# ─── Constants ──────────────────────────────────────────────────────────────
THERMAL_AGING_RATE = 0.000015   # health loss per °C above threshold per hour
ELECTRICAL_AGING_RATE = 0.000008  # health loss per amp of current per hour
THERMAL_THRESHOLD = 50.0         # °C — normal operating temp for controller
MIN_HEALTH = 0.0


def compute_degradation(
    current_health: float,
    controller_temperature: float,
    battery_current: float,
    hours: int = 1,
) -> list:
    """
    Compute controller degradation over `hours` time steps.
    Returns [{hour, health_score, rul_hours}]
    """
    health = current_health
    results = []

    thermal_stress = max(0.0, controller_temperature - THERMAL_THRESHOLD)
    electrical_stress = abs(battery_current)  # current magnitude
    rate = (
        THERMAL_AGING_RATE * thermal_stress
        + ELECTRICAL_AGING_RATE * electrical_stress
    )
    rate = max(rate, 0.0000005)  # very slow baseline aging

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
    controller_temperature: float,
    battery_current: float,
    threshold: float = 0.30,
) -> float:
    """Estimate remaining useful life in hours."""
    thermal_stress = max(0.0, controller_temperature - THERMAL_THRESHOLD)
    electrical_stress = abs(battery_current)
    rate = (
        THERMAL_AGING_RATE * thermal_stress
        + ELECTRICAL_AGING_RATE * electrical_stress
    )
    rate = max(rate, 0.0000005)
    if current_health <= threshold:
        return 0.0
    return (current_health - threshold) / rate
