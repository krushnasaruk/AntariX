from pydantic import BaseModel, Field
from typing import List, Dict, Any

class DatasetManifest(BaseModel):
    datasetId: str
    version: str = "1.0.0"
    family: str = "SUPERVISED"
    sourceScenarioVersion: str = "v1"
    seed: int = 42
    rowCount: int = 1000
    featureSchemaHash: str = "schema-hash-v1"
    trainEpisodes: List[str] = Field(default_factory=lambda: ["EP-1", "EP-2", "EP-3"])
    validationEpisodes: List[str] = Field(default_factory=lambda: ["EP-4"])
    testEpisodes: List[str] = Field(default_factory=lambda: ["EP-5"])
    checksum: str = "sha256-dataset-checksum"
