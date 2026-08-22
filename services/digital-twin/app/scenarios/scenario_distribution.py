from pydantic import BaseModel, Field
from typing import List, Tuple

class ScenarioDistribution(BaseModel):
    battery_min: float = 0.50
    battery_max: float = 1.00
    battery_drain_multiplier_min: float = 0.8
    battery_drain_multiplier_max: float = 2.0
    weather_probabilities: List[Tuple[str, float]] = Field(default=[("CLEAR", 0.70), ("CLOUDY", 0.15), ("DUST_STORM", 0.15)])
    comm_blackout_probability: float = 0.10
    one_way_delay_min: float = 240.0
    one_way_delay_max: float = 1320.0
    obstacle_density: float = 0.05
    hazard_density: float = 0.02
    sensor_noise_sigma: float = 0.02
    fault_probability: float = 0.20
