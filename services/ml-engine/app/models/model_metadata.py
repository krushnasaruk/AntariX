import time
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class ModelMetadata(BaseModel):
    modelId: str
    modelVersion: str = "1.0.0"
    modelType: str = "SUPERVISED_CLASSIFICATION"
    algorithm: str = "LOGISTIC_REGRESSION"
    datasetId: str = "mars-comm-v1"
    datasetVersion: str = "1.0.0"
    featureVersion: str = "v1"
    randomSeed: int = 42
    status: str = "CREATED" # CREATED, VALIDATED, APPROVED, DEPLOYED, REJECTED
    metrics: Dict[str, Any] = Field(default_factory=dict)
    artifactPath: str = ""
    createdAt: float = Field(default_factory=time.time)
