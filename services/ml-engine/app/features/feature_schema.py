from pydantic import BaseModel, Field
from typing import List

class FeatureVector(BaseModel):
    feature_version: str = "v1"
    battery_remaining: float
    rover_position_x: float
    rover_position_y: float
    simulation_time: float
    one_way_delay: float = 750.5
    weather_code: float = 0.0 # 0: CLEAR, 1: CLOUDY, 2: DUST_STORM
    comm_available: float = 1.0

    def to_list(self) -> List[float]:
        return [
            self.battery_remaining,
            self.rover_position_x / 500.0,
            self.rover_position_y / 500.0,
            self.simulation_time / 1000.0,
            self.one_way_delay / 1500.0,
            self.weather_code,
            self.comm_available
        ]
