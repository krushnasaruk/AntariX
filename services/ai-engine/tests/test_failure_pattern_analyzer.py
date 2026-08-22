import pytest
from app.memory.memory_models import MissionExperience
from app.intelligence.failure_pattern_analyzer import FailurePatternAnalyzer

def test_detect_battery_and_obstacle_failure_patterns():
    analyzer = FailurePatternAnalyzer()
    exps = [
        MissionExperience(experienceId="E1", actionSuccess=False, failureReason="BATTERY_LOW", batteryAfter=0.10, planStrategy="DIRECT_SAMPLE"),
        MissionExperience(experienceId="E2", actionSuccess=False, failureReason="BATTERY_LOW", batteryAfter=0.08, planStrategy="DIRECT_SAMPLE"),
        MissionExperience(experienceId="E3", actionSuccess=False, failureReason="OBSTACLE_COLLISION", planStrategy="FAST_PATH")
    ]

    patterns = analyzer.analyze_failures(exps)
    assert len(patterns) >= 2

    bat_pat = next((p for p in patterns if p.pattern == "BATTERY_LOW"), None)
    obs_pat = next((p for p in patterns if p.pattern == "OBSTACLE_COLLISION"), None)

    assert bat_pat is not None
    assert bat_pat.frequency == 2
    assert "DIRECT_SAMPLE" in bat_pat.affectedStrategies

    assert obs_pat is not None
    assert obs_pat.frequency == 1
    assert "FAST_PATH" in obs_pat.affectedStrategies
