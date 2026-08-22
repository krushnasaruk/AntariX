import time
import numpy as np
from typing import List
from app.models.observations import AutonomyObservationModel
from app.models.anomalies import AnomalyModel

class PyAnomalyDetector:
    def detect(self, obs: AutonomyObservationModel) -> List[AnomalyModel]:
        anomalies: List[AnomalyModel] = []
        now = time.time() * 1000

        battery = obs.rover.batteryLevel
        reserve = obs.constraints.minimumBatteryReserve
        health = obs.rover.health
        weather = obs.environment.weather.state
        comm_state = obs.communication.communicationState

        # 1. Battery Low & Critical
        if battery < 0.05:
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-BAT-CRIT-{int(now)}",
                type="BATTERY_LOW",
                severity="CRITICAL",
                source="BATTERY_MONITOR",
                detectedAt=now,
                evidence={"batteryLevel": battery, "minimumReserve": reserve},
                confidence=0.99,
                recommendedResponse="WAIT"
            ))
        elif battery < reserve:
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-BAT-LOW-{int(now)}",
                type="BATTERY_LOW",
                severity="HIGH",
                source="BATTERY_MONITOR",
                detectedAt=now,
                evidence={"batteryLevel": battery, "minimumReserve": reserve},
                confidence=0.95,
                recommendedResponse="RETURN_TO_BASE"
            ))

        # 2. Rover Health Degradation
        if health != "NOMINAL":
            severity = "CRITICAL" if health == "CRITICAL" else "HIGH"
            response = "REQUEST_EARTH_GUIDANCE" if health == "CRITICAL" else "PAUSE_MISSION"
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-HLT-{int(now)}",
                type="ROVER_HEALTH_DEGRADATION",
                severity=severity,
                source="DIAGNOSTIC_SUITE",
                detectedAt=now,
                evidence={"health": health},
                confidence=0.95,
                recommendedResponse=response
            ))

        # 3. Obstacle Encounter
        for obs_item in obs.environment.nearbyObstacles:
            t_x, t_y = obs_item.get("position", {}).get("x", 0.0), obs_item.get("position", {}).get("y", 0.0)
            rad = obs_item.get("radius", 10.0)
            dist = float(np.sqrt((t_x - obs.rover.position.x)**2 + (t_y - obs.rover.position.y)**2))
            if dist <= (rad + 5.0):
                anomalies.append(AnomalyModel(
                    anomalyId=f"ANO-OBS-{int(now)}",
                    type="OBSTACLE_ENCOUNTER",
                    severity="MEDIUM",
                    source="RADAR_SCANNER",
                    detectedAt=now,
                    evidence={"obstacle": obs_item, "distance": dist},
                    confidence=0.92,
                    recommendedResponse="WAIT"
                ))
                break

        # 4. Hazard Encounter
        for haz in obs.environment.nearbyHazards:
            if haz.get("active", True):
                anomalies.append(AnomalyModel(
                    anomalyId=f"ANO-HAZ-{int(now)}",
                    type="HAZARD_ENCOUNTER",
                    severity="HIGH",
                    source="TERRAIN_SCANNER",
                    detectedAt=now,
                    evidence={"hazard": haz},
                    confidence=0.90,
                    recommendedResponse="SCAN_TERRAIN"
                ))
                break

        # 5. Weather Degradation
        if weather == "DUST_STORM":
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-WTH-STORM-{int(now)}",
                type="WEATHER_DEGRADATION",
                severity="HIGH",
                source="METEOROLOGY_STATION",
                detectedAt=now,
                evidence={"weatherState": weather, "visibility": 10.0},
                confidence=0.98,
                recommendedResponse="WAIT"
            ))
        elif weather == "DUSTY":
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-WTH-DUSTY-{int(now)}",
                type="WEATHER_DEGRADATION",
                severity="MEDIUM",
                source="METEOROLOGY_STATION",
                detectedAt=now,
                evidence={"weatherState": weather, "visibility": 50.0},
                confidence=0.85,
                recommendedResponse="SCAN_TERRAIN"
            ))

        # 6. Communication Blackout
        if comm_state == "BLACKOUT":
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-COMM-BLK-{int(now)}",
                type="COMMUNICATION_BLACKOUT",
                severity="LOW",
                source="DTN_CHANNEL",
                detectedAt=now,
                evidence={"communicationState": "BLACKOUT"},
                confidence=1.0,
                recommendedResponse="CONTINUE_PLAN"
            ))

        # 7. Plan Infeasibility
        if obs.currentPlan and obs.currentPlan.get("status") == "FAILED":
            anomalies.append(AnomalyModel(
                anomalyId=f"ANO-PLN-INF-{int(now)}",
                type="PLAN_INFEASIBILITY",
                severity="HIGH",
                source="PLAN_EXECUTIVE",
                detectedAt=now,
                evidence={"planId": obs.currentPlan.get("planId")},
                confidence=0.95,
                recommendedResponse="REPLAN"
            ))

        return anomalies
