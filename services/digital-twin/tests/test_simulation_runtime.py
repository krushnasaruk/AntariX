import pytest
from app.runtime.simulation_runtime import DigitalTwinRuntime

def make_sample_obs(battery: float = 0.94):
    return {
        "timestamp": 1724074300000.0,
        "mission": {"id": "MISSION-CRATER-07", "status": "IN_PROGRESS"},
        "rover": {"position": {"x": 100, "y": 100}, "batteryLevel": battery, "health": "NOMINAL"},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE"}
    }

def test_runtime_episode_lifecycle():
    runtime = DigitalTwinRuntime()
    obs = make_sample_obs()

    rec = runtime.start_episode("EP-001", "CRATER-07", 42, obs)
    assert rec.episode_id == "EP-001"
    assert runtime.active_episode_id == "EP-001"

    st = runtime.step(obs, dt=1.0)
    assert st.simulationTime == 1.0

    term = runtime.terminate_episode("COMPLETED", success=True)
    assert term.success is True
    assert runtime.active_episode_id is None
