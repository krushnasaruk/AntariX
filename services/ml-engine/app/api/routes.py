from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.config.config import ml_config
from app.registry.model_registry import ModelRegistry
from app.training.training_config import TrainingConfig
from app.training.training_runner import run_training_job
from app.inference.inference_service import InferenceService
from app.evaluation.evaluator import Evaluator, EvaluationReport
import numpy as np

router = APIRouter()
registry = ModelRegistry()
inference_service = InferenceService(registry)

class PredictRequest(BaseModel):
    modelId: str
    observation: Dict[str, Any]

class TrainRequest(BaseModel):
    experimentName: str = "mars-mission-ml"
    modelId: str = "MODEL-BATT-001"
    algorithm: str = "RANDOM_FOREST"
    datasetId: str = "mars-comm-v1"
    seed: int = 42

class PromoteRequest(BaseModel):
    status: str = "APPROVED"

class EvaluateRequest(BaseModel):
    modelId: str

@router.post("/models/predict")
async def predict_endpoint(req: PredictRequest):
    try:
        res = inference_service.predict(req.modelId, req.observation)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/models/train")
async def train_endpoint(req: TrainRequest):
    try:
        cfg = TrainingConfig(
            experimentName=req.experimentName,
            modelId=req.modelId,
            algorithm=req.algorithm,
            datasetId=req.datasetId,
            seed=req.seed
        )
        m_id = run_training_job(cfg)
        model = registry.get_model(m_id)
        return model.metadata.model_dump() if model else {"modelId": m_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models/health")
async def health_endpoint():
    return {
        "status": "ok",
        "service": ml_config.SERVICE_NAME,
        "device_info": ml_config.device_info,
        "registered_models_count": len(registry.list_models())
    }

@router.get("/models/version")
async def version_endpoint():
    return {"version": ml_config.VERSION, "framework": "PyTorch / scikit-learn / Gymnasium"}

@router.get("/models/registry")
async def list_registry():
    return [m.model_dump() for m in registry.list_models()]

@router.get("/models/{model_id}")
async def get_model_metadata(model_id: str):
    model = registry.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")
    return model.metadata.model_dump()

@router.post("/models/{model_id}/promote")
async def promote_model_endpoint(model_id: str, req: PromoteRequest):
    try:
        meta = registry.promote_model(model_id, req.status)
        return meta.model_dump()
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found.")

@router.post("/models/evaluate")
async def evaluate_model_endpoint(req: EvaluateRequest):
    model = registry.get_model(req.modelId)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{req.modelId}' not found.")

    X_dummy = np.random.randn(10, 7)
    y_dummy = np.random.randint(0, 2, size=10)

    report = Evaluator.evaluate_model(model, X_dummy, y_dummy)
    return report.model_dump()
