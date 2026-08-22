import pytest
import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_health():
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "ok"
    assert json_data["service"] == "ai-engine"

def test_get_version():
    response = client.get("/version")
    assert response.status_code == 200
    assert "version" in response.json()

def test_post_analyze_endpoint():
    payload = {
        "timestamp": time.time() * 1000,
        "rover": {"batteryLevel": 0.94, "health": "NOMINAL"},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE", "distanceKm": 225000000.0, "estimatedOneWayDelay": 750.5}
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    report = response.json()
    assert "riskAssessment" in report
    assert "predictions" in report
    assert "missionHealth" in report
    assert report["riskAssessment"]["overallRisk"] == "LOW"

def test_invalid_observation_rejection():
    invalid_payload = {"timestamp": "invalid_number"}
    response = client.post("/analyze", json=invalid_payload)
    assert response.status_code == 422
