import pytest
from app.rl.mars_gym_env import MarsGymEnv
from app.rl.safety_wrapper import SafetyWrapper

def test_safety_wrapper_rejects_unsafe_rl_action():
    env = MarsGymEnv(seed=42)
    wrapped_env = SafetyWrapper(env)
    wrapped_env.reset(seed=42)

    # Manually drain battery to 0.03 (unsafe for MOVE_ROVER action=1)
    env._battery = 0.03

    next_obs, reward, terminated, truncated, info = wrapped_env.step(1) # MOVE_ROVER

    # Safety wrapper rejects action=1, overrides with action=0 (WAIT), and penalizes reward
    assert info.get("safety_override") is True
    assert info.get("original_action") == 1
    assert info.get("executed_action") == 0
    assert reward == -50.0
    assert wrapped_env.rejection_count == 1
