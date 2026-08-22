from typing import List, Dict, Any
from app.telemetry.telemetry_schema import TelemetryRecord
from app.runtime.state_snapshot import TwinState

class TelemetryCollector:
    def __init__(self):
        self._records: List[TelemetryRecord] = []

    def collect_from_state(self, state: TwinState) -> TelemetryRecord:
        rover = state.rover or {}
        pos = rover.get("position", {})
        vel = rover.get("velocity", {})
        env = state.environment or {}
        weather = env.get("weather", {})
        comm = state.communication or {}
        current_task = state.currentTask.get("name", "TASK-1") if state.currentTask else "TASK-1"

        rec = TelemetryRecord(
            timestamp=state.timestamp,
            mission_id=state.mission.get("id", "MISSION-CRATER-07"),
            episode_id=state.episodeId,
            simulation_time=state.simulationTime,
            rover_position_x=pos.get("x", 100.0),
            rover_position_y=pos.get("y", 100.0),
            velocity_vx=vel.get("vx", 0.0),
            velocity_vy=vel.get("vy", 0.0),
            heading=rover.get("heading", 0.0),
            battery=rover.get("batteryLevel", 0.94),
            battery_drain_rate=0.0001,
            rover_health=rover.get("health", "NOMINAL"),
            terrain=env.get("terrainAtRover", "FLAT"),
            weather=weather.get("state", "CLEAR"),
            visibility=weather.get("visibility", 100.0),
            communication_state=comm.get("communicationState", "AVAILABLE"),
            one_way_delay=comm.get("estimatedOneWayDelay", 750.5),
            round_trip_delay=comm.get("estimatedRoundTripDelay", 1501.0),
            current_task=current_task,
            task_progress=state.mission.get("progressPct", 0.0),
            risk_score=state.intelligenceReport.get("riskAssessment", {}).get("score", 15.0)
        )
        self._records.append(rec)
        return rec

    def get_records(self, episode_id: str = None) -> List[TelemetryRecord]:
        if episode_id:
            return [r for r in self._records if r.episode_id == episode_id]
        return list(self._records)

    def clear(self):
        self._records = []
