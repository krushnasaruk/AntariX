import gymnasium as gym
from typing import Tuple, Any
from app.rl.reward_function import RewardFunction

class SafetyWrapper(gym.Wrapper):
    """
    Enforces Objective 5 SafetyValidator gatekeeping over RL policy actions.
    If RL policy proposes an unsafe action (e.g. MOVE_ROVER when battery < 0.05),
    the safety wrapper overrides the action with WAIT and penalizes the policy.
    """
    def __init__(self, env: gym.Env):
        super().__init__(env)
        self.rejection_count = 0

    def step(self, action: int) -> Tuple[Any, float, bool, bool, dict]:
        # Perform physical safety check on current battery
        current_bat = getattr(self.env, "_battery", 0.94)

        safety_rejection = False
        actual_action = action

        # Rule: Cannot MOVE_ROVER if battery < 0.05
        if action == 1 and current_bat < 0.05:
            actual_action = 0 # Override with WAIT
            safety_rejection = True
            self.rejection_count += 1

        obs, reward, terminated, truncated, info = self.env.step(actual_action)

        if safety_rejection:
            reward = RewardFunction.calculate_reward(info.get("obs_dict", {}), action, safety_rejection=True)
            info["safety_override"] = True
            info["original_action"] = action
            info["executed_action"] = 0

        return obs, reward, terminated, truncated, info
