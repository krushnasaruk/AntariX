import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_dataset_generation_api_flow():
    # 1. Generate Dataset
    payload = {
        "datasetId": "mars-comm-v1",
        "numberOfEpisodes": 5,
        "seed": 42,
        "datasetTypes": ["SUPERVISED", "TIMESERIES", "RL", "ANOMALY"]
    }
    res = client.post("/dataset/generate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["manifest"]["datasetId"] == "mars-comm-v1"
    assert data["manifest"]["episodes"] == 5
    assert data["quality"]["passed"] is True

    # 2. Get Manifest
    res_m = client.get("/dataset/mars-comm-v1/manifest")
    assert res_m.status_code == 200
    assert res_m.json()["datasetId"] == "mars-comm-v1"

    # 3. Get Quality
    res_q = client.get("/dataset/mars-comm-v1/quality")
    assert res_q.status_code == 200
    assert res_q.json()["passed"] is True

    # 4. Get Coverage
    res_c = client.get("/dataset/mars-comm-v1/coverage")
    assert res_c.status_code == 200
    assert res_c.json()["totalEpisodes"] == 5

    # 5. Dataset Health
    res_h = client.get("/dataset/health")
    assert res_h.status_code == 200
    assert res_h.json()["generatedDatasetsCount"] >= 1
