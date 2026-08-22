import pytest
from app.telemetry.telemetry_collector import TelemetryCollector
from app.telemetry.telemetry_buffer import TelemetryBuffer
from app.runtime.state_snapshot import StateSnapshot

def test_telemetry_collection_and_buffer():
    collector = TelemetryCollector()
    buffer = TelemetryBuffer(max_size=10)

    obs = {
        "timestamp": 1724074300000.0,
        "mission": {"id": "MISSION-CRATER-07"},
        "rover": {"position": {"x": 120, "y": 100}, "batteryLevel": 0.90},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE"}
    }
    state = StateSnapshot.capture("EP-001", "SCEN-1", 1.0, obs)

    rec = collector.collect_from_state(state)
    buffer.push(rec)

    assert rec.rover_position_x == 120
    assert rec.battery == 0.90
    assert len(collector.get_records("EP-001")) == 1
    assert len(buffer.get_window(5)) == 1
