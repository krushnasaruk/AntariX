from pydantic import BaseModel, Field
from typing import Dict, Any

class TrainingConfig(BaseModel):
    experimentName: str = "mars-mission-ml"
    modelId: str = "MODEL-BATT-001"
    modelType: str = "SUPERVISED_CLASSIFICATION"
    algorithm: str = "RANDOM_FOREST"
    datasetId: str = "mars-comm-v1"
    seed: int = 42
    hyperparameters: Dict[str, Any] = Field(default_factory=lambda: {"n_estimators": 50, "max_depth": 5})
    device: str = "cpu"
