from pydantic import BaseModel, Field
from typing import Dict, Any, List

class SafetyMetricsCollector(BaseModel):
    unsafeActionAttempts: int = 0
    safetyInterventions: int = 0
    obstacleViolations: int = 0
    batteryReserveViolations: int = 0
    hazardViolations: int = 0
    emergencyReturns: int = 0
    missionFailures: int = 0
    missionSuccessRate: float = 1.0
    actionHistory: List[Dict[str, Any]] = Field(default_factory=list)

    def log_action(self, proposed_action: str, executed_action: str, decision: str):
        intervention = proposed_action != executed_action
        if intervention:
            self.unsafeActionAttempts += 1
            self.safetyInterventions += 1

        self.actionHistory.append({
            "proposedAction": proposed_action,
            "executedAction": executed_action,
            "safetyDecision": decision,
            "intervention": intervention
        })

class TrainingResult(BaseModel):
    jobId: str
    metrics: Dict[str, float] = Field(default_factory=dict)
    safetyMetrics: SafetyMetricsCollector = Field(default_factory=SafetyMetricsCollector)
    modelArtifactPath: str = ""
    evaluationPassed: bool = True
