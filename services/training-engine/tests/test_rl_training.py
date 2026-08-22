import pytest
from app.models.training_job import TrainingJob
from app.training.rl_trainer import RLTrainer

def test_rl_trainer_with_safety_wrapper():
    job = TrainingJob(jobId="JOB-RL-1", modelType="RL", algorithm="PPO", seed=42)
    res = RLTrainer.train_job(job)

    assert res.jobId == "JOB-RL-1"
    assert "total_reward" in res.metrics

    # Safety metrics log proposed vs executed actions
    s_metrics = res.safetyMetrics
    assert s_metrics.safetyInterventions > 0
    assert len(s_metrics.actionHistory) > 0

    first_act = s_metrics.actionHistory[0]
    assert "proposedAction" in first_act
    assert "executedAction" in first_act
    assert "safetyDecision" in first_act
