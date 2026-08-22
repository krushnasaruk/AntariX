from pydantic import BaseModel, Field
from typing import Dict, Any, List

class DatasetManifest(BaseModel):
    datasetId: str
    version: str = "1.0.0"
    generationTimestamp: float
    generatorVersion: str = "10.0.0"
    simulationVersion: str = "9.0.0"
    schemaVersion: str = "1.0.0"
    featureVersion: str = "v1"
    seed: int
    episodes: int
    records: int
    splits: Dict[str, float] = Field(default_factory=lambda: {"train": 0.70, "validation": 0.15, "test": 0.15})
    datasetTypes: List[str] = Field(default_factory=lambda: ["SUPERVISED", "TIMESERIES", "RL", "ANOMALY"])
    checksum: str = ""
    metrics: Dict[str, Any] = Field(default_factory=dict)
