from typing import Dict, Any

class RewardFunction:
    @staticmethod
    def calculate_reward(obs: Dict[str, Any], action: int, safety_rejection: bool = False) -> float:
        reward = 0.0

        rover = obs.get("rover", {})
        battery = float(rover.get("batteryLevel", 0.94))

        if safety_rejection:
            return -50.0 # Heavy penalty for safety violation attempt

        if battery < 0.15:
            reward -= 20.0
        else:
            reward += 1.0

        # Reward sample collection / task progress
        mission = obs.get("mission", {})
        progress = float(mission.get("progressPct", 0.0))
        reward += (progress * 0.1)

        return reward
