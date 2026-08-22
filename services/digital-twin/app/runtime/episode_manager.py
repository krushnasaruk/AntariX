from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

class EpisodeRecord(BaseModel):
    episode_id: str
    scenario_id: str
    seed: int
    start_time: float
    end_time: float = 0.0
    duration: float = 0.0
    initial_state: Dict[str, Any] = Field(default_factory=dict)
    final_state: Dict[str, Any] = Field(default_factory=dict)
    termination_reason: str = "IN_PROGRESS"
    success: bool = False
    telemetry_reference: str = ""
    event_reference: str = ""
    action_history: List[Dict[str, Any]] = Field(default_factory=list)
    decision_history: List[Dict[str, Any]] = Field(default_factory=list)

class EpisodeManager:
    def __init__(self):
        self._episodes: Dict[str, EpisodeRecord] = {}

    def create_episode(self, episode_id: str, scenario_id: str, seed: int, initial_state: Dict[str, Any]) -> EpisodeRecord:
        ep = EpisodeRecord(
            episode_id=episode_id,
            scenario_id=scenario_id,
            seed=seed,
            start_time=initial_state.get("timestamp", 0.0),
            initial_state=initial_state,
            telemetry_reference=f"telemetry/ep_{episode_id}.parquet",
            event_reference=f"events/ep_{episode_id}.parquet"
        )
        self._episodes[episode_id] = ep
        return ep

    def get_episode(self, episode_id: str) -> Optional[EpisodeRecord]:
        return self._episodes.get(episode_id)

    def terminate_episode(self, episode_id: str, final_state: Dict[str, Any], reason: str = "COMPLETED", success: bool = True) -> EpisodeRecord:
        ep = self._episodes.get(episode_id)
        if not ep:
            raise KeyError(f"Episode '{episode_id}' not found.")

        ep.end_time = final_state.get("timestamp", ep.start_time)
        ep.duration = round(final_state.get("simulationTime", 0.0), 2)
        ep.final_state = final_state
        ep.termination_reason = reason
        ep.success = success
        return ep

    def list_episodes(self) -> List[EpisodeRecord]:
        return list(self._episodes.values())
