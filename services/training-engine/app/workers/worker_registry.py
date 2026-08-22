import time
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.workers.gpu_capabilities import GPUCapabilities

class WorkerNode(BaseModel):
    workerId: str
    hostname: str = "rtx-4050-worker"
    capabilities: GPUCapabilities = Field(default_factory=GPUCapabilities.detect)
    status: str = "IDLE" # IDLE, BUSY, OFFLINE
    lastHeartbeat: float = Field(default_factory=time.time)
    claimedJobId: Optional[str] = None

class WorkerRegistry:
    def __init__(self):
        self._workers: Dict[str, WorkerNode] = {}

    def register_worker(self, worker_id: str, hostname: str = "worker-1", capabilities: Optional[GPUCapabilities] = None) -> WorkerNode:
        caps = capabilities or GPUCapabilities.detect()
        node = WorkerNode(
            workerId=worker_id,
            hostname=hostname,
            capabilities=caps,
            status="IDLE",
            lastHeartbeat=time.time()
        )
        self._workers[worker_id] = node
        return node

    def heartbeat(self, worker_id: str) -> bool:
        if worker_id in self._workers:
            self._workers[worker_id].lastHeartbeat = time.time()
            if self._workers[worker_id].status == "OFFLINE":
                self._workers[worker_id].status = "IDLE"
            return True
        return False

    def get_worker(self, worker_id: str) -> Optional[WorkerNode]:
        return self._workers.get(worker_id)

    def list_workers(self) -> List[WorkerNode]:
        now = time.time()
        for w in self._workers.values():
            if now - w.lastHeartbeat > 30.0:
                w.status = "OFFLINE"
        return list(self._workers.values())
