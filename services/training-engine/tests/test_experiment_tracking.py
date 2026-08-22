import pytest
from app.experiments.experiment_manager import ExperimentManager

def test_experiment_manager_logging():
    mgr = ExperimentManager(experiment_id="test-exp")
    mgr.log_job("JOB-100", {"lr": 0.01}, {"accuracy": 0.95})
    assert mgr.experiment_id == "test-exp"
