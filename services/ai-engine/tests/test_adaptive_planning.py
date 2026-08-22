import pytest
import time
from app.models.observations import AutonomyObservationModel
from app.memory.memory_models import MissionExperience
from app.intelligence.adaptive_planning import AdaptivePlanningEngine

def test_cold_start_behavior_zero_experiences():
    engine = AdaptivePlanningEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000)

    res = engine.analyze_and_recommend(obs, ["SAFE_SAMPLE_ACQUISITION_AND_RETURN", "DIRECT_SAMPLE"])
    assert res.recommendation is not None
    assert res.recommendation.confidence == 0.10
    assert res.recommendation.sampleSize == 0
    assert "Cold start" in res.recommendation.reason

def test_adaptive_recommendation_with_historical_evidence():
    engine = AdaptivePlanningEngine()
    obs = AutonomyObservationModel(timestamp=time.time() * 1000)

    # Record 5 experiences favoring SAFE_SAMPLE_ACQUISITION_AND_RETURN
    for i in range(4):
        engine.record_experience(MissionExperience(
            experienceId=f"E-{i}",
            planStrategy="SAFE_SAMPLE_ACQUISITION_AND_RETURN",
            actionSuccess=True,
            finalOutcome="SUCCESS"
        ))
    engine.record_experience(MissionExperience(
        experienceId="E-5",
        planStrategy="DIRECT_SAMPLE",
        actionSuccess=False,
        finalOutcome="FAILURE",
        failureReason="BATTERY_LOW"
    ))

    res = engine.analyze_and_recommend(obs, ["SAFE_SAMPLE_ACQUISITION_AND_RETURN", "DIRECT_SAMPLE"])
    assert res.recommendation.recommendedStrategy == "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
    assert res.recommendation.confidence == 0.70 # 5 samples -> MODERATE confidence
    assert res.recommendation.sampleSize == 5
    assert len(res.failurePatterns) > 0

def test_deterministic_scoring():
    engine1 = AdaptivePlanningEngine()
    engine2 = AdaptivePlanningEngine()

    exp = MissionExperience(experienceId="E1", planStrategy="SAFE_SAMPLE", actionSuccess=True)
    engine1.record_experience(exp)
    engine2.record_experience(exp)

    obs = AutonomyObservationModel(timestamp=1724074300000.0)
    r1 = engine1.analyze_and_recommend(obs)
    r2 = engine2.analyze_and_recommend(obs)

    assert r1.recommendation.recommendedStrategy == r2.recommendation.recommendedStrategy
    assert r1.recommendation.confidence == r2.recommendation.confidence
