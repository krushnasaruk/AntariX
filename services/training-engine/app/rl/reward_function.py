from typing import Dict, Any

class RewardFunction:
    @staticmethod
    def calculate_reward(obs_dict: Dict[str, Any], action: int, safety_rejection: bool = False) -> float:
        if safety_rejection:
            return -50.0 # Strict penalty for attempting unsafe actions

        reward = 1.0 # Step reward
        rover = obs_dict.get("rover", {})
        battery = rover.get("batteryLevel", 1.0)

        if battery > 0.5:
            reward += 2.0
        elif battery < 0.15:
            reward -= 5.0

        if action == 1: # MOVE_ROVER
            reward += 3.0
        elif action == 3: # COLLECT_SAMPLE
            reward += 10.0

        return float(reward)
