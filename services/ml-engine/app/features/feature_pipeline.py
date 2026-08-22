import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from app.features.feature_schema import FeatureVector

class FeaturePipeline:
    FEATURE_NAMES = [
        "battery_remaining",
        "rover_position_x_norm",
        "rover_position_y_norm",
        "simulation_time_norm",
        "one_way_delay_norm",
        "weather_code",
        "comm_available"
    ]

    @staticmethod
    def extract_features_from_obs(obs: Dict[str, Any]) -> FeatureVector:
        rover = obs.get("rover", {})
        pos = rover.get("position", {})
        env = obs.get("environment", {})
        weather = env.get("weather", {}).get("state", "CLEAR")
        comm = obs.get("communication", {})

        w_code = 0.0
        if weather == "CLOUDY":
            w_code = 1.0
        elif weather == "DUST_STORM":
            w_code = 2.0

        comm_avail = 1.0 if comm.get("communicationState", "AVAILABLE") == "AVAILABLE" else 0.0

        return FeatureVector(
            battery_remaining=float(rover.get("batteryLevel", 0.94)),
            rover_position_x=float(pos.get("x", 100.0)),
            rover_position_y=float(pos.get("y", 100.0)),
            simulation_time=float(obs.get("simulationTime", 0.0)),
            one_way_delay=float(comm.get("estimatedOneWayDelay", 750.5)),
            weather_code=w_code,
            comm_available=comm_avail
        )

    @classmethod
    def transform_dataframe(cls, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        X = []
        y = []

        for _, row in df.iterrows():
            bat = float(row.get("battery", 0.94))
            pos_x = float(row.get("rover_position_x", 100.0))
            pos_y = float(row.get("rover_position_y", 100.0))
            sim_t = float(row.get("simulation_time", 0.0))

            feat = [
                bat,
                pos_x / 500.0,
                pos_y / 500.0,
                sim_t / 1000.0,
                750.5 / 1500.0,
                0.0,
                1.0
            ]
            X.append(feat)

            # Target label: 1 if battery <= 0.15 else 0
            label = 1 if bat <= 0.15 else 0
            y.append(label)

        return np.array(X, dtype=np.float32), np.array(y, dtype=np.int64)
