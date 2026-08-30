"""
Operational Trends Scenario
=============================
Analyses historical telemetry to identify trends and projects
key metrics forward using linear regression.

Returns projected ranges for battery SOC, motor temp, speed.
"""

from typing import Any, Dict, List


def _linear_regression(values: List[float]):
    """Simple least-squares linear regression. Returns (slope, intercept)."""
    n = len(values)
    if n < 2:
        return 0.0, values[0] if values else 0.0

    x_mean = (n - 1) / 2
    y_mean = sum(values) / n

    numerator = sum((i - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((i - x_mean) ** 2 for i in range(n))

    slope = numerator / denominator if denominator != 0 else 0.0
    intercept = y_mean - slope * x_mean
    return slope, intercept


def run(
    history: List[Dict[str, Any]],
    projection_days: int = 30,
) -> Dict[str, Any]:
    """
    Analyse telemetry history and project trends forward.

    Args:
        history:         list of telemetry records (newest first from DB)
        projection_days: how many days ahead to project

    Returns:
        dict with trend analysis and projection for each key metric
    """
    if not history:
        return {"error": "No telemetry history available"}

    # Reverse so oldest first for regression
    records = list(reversed(history))
    projection_hours = projection_days * 24

    def extract_and_project(field: str, label: str) -> Dict:
        values = [r.get(field) or 0.0 for r in records]
        slope, intercept = _linear_regression(values)
        current = values[-1] if values else 0.0
        projected = intercept + slope * (len(values) + projection_hours)

        trend = "stable"
        if slope > 0.01:
            trend = "increasing"
        elif slope < -0.01:
            trend = "decreasing"

        return {
            "current": round(current, 2),
            "projected": round(projected, 2),
            "change": round(projected - current, 2),
            "trend": trend,
            "slope_per_hour": round(slope, 6),
        }

    soc_values = [r.get("battery_soc") or 0.0 for r in records]
    avg_soc = sum(soc_values) / len(soc_values) if soc_values else 0.0

    speed_values = [r.get("speed") or 0.0 for r in records]
    avg_speed = sum(speed_values) / len(speed_values) if speed_values else 0.0

    return {
        "data_points_analysed": len(records),
        "projection_days": projection_days,
        "battery_soc": extract_and_project("battery_soc", "Battery SOC"),
        "battery_temperature": extract_and_project("battery_temperature", "Battery Temp"),
        "motor_temperature": extract_and_project("motor_temperature", "Motor Temp"),
        "speed": extract_and_project("speed", "Speed"),
        "summary": {
            "avg_battery_soc_percent": round(avg_soc, 1),
            "avg_speed_kmh": round(avg_speed, 1),
            "data_window_hours": len(records) * 3 / 3600,
        },
    }
