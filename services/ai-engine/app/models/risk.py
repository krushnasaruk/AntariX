from pydantic import BaseModel, Field
from typing import List

class RiskFactorModel(BaseModel):
    factor: str
    detail: str
    risk: str

class RiskAssessmentModel(BaseModel):
    overallRisk: str
    score: float
    factors: List[RiskFactorModel] = Field(default_factory=list)
    criticalFactors: List[str] = Field(default_factory=list)
    confidence: float = 0.95
    recommendedAction: str = "CONTINUE_PLAN"
