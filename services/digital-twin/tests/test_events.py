import pytest
from app.events.event_recorder import EventRecorder

def test_record_and_retrieve_events():
    recorder = EventRecorder()
    evt1 = recorder.record_event("EP-001", 0.0, "MISSION_STARTED", "SIM")
    evt2 = recorder.record_event("EP-001", 10.0, "TASK_COMPLETED", "SIM", {"task_id": "TASK-1"})

    assert evt1.event_type == "MISSION_STARTED"
    assert evt2.event_type == "TASK_COMPLETED"
    evts = recorder.get_events("EP-001")
    assert len(evts) == 2
    assert evts[1].payload["task_id"] == "TASK-1"
