from pydantic import BaseModel, Field
from typing import List, Dict, Any
from .anomalies import AnomalyModel
from .risk import RiskAssessmentModel
from .predictions import PredictionsModel

class MissionHealthModel(BaseModel):
    score: float
    batteryHealth: float
    roverHealth: float
    communicationHealth: float
    environmentHealth: float
    missionProgressHealth: float

class PlannerRecommendationModel(BaseModel):
    recommendedAction: str
    reason: str
    evidence: List[str] = Field(default_factory=list)

class MissionIntelligenceReportModel(BaseModel):
    timestamp: float
    missionId: str
    currentState: str
    anomalies: List[AnomalyModel] = Field(default_factory=list)
    riskAssessment: RiskAssessmentModel
    predictions: PredictionsModel
    missionHealth: MissionHealthModel
    recommendedActions: List[str] = Field(default_factory=list)
    plannerRecommendation: PlannerRecommendationModel
    confidence: float = 0.95
    explanation: Dict[str, Any] = Field(default_factory=dict)
