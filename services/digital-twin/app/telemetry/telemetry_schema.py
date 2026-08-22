from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class TelemetryRecord(BaseModel):
    timestamp: float
    mission_id: str = "MISSION-CRATER-07"
    episode_id: str
    simulation_time: float
    rover_position_x: float = 100.0
    rover_position_y: float = 100.0
    velocity_vx: float = 0.0
    velocity_vy: float = 0.0
    heading: float = 0.0
    battery: float = 0.94
    battery_drain_rate: float = 0.0001
    rover_health: str = "NOMINAL"
    terrain: str = "FLAT"
    weather: str = "CLEAR"
    visibility: float = 100.0
    communication_state: str = "AVAILABLE"
    one_way_delay: float = 750.5
    round_trip_delay: float = 1501.0
    current_task: str = "TASK-1"
    task_progress: float = 0.0
    risk_score: float = 15.0
    details: Dict[str, Any] = Field(default_factory=dict)
