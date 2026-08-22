import pytest
from app.rl.mars_gym_env import MarsGymEnv

def test_mars_gym_env_reset_and_step():
    env = MarsGymEnv(seed=42)
    obs, info = env.reset(seed=42)

    assert obs.shape == (7,)
    assert obs[0] == 0.94 # Battery

    next_obs, reward, terminated, truncated, info_step = env.step(1) # MOVE_ROVER
    assert next_obs.shape == (7,)
    assert isinstance(reward, float)
    assert terminated is False
