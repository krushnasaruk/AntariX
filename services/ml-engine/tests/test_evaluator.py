import pytest
import numpy as np
from app.models.model_metadata import ModelMetadata
from app.models.baseline_models import RandomForestBaseline
from app.evaluation.evaluator import Evaluator

def test_evaluator_in_and_out_of_distribution_metrics():
    meta = ModelMetadata(modelId="M-EVAL-1", algorithm="RANDOM_FOREST")
    model = RandomForestBaseline(meta)

    X_train = np.array([[0.9, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0], [0.1, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0]])
    y_train = np.array([0, 1])
    model.fit(X_train, y_train)

    X_in = np.array([[0.85, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0], [0.15, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0]])
    y_in = np.array([0, 1])

    X_ood = np.array([[0.9, 0.9, 0.9, 0.9, 0.9, 2.0, 0.0], [0.1, 0.9, 0.9, 0.9, 0.9, 2.0, 0.0]])
    y_ood = np.array([0, 1])

    report = Evaluator.evaluate_model(model, X_in, y_in, X_ood, y_ood)
    assert report.modelId == "M-EVAL-1"
    assert report.passed is True
    assert "accuracy" in report.inDistributionMetrics
    assert "accuracy" in report.outOfDistributionMetrics
