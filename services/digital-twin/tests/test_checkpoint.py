import pytest
from app.runtime.simulation_runtime import DigitalTwinRuntime

def make_obs(battery: float = 0.94, pos_x: float = 100):
    return {
        "timestamp": 1724074300000.0,
        "mission": {"id": "MISSION-CRATER-07"},
        "rover": {"position": {"x": pos_x, "y": 100}, "batteryLevel": battery, "health": "NOMINAL"},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE"}
    }

def test_checkpoint_and_restore_reproduces_future_trajectory():
    runtime = DigitalTwinRuntime()
    runtime.start_episode("EP-CP", "SCEN-CP", 42, make_obs(0.94, 100))

    runtime.step(make_obs(0.92, 110), dt=1.0)
    cp = runtime.checkpoint("CP-1")

    # Step further
    runtime.step(make_obs(0.80, 150), dt=1.0)
    assert runtime.current_state.simulationTime == 2.0
    assert runtime.current_state.rover["position"]["x"] == 150

    # Restore checkpoint
    restored_state = runtime.restore("CP-1")
    assert restored_state.simulationTime == 1.0
    assert restored_state.rover["position"]["x"] == 110
    assert runtime.clock.simulation_time == 1.0
