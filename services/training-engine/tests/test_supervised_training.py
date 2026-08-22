import pytest
from app.models.training_job import TrainingJob
from app.training.supervised_trainer import SupervisedTrainer

def test_supervised_trainer_execution():
    job = TrainingJob(jobId="JOB-SUP-1", modelType="SUPERVISED", algorithm="RANDOM_FOREST")
    res = SupervisedTrainer.train_job(job)

    assert res.jobId == "JOB-SUP-1"
    assert "accuracy" in res.metrics
    assert res.evaluationPassed is True
