from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from app.runtime.simulation_runtime import DigitalTwinRuntime
from app.runtime.state_snapshot import TwinState
from app.telemetry.telemetry_collector import TelemetryCollector
from app.events.event_recorder import EventRecorder
from app.replay.deterministic_replay import DeterministicReplay
from app.orchestration.batch_runner import BatchRunner
from app.config import config

router = APIRouter()
runtime = DigitalTwinRuntime()
collector = TelemetryCollector()
recorder = EventRecorder()
batch_runner = BatchRunner()

class StartEpisodeRequest(BaseModel):
    episodeId: str
    scenarioId: str
    seed: int = 42
    initialObservation: Dict[str, Any]

class StepEpisodeRequest(BaseModel):
    dt: float = 1.0
    observation: Dict[str, Any]
    decision: Optional[Dict[str, Any]] = None
    intelligence: Optional[Dict[str, Any]] = None
    learning: Optional[Dict[str, Any]] = None
    safety: Optional[Dict[str, Any]] = None

class CheckpointRequest(BaseModel):
    checkpointId: str

class RestoreRequest(BaseModel):
    checkpointId: str

class TerminateRequest(BaseModel):
    reason: str = "COMPLETED"
    success: bool = True

class ReplayRequest(BaseModel):
    expectedTrajectory: List[Dict[str, Any]]
    actualTrajectory: List[Dict[str, Any]]

class BatchRequest(BaseModel):
    scenarioPrefix: str = "CRATER-07"
    episodes: int = 10
    seedStart: int = 0
    stepsPerEpisode: int = 10

@router.post("/twin/episode/start")
async def start_episode(req: StartEpisodeRequest):
    try:
        rec = runtime.start_episode(req.episodeId, req.scenarioId, req.seed, req.initialObservation)
        recorder.record_event(req.episodeId, 0.0, "MISSION_STARTED", "API")
        return rec.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/twin/episode/{episode_id}/step")
async def step_episode(episode_id: str, req: StepEpisodeRequest):
    try:
        state = runtime.step(
            req.observation,
            dt=req.dt,
            decision=req.decision,
            intelligence=req.intelligence,
            learning=req.learning,
            safety=req.safety
        )
        collector.collect_from_state(state)
        return state.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/twin/episode/{episode_id}/pause")
async def pause_episode(episode_id: str):
    runtime.clock.pause()
    recorder.record_event(episode_id, runtime.clock.simulation_time, "MISSION_PAUSED", "API")
    return {"status": "paused", "episodeId": episode_id}

@router.post("/twin/episode/{episode_id}/resume")
async def resume_episode(episode_id: str):
    runtime.clock.resume()
    recorder.record_event(episode_id, runtime.clock.simulation_time, "MISSION_RESUMED", "API")
    return {"status": "resumed", "episodeId": episode_id}

@router.post("/twin/episode/{episode_id}/checkpoint")
async def checkpoint_episode(episode_id: str, req: CheckpointRequest):
    try:
        cp = runtime.checkpoint(req.checkpointId)
        return cp
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/twin/episode/{episode_id}/restore")
async def restore_episode(episode_id: str, req: RestoreRequest):
    try:
        state = runtime.restore(req.checkpointId)
        return state.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/twin/episode/{episode_id}/terminate")
async def terminate_episode(episode_id: str, req: TerminateRequest):
    try:
        rec = runtime.terminate_episode(reason=req.reason, success=req.success)
        recorder.record_event(episode_id, runtime.clock.simulation_time, "MISSION_COMPLETED" if req.success else "MISSION_ABORTED", "API")
        return rec.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/twin/episode/{episode_id}/state")
async def get_episode_state(episode_id: str):
    if not runtime.current_state:
        raise HTTPException(status_code=404, detail="No state found.")
    return runtime.current_state.model_dump()

@router.get("/twin/episode/{episode_id}/telemetry")
async def get_episode_telemetry(episode_id: str):
    recs = collector.get_records(episode_id)
    return [r.model_dump() for r in recs]

@router.get("/twin/episode/{episode_id}/events")
async def get_episode_events(episode_id: str):
    evts = recorder.get_events(episode_id)
    return [e.model_dump() for e in evts]

@router.post("/twin/replay")
async def replay_comparison(req: ReplayRequest):
    reproducible, diffs = DeterministicReplay.compare_trajectories(req.expectedTrajectory, req.actualTrajectory)
    return {"reproducible": reproducible, "divergences": diffs}

@router.post("/twin/batch")
async def run_batch_simulation(req: BatchRequest):
    res = batch_runner.run_batch(
        scenario_prefix=req.scenarioPrefix,
        episodes=req.episodes,
        seed_start=req.seedStart,
        steps_per_episode=req.stepsPerEpisode
    )
    return res

@router.get("/twin/health")
async def twin_health():
    return {
        "status": "ok",
        "service": config.SERVICE_NAME,
        "active_episode": runtime.active_episode_id,
        "simulation_time": runtime.clock.simulation_time
    }

@router.get("/twin/version")
async def twin_version():
    return {"version": config.VERSION, "schema_version": config.SCHEMA_VERSION}

# DATASET FACTORY ENDPOINTS (Objective 10)
from app.datasets.dataset_builder import DatasetBuilder
from app.datasets.dataset_validator import DatasetValidator
from app.datasets.dataset_splitter import DatasetSplitter
from app.datasets.dataset_coverage import CoverageAnalyzer

dataset_builder = DatasetBuilder()
generated_datasets: Dict[str, Any] = {}

class GenerateDatasetRequest(BaseModel):
    datasetId: str = "mars-comm-v1"
    numberOfEpisodes: int = 10
    seed: int = 42
    datasetTypes: List[str] = ["SUPERVISED", "TIMESERIES", "RL", "ANOMALY"]

class ValidateDatasetRequest(BaseModel):
    datasetId: str
    records: List[Dict[str, Any]]

class SplitDatasetRequest(BaseModel):
    episodeIds: List[str]
    seed: int = 42
    trainRatio: float = 0.70
    valRatio: float = 0.15

@router.get("/dataset/health")
async def dataset_health():
    return {
        "status": "ok",
        "service": "dataset-factory",
        "generatedDatasetsCount": len(generated_datasets)
    }

@router.post("/dataset/generate")
async def generate_dataset(req: GenerateDatasetRequest):
    try:
        manifest, quality, data = dataset_builder.build_dataset(
            dataset_id=req.datasetId,
            num_episodes=req.numberOfEpisodes,
            seed=req.seed,
            dataset_types=req.datasetTypes
        )
        coverage = CoverageAnalyzer.analyze_scenarios(data["scenarios"])

        generated_datasets[req.datasetId] = {
            "manifest": manifest,
            "quality": quality,
            "coverage": coverage,
            "data": data
        }

        return {
            "manifest": manifest.model_dump(),
            "quality": quality.model_dump(),
            "coverage": coverage.model_dump()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/dataset/validate")
async def validate_dataset(req: ValidateDatasetRequest):
    q = DatasetValidator.validate_records(req.datasetId, req.records)
    return q.model_dump()

@router.post("/dataset/split")
async def split_dataset(req: SplitDatasetRequest):
    res = DatasetSplitter.split_episodes(req.episodeIds, seed=req.seed, train_ratio=req.trainRatio, val_ratio=req.valRatio)
    return res

@router.get("/dataset/{dataset_id}")
async def get_dataset(dataset_id: str):
    if dataset_id not in generated_datasets:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    ds = generated_datasets[dataset_id]
    return {
        "manifest": ds["manifest"].model_dump(),
        "quality": ds["quality"].model_dump(),
        "coverage": ds["coverage"].model_dump()
    }

@router.get("/dataset/{dataset_id}/quality")
async def get_dataset_quality(dataset_id: str):
    if dataset_id not in generated_datasets:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return generated_datasets[dataset_id]["quality"].model_dump()

@router.get("/dataset/{dataset_id}/coverage")
async def get_dataset_coverage(dataset_id: str):
    if dataset_id not in generated_datasets:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return generated_datasets[dataset_id]["coverage"].model_dump()

@router.get("/dataset/{dataset_id}/manifest")
async def get_dataset_manifest(dataset_id: str):
    if dataset_id not in generated_datasets:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")
    return generated_datasets[dataset_id]["manifest"].model_dump()

