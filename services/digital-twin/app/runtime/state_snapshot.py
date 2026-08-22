from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

class TwinState(BaseModel):
    timestamp: float
    simulationTime: float
    episodeId: str
    scenarioId: str
    mission: Dict[str, Any] = Field(default_factory=dict)
    currentTask: Optional[Dict[str, Any]] = None
    rover: Dict[str, Any] = Field(default_factory=dict)
    environment: Dict[str, Any] = Field(default_factory=dict)
    communication: Dict[str, Any] = Field(default_factory=dict)
    currentPlan: Optional[Dict[str, Any]] = None
    decisionState: Dict[str, Any] = Field(default_factory=dict)
    intelligenceReport: Dict[str, Any] = Field(default_factory=dict)
    learningRecommendation: Dict[str, Any] = Field(default_factory=dict)
    safetyValidationState: Dict[str, Any] = Field(default_factory=dict)

class StateSnapshot:
    @staticmethod
    def capture(
        episode_id: str,
        scenario_id: str,
        sim_time: float,
        obs: Dict[str, Any],
        decision: Dict[str, Any] = None,
        intelligence: Dict[str, Any] = None,
        learning: Dict[str, Any] = None,
        safety: Dict[str, Any] = None
    ) -> TwinState:
        return TwinState(
            timestamp=obs.get("timestamp", 0.0),
            simulationTime=sim_time,
            episodeId=episode_id,
            scenarioId=scenario_id,
            mission=obs.get("mission", {}),
            currentTask=obs.get("currentTask"),
            rover=obs.get("rover", {}),
            environment=obs.get("environment", {}),
            communication=obs.get("communication", {}),
            currentPlan=obs.get("currentPlan"),
            decisionState=decision or {},
            intelligenceReport=intelligence or {},
            learningRecommendation=learning or {},
            safetyValidationState=safety or {}
        )
