import pytest
import numpy as np
from app.models.model_metadata import ModelMetadata
from app.models.baseline_models import RandomForestBaseline
from app.registry.model_registry import ModelRegistry

def test_model_registry_registration_and_promotion(tmp_path):
    reg = ModelRegistry(registry_dir=str(tmp_path))
    meta = ModelMetadata(modelId="M-REG-001", algorithm="RANDOM_FOREST")
    model = RandomForestBaseline(meta)

    X = np.array([[0.9, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0], [0.1, 0.2, 0.2, 0.0, 0.5, 0.0, 1.0]])
    y = np.array([0, 1])
    model.fit(X, y)

    reg.register_model(model)
    loaded = reg.get_model("M-REG-001")
    assert loaded is not None
    assert loaded.metadata.modelId == "M-REG-001"

    prom = reg.promote_model("M-REG-001", "APPROVED")
    assert prom.status == "APPROVED"
