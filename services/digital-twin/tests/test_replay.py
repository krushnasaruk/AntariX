import pytest
from app.replay.deterministic_replay import DeterministicReplay

def test_replay_comparison_identical_vs_divergent():
    expected = [
        {"simulation_time": 0.0, "battery": 0.94, "rover_position_x": 100},
        {"simulation_time": 1.0, "battery": 0.92, "rover_position_x": 110}
    ]
    actual_identical = [
        {"simulation_time": 0.0, "battery": 0.94, "rover_position_x": 100},
        {"simulation_time": 1.0, "battery": 0.92, "rover_position_x": 110}
    ]
    actual_divergent = [
        {"simulation_time": 0.0, "battery": 0.94, "rover_position_x": 100},
        {"simulation_time": 1.0, "battery": 0.85, "rover_position_x": 110}
    ]

    ok1, diffs1 = DeterministicReplay.compare_trajectories(expected, actual_identical)
    assert ok1 is True
    assert len(diffs1) == 0

    ok2, diffs2 = DeterministicReplay.compare_trajectories(expected, actual_divergent)
    assert ok2 is False
    assert len(diffs2) == 1
    assert diffs2[0]["differences"]["battery"]["expected"] == 0.92
    assert diffs2[0]["differences"]["battery"]["actual"] == 0.85
