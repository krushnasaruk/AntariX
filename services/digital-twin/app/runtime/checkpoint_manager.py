import copy
from typing import Dict, Any, Optional

class CheckpointManager:
    def __init__(self):
        self._checkpoints: Dict[str, Dict[str, Any]] = {}

    def checkpoint(self, checkpoint_id: str, state_data: Dict[str, Any], rng_state: Any = None) -> Dict[str, Any]:
        cp_data = {
            "checkpoint_id": checkpoint_id,
            "timestamp": state_data.get("timestamp", 0.0),
            "simulation_time": state_data.get("simulationTime", 0.0),
            "state": copy.deepcopy(state_data),
            "rng_state": copy.deepcopy(rng_state)
        }
        self._checkpoints[checkpoint_id] = cp_data
        return cp_data

    def restore(self, checkpoint_id: str) -> Optional[Dict[str, Any]]:
        cp = self._checkpoints.get(checkpoint_id)
        if not cp:
            return None
        return copy.deepcopy(cp)

    def get_checkpoint_ids(self) -> list:
        return list(self._checkpoints.keys())

    def clear_checkpoints(self):
        self._checkpoints = {}
