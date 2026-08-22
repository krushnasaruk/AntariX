
import pytest
from app.orchestration.batch_runner import BatchRunner

def test_run_batch_simulation():
    runner = BatchRunner()
    batch_res = runner.run_batch(scenario_prefix="CRATER-07", episodes=5, seed_start=42, steps_per_episode=5)

    assert batch_res["totalEpisodes"] == 5
    assert batch_res["completedEpisodes"] == 5
    assert batch_res["totalTelemetryRows"] == 25 # 5 episodes * 5 steps
    assert len(batch_res["episodes"]) == 5
    assert batch_res["episodes"][0]["seed"] == 42
    assert batch_res["episodes"][4]["seed"] == 46
