from typing import List
from app.models.observations import AutonomyObservationModel
from app.models.anomalies import AnomalyModel
from app.models.risk import RiskAssessmentModel, RiskFactorModel

class PyRiskEngine:
    def assess(self, obs: AutonomyObservationModel, anomalies: List[AnomalyModel]) -> RiskAssessmentModel:
        factors: List[RiskFactorModel] = []
        critical_factors: List[str] = []

        battery = obs.rover.batteryLevel
        reserve = obs.constraints.minimumBatteryReserve
        health = obs.rover.health
        weather = obs.environment.weather.state
        comm_state = obs.communication.communicationState

        # 1. Battery Risk Factors
        if battery < 0.05:
            critical_factors.append("BATTERY_CRITICALLY_LOW")
            factors.append(RiskFactorModel(factor="Battery Level", detail=f"Battery at {battery * 100:.1f}%", risk="CRITICAL"))
        elif battery < reserve:
            factors.append(RiskFactorModel(factor="Battery Reserve", detail=f"Battery ({battery * 100:.1f}%) below reserve ({reserve * 100:.1f}%)", risk="HIGH"))

        # 2. Health Risk Factors
        if health != "NOMINAL":
            risk_lvl = "CRITICAL" if health == "CRITICAL" else "HIGH"
            if health == "CRITICAL":
                critical_factors.append("ROVER_HEALTH_CRITICAL")
            factors.append(RiskFactorModel(factor="Rover Health", detail=f"Health status is {health}", risk=risk_lvl))

        # 3. Weather Risk Factors
        if weather == "DUST_STORM":
            factors.append(RiskFactorModel(factor="Weather", detail="Active Dust Storm in progress", risk="HIGH"))
        elif weather == "DUSTY":
            factors.append(RiskFactorModel(factor="Weather", detail="Dusty atmosphere reducing solar flux", risk="MEDIUM"))

        # 4. Comm Risk Factors
        if comm_state == "BLACKOUT":
            factors.append(RiskFactorModel(factor="Communication", detail="Communication state is BLACKOUT", risk="LOW"))

        # Anomaly Check
        has_critical_anomaly = any(a.severity == "CRITICAL" for a in anomalies)
        has_high_anomaly = any(a.severity == "HIGH" for a in anomalies)
        has_medium_anomaly = any(a.severity == "MEDIUM" for a in anomalies)

        if has_critical_anomaly:
            critical_factors.append("CRITICAL_ANOMALY_PRESENT")

        # Determine Overall Risk Level & Score
        if critical_factors or has_critical_anomaly:
            overall_risk = "CRITICAL"
            score = 95.0
            recommended_action = "REQUEST_EARTH_GUIDANCE" if health == "CRITICAL" else ("WAIT" if battery < 0.05 else "RETURN_TO_BASE")
        elif has_high_anomaly or battery < reserve or weather == "DUST_STORM":
            overall_risk = "HIGH"
            score = 75.0
            recommended_action = "REPLAN"
        elif has_medium_anomaly or weather == "DUSTY":
            overall_risk = "MEDIUM"
            score = 45.0
            recommended_action = "SCAN_TERRAIN"
        else:
            overall_risk = "LOW"
            score = 15.0
            recommended_action = "CONTINUE_PLAN"

        return RiskAssessmentModel(
            overallRisk=overall_risk,
            score=round(score, 2),
            factors=factors,
            criticalFactors=critical_factors,
            confidence=0.95,
            recommendedAction=recommended_action
        )
