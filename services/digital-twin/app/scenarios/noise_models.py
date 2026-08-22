import copy
from typing import Dict, Any
from app.scenarios.scenario_seed import SeedContext

class NoiseModel:
    def __init__(self, seed: int = 42, sigma: float = 0.02, dropout_prob: float = 0.01):
        self.seed_ctx = SeedContext(seed)
        self.rng = self.seed_ctx.spawn_rng("sensor_noise")
        self.sigma = sigma
        self.dropout_prob = dropout_prob

    def apply_noise(self, ground_truth_state: Dict[str, Any]) -> Dict[str, Any]:
        observed = copy.deepcopy(ground_truth_state)

        # Apply noise to battery observation without mutating ground truth
        rover = observed.get("rover", {})
        if "batteryLevel" in rover:
            clean_bat = float(rover["batteryLevel"])
            noise = float(self.rng.normal(0.0, self.sigma))
            noisy_bat = max(0.0, min(1.0, clean_bat + noise))
            rover["batteryLevel"] = round(noisy_bat, 4)

        # Apply position noise
        pos = rover.get("position", {})
        if "x" in pos and "y" in pos:
            pos["x"] += round(float(self.rng.normal(0.0, 0.5)), 2)
            pos["y"] += round(float(self.rng.normal(0.0, 0.5)), 2)

        return observed
