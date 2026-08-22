import pytest
from app.models.training_job import TrainingJob, JobStatus

def test_training_job_schema_validation():
    job = TrainingJob(jobId="TRAIN-001", algorithm="PPO", modelType="RL", seed=42)

    assert job.jobId == "TRAIN-001"
    assert job.algorithm == "PPO"
    assert job.modelType == "RL"
    assert job.seed == 42
    assert job.status == JobStatus.QUEUED

def test_training_job_status_transition():
    job = TrainingJob(jobId="TRAIN-002")
    assert job.status == JobStatus.QUEUED

    job.status = JobStatus.RUNNING
    assert job.status == JobStatus.RUNNING

    job.status = JobStatus.COMPLETED
    assert job.status == JobStatus.COMPLETED
