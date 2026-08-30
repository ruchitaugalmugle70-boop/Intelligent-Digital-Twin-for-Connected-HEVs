"""
Braking System Wear Physics Model
===================================
Models brake pad and rotor degradation from:
  - Brake pressure events (friction wear)
  - Heat accumulation (thermal degradation of pad material)

Output: health_score (0–1), rul_hours
"""

# ─── Constants ──────────────────────────────────────────────────────────────
PRESSURE_WEAR_RATE = 0.00008   # health loss per bar of pressure per hour
THERMAL_WEAR_RATE = 0.00002    # health loss per °C above threshold per hour
THERMAL_THRESHOLD = 60.0       # °C — normal operating temp
MIN_HEALTH = 0.0


def compute_degradation(
    current_health: float,
    brake_pressure: float,
    brake_temperature: float,
    hours: int = 1,
) -> list:
    """
    Compute brake system degradation over `hours` time steps.
    Returns [{hour, health_score, rul_hours}]
    """
    health = current_health
    results = []

    thermal_stress = max(0.0, brake_temperature - THERMAL_THRESHOLD)
    rate = (
        PRESSURE_WEAR_RATE * brake_pressure
        + THERMAL_WEAR_RATE * thermal_stress
    )
    rate = max(rate, 0.000002)  # baseline wear even at idle

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
    brake_pressure: float,
    brake_temperature: float,
    threshold: float = 0.30,
) -> float:
    """Estimate remaining useful life in hours."""
    thermal_stress = max(0.0, brake_temperature - THERMAL_THRESHOLD)
    rate = (
        PRESSURE_WEAR_RATE * brake_pressure
        + THERMAL_WEAR_RATE * thermal_stress
    )
    rate = max(rate, 0.000002)
    if current_health <= threshold:
        return 0.0
    return (current_health - threshold) / rate
