import pytest
import numpy as np
from app.models.model_metadata import ModelMetadata
from app.models.baseline_models import LogisticRegressionBaseline, RandomForestBaseline

def test_logistic_regression_baseline_fit_predict():
    meta = ModelMetadata(modelId="M1", algorithm="LOGISTIC_REGRESSION")
    model = LogisticRegressionBaseline(meta)

    X = np.array([[0.9, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0], [0.1, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0]])
    y = np.array([0, 1])

    model.fit(X, y)
    preds = model.predict(X)
    assert len(preds) == 2
    assert preds[0] == 0
    assert preds[1] == 1

def test_random_forest_baseline_fit_predict():
    meta = ModelMetadata(modelId="M2", algorithm="RANDOM_FOREST")
    model = RandomForestBaseline(meta)

    X = np.array([[0.9, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0], [0.1, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0]])
    y = np.array([0, 1])

    model.fit(X, y)
    preds = model.predict(X)
    probs = model.predict_proba(X)
    assert len(preds) == 2
    assert probs.shape == (2, 2)
