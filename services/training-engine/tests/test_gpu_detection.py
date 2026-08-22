import pytest
from app.workers.gpu_capabilities import GPUCapabilities
from app.workers.worker_registry import WorkerRegistry

def test_gpu_capabilities_detection():
    caps = GPUCapabilities.detect()
    assert caps.device in ["cpu", "cuda"]
    assert isinstance(caps.cudaAvailable, bool)

def test_worker_registry_and_heartbeat():
    reg = WorkerRegistry()
    node = reg.register_worker("W1", "rtx-4050-laptop")
    assert node.workerId == "W1"
    assert node.status == "IDLE"

    ok = reg.heartbeat("W1")
    assert ok is True

    workers = reg.list_workers()
    assert len(workers) == 1
