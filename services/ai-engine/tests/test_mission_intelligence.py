import pytest
import time
from app.models.observations import AutonomyObservationModel
from app.intelligence.mission_intelligence import PyMissionIntelligenceEngine

def test_generate_mission_intelligence_report():
    engine = PyMissionIntelligenceEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000)
    report = engine.generate_report(obs)
    assert report is not None
    assert report.missionId == "MISSION-CRATER-07"
    assert report.riskAssessment is not None
    assert report.predictions is not None
    assert report.missionHealth is not None
    assert len(report.recommendedActions) > 0

def test_deterministic_identical_input_output():
    engine = PyMissionIntelligenceEngine()
    ts = 1724074300000.0
    obs = AutonomyObservationModel(timestamp=ts)
    r1 = engine.generate_report(obs)
    r2 = engine.generate_report(obs)
    assert r1.riskAssessment.overallRisk == r2.riskAssessment.overallRisk
    assert r1.riskAssessment.score == r2.riskAssessment.score
    assert r1.missionHealth.score == r2.missionHealth.score
