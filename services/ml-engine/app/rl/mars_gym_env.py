import gymnasium as gym
from gymnasium import spaces
import numpy as np
from typing import Dict, Any, Tuple
from app.rl.reward_function import RewardFunction

class MarsGymEnv(gym.Env):
    metadata = {"render_modes": []}

    # Action space mapping:
    # 0: WAIT, 1: MOVE_ROVER, 2: START_TASK, 3: COLLECT_SAMPLE, 4: RETURN_TO_BASE
    ACTION_MAP = {
        0: "WAIT",
        1: "MOVE_ROVER",
        2: "START_TASK",
        3: "COLLECT_SAMPLE",
        4: "RETURN_TO_BASE"
    }

    def __init__(self, seed: int = 42):
        super().__init__()
        self.seed_val = seed
        self._rng = np.random.default_rng(seed)

        # 7-dim continuous observation space
        self.observation_space = spaces.Box(
            low=np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], dtype=np.float32),
            high=np.array([1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0], dtype=np.float32),
            dtype=np.float32
        )

        # 5 discrete actions
        self.action_space = spaces.Discrete(5)

        self._sim_step = 0
        self._battery = 0.94
        self._pos_x = 100.0
        self._pos_y = 100.0

    def reset(self, seed: int = None, options: dict = None) -> Tuple[np.ndarray, dict]:
        if seed is not None:
            self._rng = np.random.default_rng(seed)

        self._sim_step = 0
        self._battery = 0.94
        self._pos_x = 100.0
        self._pos_y = 100.0

        obs = self._get_obs_vector()
        return obs, {}

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, bool, dict]:
        self._sim_step += 1
        self._battery = max(0.0, self._battery - 0.02)

        if action == 1: # MOVE_ROVER
            self._pos_x += 5.0

        obs_dict = {
            "rover": {"position": {"x": self._pos_x, "y": self._pos_y}, "batteryLevel": self._battery},
            "mission": {"progressPct": round((self._sim_step / 20) * 100, 1)},
            "simulationTime": float(self._sim_step)
        }

        reward = RewardFunction.calculate_reward(obs_dict, action)
        terminated = self._battery <= 0.0 or self._sim_step >= 20
        truncated = False

        return self._get_obs_vector(), reward, terminated, truncated, {"obs_dict": obs_dict}

    def _get_obs_vector(self) -> np.ndarray:
        return np.array([
            self._battery,
            self._pos_x / 500.0,
            self._pos_y / 500.0,
            self._sim_step / 20.0,
            0.5,
            0.0,
            1.0
        ], dtype=np.float32)
