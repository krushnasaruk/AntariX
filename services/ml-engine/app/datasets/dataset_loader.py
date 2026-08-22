import os
import pandas as pd
from typing import Dict, Any, List

class DatasetLoader:
    def __init__(self, data_dir: str = "services/digital-twin/data"):
        self.data_dir = data_dir

    def load_telemetry_parquet(self, dataset_id: str) -> pd.DataFrame:
        file_path = os.path.join(self.data_dir, f"telemetry_{dataset_id}.parquet")
        if not os.path.exists(file_path):
            # Fallback mock DataFrame for offline testing
            return pd.DataFrame([
                {"timestamp": 100.0, "episode_id": "EP-1", "simulation_time": 0.0, "battery": 0.94, "rover_position_x": 100, "rover_position_y": 100, "next_action": "MOVE_ROVER"},
                {"timestamp": 200.0, "episode_id": "EP-1", "simulation_time": 1.0, "battery": 0.92, "rover_position_x": 102, "rover_position_y": 100, "next_action": "MOVE_ROVER"},
                {"timestamp": 300.0, "episode_id": "EP-1", "simulation_time": 2.0, "battery": 0.10, "rover_position_x": 104, "rover_position_y": 100, "next_action": "WAIT"}
            ])

        return pd.read_parquet(file_path)

    def validate_provenance(self, df: pd.DataFrame) -> bool:
        required_cols = ["episode_id", "simulation_time", "battery"]
        for c in required_cols:
            if c not in df.columns:
                return False
        return True
