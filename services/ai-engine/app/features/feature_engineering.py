import numpy as np
import pandas as pd
from typing import List, Dict, Any

class FeatureEngineer:
    @staticmethod
    def calculate_battery_drain_rate(battery_history: List[float], dt_seconds: float = 1.0) -> float:
        """Calculates battery drain rate per second using NumPy diff."""
        if len(battery_history) < 2:
            return 0.0
        arr = np.array(battery_history, dtype=np.float64)
        diffs = np.diff(arr)
        return float(np.mean(diffs) / dt_seconds)

    @staticmethod
    def compute_kinematic_deviation(expected_pos: Dict[str, float], actual_pos: Dict[str, float]) -> float:
        """Computes Euclidean distance deviation between expected and actual position."""
        dx = expected_pos.get("x", 0.0) - actual_pos.get("x", 0.0)
        dy = expected_pos.get("y", 0.0) - actual_pos.get("y", 0.0)
        return float(np.sqrt(dx * dx + dy * dy))
