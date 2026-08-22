import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_training_engine_health_and_version():
    h = client.get("/health")
    assert h.status_code == 200
    assert h.json()["status"] == "ok"

    v = client.get("/version")
    assert v.status_code == 200
    assert "version" in v.json()

def test_job_lifecycle_api():
    # 1. Create job
    c_res = client.post("/training/jobs", json={"jobId": "J-API-1", "modelType": "RL", "algorithm": "PPO"})
    assert c_res.status_code == 200
    assert c_res.json()["jobId"] == "J-API-1"

    # 2. Get job
    g_res = client.get("/training/jobs/J-API-1")
    assert g_res.status_code == 200
    assert g_res.json()["status"] == "QUEUED"

    # 3. Start job
    s_res = client.post("/training/jobs/J-API-1/start")
    assert s_res.status_code == 200
    assert s_res.json()["job"]["status"] == "COMPLETED"

    # 4. Checkpoint
    cp_res = client.post("/training/jobs/J-API-1/checkpoint")
    assert cp_res.status_code == 200

    # 5. Resume
    r_res = client.post("/training/jobs/J-API-1/resume")
    assert r_res.status_code == 200

def test_worker_registration_api():
    # 1. Register worker
    w_res = client.post("/workers/register", json={"workerId": "W-GPU-1", "hostname": "rtx-4050-laptop"})
    assert w_res.status_code == 200
    assert w_res.json()["workerId"] == "W-GPU-1"

    # 2. Heartbeat
    hb_res = client.post("/workers/heartbeat", json={"workerId": "W-GPU-1"})
    assert hb_res.status_code == 200
    assert hb_res.json()["status"] == "ALIVE"

    # 3. Capabilities
    cap_res = client.get("/workers/capabilities")
    assert cap_res.status_code == 200
    assert "device" in cap_res.json()
