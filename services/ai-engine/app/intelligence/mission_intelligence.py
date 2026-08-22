import time
from app.models.observations import AutonomyObservationModel
from app.models.intelligence_report import (
    MissionIntelligenceReportModel,
    PlannerRecommendationModel
)
from .anomaly_detector import PyAnomalyDetector
from .risk_engine import PyRiskEngine
from .prediction_engine import PyPredictionEngine
from .mission_health import PyMissionHealthScorer

class PyMissionIntelligenceEngine:
    def __init__(self):
        self.anomaly_detector = PyAnomalyDetector()
        self.risk_engine = PyRiskEngine()
        self.prediction_engine = PyPredictionEngine()
        self.health_scorer = PyMissionHealthScorer()

    def generate_report(self, obs: AutonomyObservationModel) -> MissionIntelligenceReportModel:
        now = time.time() * 1000

        # 1. Anomalies
        anomalies = self.anomaly_detector.detect(obs)

        # 2. Risk Assessment
        risk_assessment = self.risk_engine.assess(obs, anomalies)

        # 3. Predictions (600s horizon)
        predictions = self.prediction_engine.predict(obs, 600.0)

        # 4. Mission Health
        health = self.health_scorer.calculate_health(obs)

        # 5. Planner Recommendation
        recommended_action = risk_assessment.recommendedAction
        rec_reason = "; ".join([f.detail for f in risk_assessment.factors]) or "Telemetry nominal."
        rec_evidence = [a.type for a in anomalies]

        planner_rec = PlannerRecommendationModel(
            recommendedAction=recommended_action,
            reason=rec_reason,
            evidence=rec_evidence
        )

        return MissionIntelligenceReportModel(
            timestamp=obs.timestamp or now,
            missionId=obs.mission.get("id", "MISSION-CRATER-07"),
            currentState=obs.mission.get("status", "IN_PROGRESS"),
            anomalies=anomalies,
            riskAssessment=risk_assessment,
            predictions=predictions,
            missionHealth=health,
            recommendedActions=[recommended_action],
            plannerRecommendation=planner_rec,
            confidence=0.95,
            explanation={
                "primary": recommended_action,
                "description": f"AI Intelligence assessed operational risk as {risk_assessment.overallRisk} with {len(anomalies)} active anomalies.",
                "evidence": [a.evidence for a in anomalies]
            }
        )
