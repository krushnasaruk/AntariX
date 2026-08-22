import pytest
from app.datasets.dataset_validator import DatasetValidator

def test_dataset_validator_detects_invalid_battery_and_jumps():
    valid_records = [
        {"episode_id": "EP-1", "simulation_time": 0.0, "battery": 0.94, "rover_position_x": 100.0, "rover_position_y": 100.0},
        {"episode_id": "EP-1", "simulation_time": 1.0, "battery": 0.92, "rover_position_x": 102.0, "rover_position_y": 100.0}
    ]
    invalid_records = [
        {"episode_id": "EP-1", "simulation_time": 0.0, "battery": 1.50, "rover_position_x": 100.0, "rover_position_y": 100.0}, # Invalid battery > 1
        {"episode_id": "EP-1", "simulation_time": 1.0, "battery": 0.92, "rover_position_x": 300.0, "rover_position_y": 100.0}  # Impossible 200m jump
    ]

    q1 = DatasetValidator.validate_records("DS-VAL-1", valid_records)
    assert q1.passed is True
    assert q1.qualityScore == 100.0

    q2 = DatasetValidator.validate_records("DS-VAL-2", invalid_records)
    assert q2.passed is False
    assert q2.invalidBatteryCount == 1
    assert q2.coordinateJumps == 1
