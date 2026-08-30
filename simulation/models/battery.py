"""
Battery Degradation Physics Model
===================================
Models battery State-of-Health (SoH) degradation using:
  - Arrhenius equation for thermal acceleration
  - Cycle-based capacity fade (charge/discharge stress)

Inputs: average temperature, SOC swings, cycle count
Output: health_score (0–1), rul_hours, degradation_rate_per_hour
"""

import math


# ─── Constants ──────────────────────────────────────────────────────────────
REFERENCE_TEMP_K = 298.15       # 25°C in Kelvin
ACTIVATION_ENERGY = 6000.0      # Ea/R (simplified Arrhenius constant)
CYCLE_FADE_RATE = 0.0002        # health loss per full charge cycle
CALENDAR_FADE_RATE = 0.000003   # health loss per hour at reference temp
INITIAL_HEALTH = 1.0            # 100% healthy
MIN_HEALTH = 0.0


def _arrhenius_factor(temperature_celsius: float) -> float:
    """
    Return the thermal acceleration factor relative to 25°C.
    Higher temperature → higher factor → faster degradation.
    """
    temp_k = temperature_celsius + 273.15
    return math.exp(ACTIVATION_ENERGY * (1 / REFERENCE_TEMP_K - 1 / temp_k))


def compute_degradation(
    current_health: float,
    battery_temperature: float,
    battery_soc: float,
    hours: int = 1,
    charge_cycles_per_hour: float = 0.02,
) -> dict:
    """
    Compute degraded battery health over `hours` time steps.

    Returns a list of data points: [{hour, health_score, rul_hours}]
    """
    health = current_health
    thermal_factor = _arrhenius_factor(battery_temperature)
    results = []

    for h in range(1, hours + 1):
        # Calendar degradation (thermally accelerated)
        calendar_loss = CALENDAR_FADE_RATE * thermal_factor

        # Cycle degradation (each partial cycle contributes proportionally)
        cycle_loss = CYCLE_FADE_RATE * charge_cycles_per_hour

        total_loss = calendar_loss + cycle_loss
        health = max(MIN_HEALTH, health - total_loss)

        # Remaining useful life: hours until health hits 30% threshold
        if total_loss > 0 and health > 0.30:
            rul = (health - 0.30) / total_loss
        else:
            rul = 0.0

        results.append({
            "hour": h,
            "health_score": round(health, 4),
            "rul_hours": round(rul, 1),
        })

    return results


def estimate_rul(
    current_health: float,
    battery_temperature: float,
    charge_cycles_per_hour: float = 0.02,
    threshold: float = 0.30,
) -> float:
    """Estimate remaining useful life in hours until health hits threshold."""
    thermal_factor = _arrhenius_factor(battery_temperature)
    rate = CALENDAR_FADE_RATE * thermal_factor + CYCLE_FADE_RATE * charge_cycles_per_hour
    if rate <= 0 or current_health <= threshold:
        return 0.0
    return (current_health - threshold) / rate
