from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.observations import AutonomyObservationModel

class MissionExperience(BaseModel):
    experienceId: str
    missionId: str = "MISSION-CRATER-07"
    missionType: str = "SAMPLE_COLLECTION"
    taskId: str = "TASK-1"
    actionType: str = "MOVE_ROVER"
    timestamp: float = Field(default_factory=lambda: 0.0)
    roverPosition: Dict[str, float] = Field(default_factory=lambda: {"x": 100.0, "y": 100.0})
    batteryBefore: float = 0.94
    batteryAfter: float = 0.92
    batteryConsumed: float = 0.02
    terrainType: str = "FLAT"
    weatherState: str = "CLEAR"
    communicationState: str = "AVAILABLE"
    riskLevel: str = "LOW"
    plannedAction: str = "MOVE_ROVER"
    executedAction: str = "MOVE_ROVER"
    actionSuccess: bool = True
    failureReason: Optional[str] = None
    executionDuration: float = 50.0
    estimatedDuration: float = 50.0
    estimatedEnergy: float = 0.02
    actualEnergy: float = 0.02
    planId: str = "PLAN-1"
    planStrategy: str = "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
    anomalyTypes: List[str] = Field(default_factory=list)
    safetyValidationResult: Dict[str, Any] = Field(default_factory=dict)
    finalOutcome: str = "SUCCESS"

class ExperienceQuery(BaseModel):
    missionId: Optional[str] = None
    strategy: Optional[str] = None
    successfulOnly: bool = False
    failedOnly: bool = False
    limit: int = 50

class StrategyPerformance(BaseModel):
    strategyName: str
    totalExecutions: int = 0
    successfulExecutions: int = 0
    failedExecutions: int = 0
    successRate: float = 0.0
    failureRate: float = 0.0
    averageEnergyError: float = 0.0
    averageDurationError: float = 0.0
    averageReplans: float = 0.0
    averageBatteryReserveAtCompletion: float = 0.0
    obstacleFailureFrequency: int = 0
    weatherFailureFrequency: int = 0
    communicationDelayImpact: float = 0.0
    safetyRejectionFrequency: int = 0

class FailurePattern(BaseModel):
    pattern: str
    frequency: int = 0
    severity: str = "MEDIUM"
    affectedStrategies: List[str] = Field(default_factory=list)
    affectedTerrain: List[str] = Field(default_factory=list)
    affectedWeather: List[str] = Field(default_factory=list)
    affectedMissionTasks: List[str] = Field(default_factory=list)
    recommendedAdjustment: str = ""

class AdaptivePlanningRecommendation(BaseModel):
    recommendedStrategy: str
    confidence: float
    reason: str
    historicalEvidence: Dict[str, Any] = Field(default_factory=dict)
    riskAdjustment: Dict[str, Any] = Field(default_factory=dict)
    sampleSize: int = 0
    evidenceQuality: str = "NONE"

class LearningAnalysisRequest(BaseModel):
    observation: AutonomyObservationModel
    candidateStrategies: List[str] = Field(default_factory=list)

class LearningAnalysisResponse(BaseModel):
    timestamp: float
    recommendation: AdaptivePlanningRecommendation
    strategyPerformances: List[StrategyPerformance] = Field(default_factory=list)
    failurePatterns: List[FailurePattern] = Field(default_factory=list)
    statistics: Dict[str, Any] = Field(default_factory=dict)
