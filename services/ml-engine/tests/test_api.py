import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_models_health():
    res = client.get("/models/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert "device_info" in data

def test_models_version():
    res = client.get("/models/version")
    assert res.status_code == 200
    assert "version" in res.json()

def test_models_train_predict_promote():
    # 1. Train model
    train_res = client.post("/models/train", json={"experimentName": "test-exp", "modelId": "M-API-001", "algorithm": "RANDOM_FOREST"})
    assert train_res.status_code == 200
    assert train_res.json()["modelId"] == "M-API-001"

    # 2. Predict
    obs = {
        "timestamp": 100.0,
        "rover": {"position": {"x": 100, "y": 100}, "batteryLevel": 0.94},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE"}
    }
    pred_res = client.post("/models/predict", json={"modelId": "M-API-001", "observation": obs})
    assert pred_res.status_code == 200
    data_p = pred_res.json()
    assert data_p["modelId"] == "M-API-001"
    assert "prediction" in data_p

    # 3. Promote
    prom_res = client.post("/models/M-API-001/promote", json={"status": "APPROVED"})
    assert prom_res.status_code == 200
    assert prom_res.json()["status"] == "APPROVED"
