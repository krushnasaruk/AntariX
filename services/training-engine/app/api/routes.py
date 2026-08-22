from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.config import config
from app.models.training_job import TrainingJob, JobStatus
from app.models.training_result import TrainingResult
from app.workers.worker_registry import WorkerRegistry, WorkerNode
from app.workers.gpu_capabilities import GPUCapabilities
from app.datasets.dataset_manifest import DatasetManifest
from app.datasets.split_validator import SplitValidator
from app.training.checkpoint_manager import CheckpointManager
from app.training.supervised_trainer import SupervisedTrainer
from app.training.rl_trainer import RLTrainer
from app.training.evaluation import ModelEvaluatorGate

router = APIRouter()
worker_registry = WorkerRegistry()
checkpoint_manager = CheckpointManager()

# In-memory job queue & results
job_db: Dict[str, TrainingJob] = {}
results_db: Dict[str, TrainingResult] = {}

class CreateJobRequest(BaseModel):
    jobId: str
    experimentId: str = "EXP-001"
    modelType: str = "SUPERVISED" # SUPERVISED or RL
    algorithm: str = "RANDOM_FOREST"
    datasetVersion: str = "dataset-v1"
    environmentVersion: str = "mars-gym-v1"
    seed: int = 42
    epochs: int = 10

class RegisterWorkerRequest(BaseModel):
    workerId: str
    hostname: str = "rtx-4050-worker"

class HeartbeatRequest(BaseModel):
    workerId: str

@router.get("/health")
async def health_endpoint():
    return {
        "status": "ok",
        "service": config.SERVICE_NAME,
        "device_info": config.device_info,
        "jobsCount": len(job_db),
        "activeWorkersCount": len(worker_registry.list_workers())
    }

@router.get("/version")
async def version_endpoint():
    return {"version": config.VERSION, "framework": "PyTorch / Gymnasium / Stable-Baselines3"}

@router.post("/training/jobs")
async def create_job(req: CreateJobRequest):
    job = TrainingJob(
        jobId=req.jobId,
        experimentId=req.experimentId,
        modelType=req.modelType,
        algorithm=req.algorithm,
        datasetVersion=req.datasetVersion,
        environmentVersion=req.environmentVersion,
        seed=req.seed,
        epochs=req.epochs,
        status=JobStatus.QUEUED
    )
    job_db[req.jobId] = job
    return job.model_dump()

@router.get("/training/jobs")
async def list_jobs():
    return [j.model_dump() for j in job_db.values()]

@router.get("/training/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in job_db:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return job_db[job_id].model_dump()

@router.post("/training/jobs/{job_id}/start")
async def start_job(job_id: str):
    if job_id not in job_db:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    job = job_db[job_id]
    job.status = JobStatus.RUNNING

    if job.modelType == "RL":
        res = RLTrainer.train_job(job)
    else:
        res = SupervisedTrainer.train_job(job)

    results_db[job_id] = res
    job.status = JobStatus.COMPLETED

    return {"job": job.model_dump(), "result": res.model_dump()}

@router.post("/training/jobs/{job_id}/checkpoint")
async def create_checkpoint(job_id: str):
    if job_id not in job_db:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")

    path = checkpoint_manager.save_checkpoint(job_id, epoch=1, state_dict={"weights": [0.1, 0.2]})
    return {"jobId": job_id, "checkpointPath": path, "status": "CHECKPOINTED"}

@router.post("/training/jobs/{job_id}/resume")
async def resume_job(job_id: str):
    cp = checkpoint_manager.load_checkpoint(job_id)
    if not cp:
        raise HTTPException(status_code=404, detail=f"No checkpoint found for job '{job_id}'.")
    return {"jobId": job_id, "resumedEpoch": cp.get("epoch"), "status": "RESUMED"}

@router.post("/workers/register")
async def register_worker(req: RegisterWorkerRequest):
    node = worker_registry.register_worker(req.workerId, req.hostname)
    return node.model_dump()

@router.post("/workers/heartbeat")
async def worker_heartbeat(req: HeartbeatRequest):
    ok = worker_registry.heartbeat(req.workerId)
    if not ok:
        raise HTTPException(status_code=404, detail=f"Worker '{req.workerId}' not registered.")
    return {"workerId": req.workerId, "status": "ALIVE"}

@router.get("/workers")
async def list_workers():
    return [w.model_dump() for w in worker_registry.list_workers()]

@router.get("/workers/capabilities")
async def get_worker_capabilities():
    return GPUCapabilities.detect().model_dump()

@router.post("/models/{model_id}/evaluate")
async def evaluate_model_endpoint(model_id: str):
    res = results_db.get(model_id)
    res_dict = res.model_dump() if res else {}
    eval_res = ModelEvaluatorGate.evaluate_result(res_dict)
    return eval_res

@router.post("/models/{model_id}/approve")
async def approve_model_endpoint(model_id: str):
    return {"modelId": model_id, "status": "APPROVED"}
