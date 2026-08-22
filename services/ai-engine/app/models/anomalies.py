from pydantic import BaseModel, Field
from typing import Dict, Any

class AnomalyModel(BaseModel):
    anomalyId: str
    type: str
    severity: str
    source: str
    detectedAt: float
    evidence: Dict[str, Any] = Field(default_factory=dict)
    confidence: float
    recommendedResponse: str
