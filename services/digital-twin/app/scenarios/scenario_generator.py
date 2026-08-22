import numpy as np
from app.scenarios.scenario_schema import ScenarioConfig

class ScenarioGenerator:
    @staticmethod
    def generate_scenario(scenario_id: str, seed: int, battery: float = 0.94, weather: str = "CLEAR") -> ScenarioConfig:
        rng = np.random.default_rng(seed)
        terrain_var = float(rng.uniform(0.0, 0.1))
        sensor_noise = float(rng.uniform(0.0, 0.05))

        return ScenarioConfig(
            scenarioId=scenario_id,
            seed=seed,
            mission="MISSION-CRATER-07",
            initialBattery=battery,
            weather=weather,
            communication="AVAILABLE",
            roverHealth="NOMINAL",
            terrainVariation=round(terrain_var, 3),
            sensorNoise=round(sensor_noise, 3)
        )
