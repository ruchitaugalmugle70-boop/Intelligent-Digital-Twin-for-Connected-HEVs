"""
Vehicle Data Simulator
======================
Simulates a real HEV scooter sending telemetry data to the FastAPI backend.
Runs a realistic drive cycle: startup → cruise → acceleration → braking → idle → charging.

Usage:
    python simulation/simulator.py

Make sure the FastAPI backend is running before starting this script.
"""

import math
import random
import time
from datetime import datetime, timezone

import requests

# ─────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────

BACKEND_URL = "http://localhost:8000"
INGEST_ENDPOINT = f"{BACKEND_URL}/telemetry/ingest"
SEND_INTERVAL_SECONDS = 3

VEHICLE_VIN = "EL-SCOOTER-001"
VEHICLE_ID = 1  # must match the registered vehicle in DB

# GPS circular route (Pune, India — 8 waypoints forming a loop)
GPS_ROUTE = [
    (18.5204, 73.8567),
    (18.5220, 73.8600),
    (18.5250, 73.8640),
    (18.5280, 73.8610),
    (18.5270, 73.8570),
    (18.5250, 73.8540),
    (18.5220, 73.8530),
    (18.5204, 73.8567),
]


# ─────────────────────────────────────────────────────────────
# Drive Cycle State Machine
# ─────────────────────────────────────────────────────────────

class DriveCycle:
    """
    Simulates a realistic HEV drive cycle with multiple phases.
    Each phase transitions automatically, looping forever.
    """

    PHASES = [
        {"name": "startup",      "duration": 10,  "target_speed": 20},
        {"name": "cruise_low",   "duration": 30,  "target_speed": 45},
        {"name": "acceleration", "duration": 15,  "target_speed": 80},
        {"name": "cruise_high",  "duration": 25,  "target_speed": 75},
        {"name": "braking",      "duration": 10,  "target_speed": 0},
        {"name": "idle",         "duration": 15,  "target_speed": 0},
        {"name": "charging",     "duration": 20,  "target_speed": 0},
    ]

    def __init__(self):
        self.phase_index = 0
        self.phase_elapsed = 0
        self.tick = 0

        # Vehicle state
        self.speed = 0.0
        self.motor_rpm = 0.0
        self.motor_torque = 0.0
        self.motor_temperature = 32.0
        self.battery_soc = 85.0
        self.battery_voltage = 72.0
        self.battery_current = 0.0
        self.battery_temperature = 28.0
        self.controller_temperature = 30.0
        self.brake_pressure = 0.0
        self.brake_temperature = 25.0
        self.odometer = 1250.0
        self.ambient_temperature = 32.0
        self.gps_index = 0
        self.is_charging = False

    def current_phase(self):
        return self.PHASES[self.phase_index]

    def advance(self):
        """Advance simulator by one tick (one send interval)."""
        self.tick += 1
        self.phase_elapsed += 1
        phase = self.current_phase()

        # Transition to next phase
        if self.phase_elapsed >= phase["duration"]:
            self.phase_elapsed = 0
            self.phase_index = (self.phase_index + 1) % len(self.PHASES)
            phase = self.current_phase()
            print(f"[SIM] Phase → {phase['name'].upper()}")

        target = phase["target_speed"]
        self.is_charging = phase["name"] == "charging"

        # ── Speed dynamics ──────────────────────────────────────
        if self.speed < target:
            self.speed = min(self.speed + random.uniform(2, 5), target)
        elif self.speed > target:
            self.speed = max(self.speed - random.uniform(3, 7), target)
        self.speed += random.uniform(-1, 1)
        self.speed = max(0.0, round(self.speed, 2))

        # ── Motor ───────────────────────────────────────────────
        self.motor_rpm = self.speed * 40 + random.uniform(-50, 50)
        self.motor_rpm = max(0.0, round(self.motor_rpm, 1))
        self.motor_torque = (self.speed / 100) * 35 + random.uniform(-2, 2)
        self.motor_torque = max(0.0, round(self.motor_torque, 2))

        # Motor temp rises under load, cools at idle
        if self.speed > 10:
            self.motor_temperature += random.uniform(0.1, 0.5)
        else:
            self.motor_temperature -= random.uniform(0.1, 0.3)
        self.motor_temperature = round(max(30.0, min(105.0, self.motor_temperature)), 1)

        # ── Braking ─────────────────────────────────────────────
        if phase["name"] == "braking":
            self.brake_pressure = random.uniform(2.0, 6.0)
            self.brake_temperature += random.uniform(0.5, 1.5)
        else:
            self.brake_pressure = 0.0
            self.brake_temperature -= random.uniform(0.1, 0.3)
        self.brake_pressure = round(self.brake_pressure, 2)
        self.brake_temperature = round(max(25.0, min(180.0, self.brake_temperature)), 1)

        # ── Battery ─────────────────────────────────────────────
        if self.is_charging:
            self.battery_soc += random.uniform(0.3, 0.8)
            self.battery_current = -random.uniform(5, 10)   # negative = charging
        else:
            drain = (self.speed / 100) * 0.08 + random.uniform(0, 0.03)
            self.battery_soc -= drain
            self.battery_current = (self.speed / 100) * 20 + random.uniform(-1, 1)

        self.battery_soc = round(max(5.0, min(100.0, self.battery_soc)), 2)
        self.battery_voltage = 65 + (self.battery_soc / 100) * 15 + random.uniform(-0.5, 0.5)
        self.battery_voltage = round(self.battery_voltage, 2)
        self.battery_current = round(self.battery_current, 2)
        self.battery_temperature += random.uniform(-0.05, 0.15)
        self.battery_temperature = round(max(20.0, min(55.0, self.battery_temperature)), 1)

        # ── Controller ──────────────────────────────────────────
        self.controller_temperature += random.uniform(-0.1, 0.2)
        self.controller_temperature = round(max(28.0, min(85.0, self.controller_temperature)), 1)

        # ── Odometer ────────────────────────────────────────────
        self.odometer += self.speed * (SEND_INTERVAL_SECONDS / 3600)
        self.odometer = round(self.odometer, 3)

        # ── GPS ─────────────────────────────────────────────────
        if self.speed > 0:
            self.gps_index = (self.gps_index + 1) % len(GPS_ROUTE)

        # ── Ambient ─────────────────────────────────────────────
        self.ambient_temperature += random.uniform(-0.05, 0.05)
        self.ambient_temperature = round(self.ambient_temperature, 1)

    def controller_status(self):
        if self.controller_temperature > 80:
            return "warning"
        if self.is_charging:
            return "charging"
        return "ok"

    def communication_status(self):
        return "connected"

    def to_payload(self):
        lat, lon = GPS_ROUTE[self.gps_index]
        return {
            "vehicle_id": VEHICLE_ID,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "battery_voltage": self.battery_voltage,
            "battery_current": self.battery_current,
            "battery_soc": self.battery_soc,
            "battery_temperature": self.battery_temperature,
            "motor_rpm": self.motor_rpm,
            "motor_temperature": self.motor_temperature,
            "motor_torque": self.motor_torque,
            "controller_temperature": self.controller_temperature,
            "controller_status": self.controller_status(),
            "brake_pressure": self.brake_pressure,
            "brake_temperature": self.brake_temperature,
            "speed": self.speed,
            "odometer": self.odometer,
            "ambient_temperature": self.ambient_temperature,
            "gps_latitude": lat + random.uniform(-0.0001, 0.0001),
            "gps_longitude": lon + random.uniform(-0.0001, 0.0001),
            "communication_status": self.communication_status(),
        }


# ─────────────────────────────────────────────────────────────
# Main Loop
# ─────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  Elespa Vehicle Data Simulator")
    print(f"  Target: {INGEST_ENDPOINT}")
    print(f"  VIN:    {VEHICLE_VIN}")
    print(f"  Interval: {SEND_INTERVAL_SECONDS}s")
    print("=" * 60)

    cycle = DriveCycle()
    session = requests.Session()

    while True:
        try:
            cycle.advance()
            payload = cycle.to_payload()

            response = session.post(INGEST_ENDPOINT, json=payload, timeout=5)

            phase = cycle.current_phase()["name"]
            print(
                f"[{datetime.now().strftime('%H:%M:%S')}] "
                f"Phase={phase:<12} "
                f"Speed={cycle.speed:>5.1f}km/h  "
                f"SOC={cycle.battery_soc:>5.1f}%  "
                f"MotorT={cycle.motor_temperature:>5.1f}°C  "
                f"HTTP={response.status_code}"
            )

        except requests.exceptions.ConnectionError:
            print("[SIM] ⚠️  Cannot reach backend — is FastAPI running?")
        except Exception as e:
            print(f"[SIM] Error: {e}")

        time.sleep(SEND_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
