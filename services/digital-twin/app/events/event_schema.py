from pydantic import BaseModel, Field
from typing import Dict, Any

class SimulationEvent(BaseModel):
    event_id: str
    episode_id: str
    simulation_time: float
    event_type: str
    source: str
    payload: Dict[str, Any] = Field(default_factory=dict)
