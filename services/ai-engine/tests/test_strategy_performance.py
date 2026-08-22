import pytest
from app.memory.memory_models import MissionExperience
from app.intelligence.strategy_performance import StrategyPerformanceEngine

def test_evaluate_strategy_performance_metrics():
    engine = StrategyPerformanceEngine()
    exps = [
        MissionExperience(experienceId="E1", planStrategy="SAFE_SAMPLE", actionSuccess=True, estimatedEnergy=0.05, actualEnergy=0.06),
        MissionExperience(experienceId="E2", planStrategy="SAFE_SAMPLE", actionSuccess=True, estimatedEnergy=0.05, actualEnergy=0.05),
        MissionExperience(experienceId="E3", planStrategy="SAFE_SAMPLE", actionSuccess=False, failureReason="OBSTACLE_COLLISION", estimatedEnergy=0.05, actualEnergy=0.08)
    ]

    perfs = engine.evaluate_strategies(exps)
    assert len(perfs) == 1
    p = perfs[0]
    assert p.strategyName == "SAFE_SAMPLE"
    assert p.totalExecutions == 3
    assert p.successfulExecutions == 2
    assert p.failedExecutions == 1
    assert p.successRate == 0.667
    assert p.obstacleFailureFrequency == 1
