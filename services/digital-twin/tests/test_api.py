import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_twin_health():
    res = client.get("/twin/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["service"] == "digital-twin"

def test_get_twin_version():
    res = client.get("/twin/version")
    assert res.status_code == 200
    assert "version" in res.json()
    assert "schema_version" in res.json()

def test_episode_start_step_checkpoint_restore_terminate():
    start_payload = {
        "episodeId": "EP-API-001",
        "scenarioId": "SCEN-API-001",
        "seed": 42,
        "initialObservation": {
            "timestamp": 1724074300000.0,
            "mission": {"id": "MISSION-CRATER-07"},
            "rover": {"position": {"x": 100, "y": 100}, "batteryLevel": 0.94},
            "environment": {"weather": {"state": "CLEAR"}},
            "communication": {"communicationState": "AVAILABLE"}
        }
    }
    r1 = client.post("/twin/episode/start", json=start_payload)
    assert r1.status_code == 200

    step_payload = {
        "dt": 1.0,
        "observation": {
            "timestamp": 1724074301000.0,
            "mission": {"id": "MISSION-CRATER-07"},
            "rover": {"position": {"x": 102, "y": 100}, "batteryLevel": 0.92},
            "environment": {"weather": {"state": "CLEAR"}},
            "communication": {"communicationState": "AVAILABLE"}
        }
    }
    r2 = client.post("/twin/episode/EP-API-001/step", json=step_payload)
    assert r2.status_code == 200
    assert r2.json()["simulationTime"] == 1.0

    # Checkpoint
    r3 = client.post("/twin/episode/EP-API-001/checkpoint", json={"checkpointId": "CP-API-1"})
    assert r3.status_code == 200

    # Step further
    step_payload2 = {
        "dt": 1.0,
        "observation": {
            "timestamp": 1724074302000.0,
            "mission": {"id": "MISSION-CRATER-07"},
            "rover": {"position": {"x": 105, "y": 100}, "batteryLevel": 0.90},
            "environment": {"weather": {"state": "CLEAR"}},
            "communication": {"communicationState": "AVAILABLE"}
        }
    }
    client.post("/twin/episode/EP-API-001/step", json=step_payload2)

    # Restore
    r4 = client.post("/twin/episode/EP-API-001/restore", json={"checkpointId": "CP-API-1"})
    assert r4.status_code == 200
    assert r4.json()["simulationTime"] == 1.0

    # Terminate
    r5 = client.post("/twin/episode/EP-API-001/terminate", json={"reason": "COMPLETED", "success": True})
    assert r5.status_code == 200
    assert r5.json()["success"] is True

def test_twin_batch_api():
    payload = {
        "scenarioPrefix": "API-BATCH",
        "episodes": 3,
        "seedStart": 10,
        "stepsPerEpisode": 3
    }
    res = client.post("/twin/batch", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["totalEpisodes"] == 3
    assert data["totalTelemetryRows"] == 9
