import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_post_learn_experience_endpoint():
    payload = {
        "experienceId": "EXP-TEST-001",
        "missionId": "MISSION-CRATER-07",
        "actionType": "MOVE_ROVER",
        "actionSuccess": True,
        "batteryBefore": 0.90,
        "batteryAfter": 0.88,
        "planStrategy": "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
    }
    response = client.post("/learn/experience", json=payload)
    assert response.status_code == 200
    assert response.json()["experienceId"] == "EXP-TEST-001"

def test_post_learn_analyze_endpoint():
    payload = {
        "observation": {
            "timestamp": time.time() * 1000,
            "rover": {"batteryLevel": 0.94, "health": "NOMINAL"},
            "environment": {"weather": {"state": "CLEAR"}},
            "communication": {"communicationState": "AVAILABLE"}
        },
        "candidateStrategies": ["SAFE_SAMPLE_ACQUISITION_AND_RETURN", "DIRECT_SAMPLE"]
    }
    response = client.post("/learn/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "strategyPerformances" in data
    assert "failurePatterns" in data

def test_get_learn_endpoints():
    r1 = client.get("/learn/strategies")
    assert r1.status_code == 200
    assert isinstance(r1.json(), list)

    r2 = client.get("/learn/failures")
    assert r2.status_code == 200
    assert isinstance(r2.json(), list)

    r3 = client.get("/learn/statistics")
    assert r3.status_code == 200
    assert "totalExperiences" in r3.json()

    r4 = client.get("/learn/health")
    assert r4.status_code == 200
    assert r4.json()["learning_engine"] == "active"
