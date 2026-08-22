from pydantic import BaseModel, Field
from typing import Dict, Any

class ModelArtifact(BaseModel):
    modelId: str
    jobId: str
    artifactPath: str
    checksum: str = "sha256-mock"
    createdAt: float = Field(default_factory=float)
    metadata: Dict[str, Any] = Field(default_factory=dict)
