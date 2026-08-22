from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
import hashlib
import time

class DecisionRecord(BaseModel):
    decisionId: str
    timestamp: float = Field(default_factory=time.time)
    missionId: str = "MARS_EXPEDITION_01"
    observationId: str = ""
    modelName: str = "mars-intelligence-v1"
    modelVersion: str = "1.0.0"
    modelHash: str = ""
    inputSchemaVersion: str = "v1.2.0"
    prediction: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = 1.0
    recommendation: str = "CONTINUE"
    plannerDecision: Optional[Dict[str, Any]] = None
    safetyDecision: str = "APPROVED" # APPROVED | REJECTED_OVERRIDDEN | REJECTED_BLOCKED
    executedAction: Dict[str, Any] = Field(default_factory=dict)
    actualOutcome: Optional[str] = None
    isOOD: bool = False

class ProvenanceTracker:
    def __init__(self):
        self.records: Dict[str, DecisionRecord] = {}

    def log_decision(
        self,
        decision_id: str,
        model_name: str,
        model_version: str,
        prediction: Dict[str, Any],
        confidence: float,
        recommendation: str,
        safety_decision: str,
        executed_action: Dict[str, Any],
        is_ood: bool = False
    ) -> DecisionRecord:
        # Compute sha256 hash of model identifier + version
        model_str = f"{model_name}:{model_version}"
        model_hash = hashlib.sha256(model_str.encode()).hexdigest()[:16]

        record = DecisionRecord(
            decisionId=decision_id,
            modelName=model_name,
            modelVersion=model_version,
            modelHash=model_hash,
            prediction=prediction,
            confidence=confidence,
            recommendation=recommendation,
            safetyDecision=safety_decision,
            executedAction=executed_action,
            isOOD=is_ood
        )
        self.records[decision_id] = record
        return record

    def get_record(self, decision_id: str) -> Optional[DecisionRecord]:
        return self.records.get(decision_id)
