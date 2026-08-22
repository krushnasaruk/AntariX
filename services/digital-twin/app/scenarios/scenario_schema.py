from pydantic import BaseModel, Field
from typing import List, Dict, Any

class ScenarioConfig(BaseModel):
    scenarioId: str = "CRATER-07-NOMINAL-001"
    seed: int = 42
    mission: str = "MISSION-CRATER-07"
    initialBattery: float = 0.94
    weather: str = "CLEAR"
    communication: str = "AVAILABLE"
    roverHealth: str = "NOMINAL"
    hazards: List[Dict[str, Any]] = Field(default_factory=list)
    obstacles: List[Dict[str, Any]] = Field(default_factory=list)
    terrainVariation: float = 0.0
    sensorNoise: float = 0.0
    failureInjection: List[Dict[str, Any]] = Field(default_factory=list)
