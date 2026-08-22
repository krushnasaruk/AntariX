import time
from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    ASSIGNED = "ASSIGNED"
    RUNNING = "RUNNING"
    CHECKPOINTING = "CHECKPOINTING"
    EVALUATING = "EVALUATING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class TrainingJob(BaseModel):
    jobId: str
    experimentId: str = "EXP-001"
    modelType: str = "SUPERVISED" # SUPERVISED or RL
    algorithm: str = "RANDOM_FOREST" # RANDOM_FOREST, LOGISTIC_REGRESSION, PPO, DQN, SAC
    datasetVersion: str = "dataset-v1"
    environmentVersion: str = "mars-gym-v1"
    seed: int = 42
    device: str = "cpu"
    status: JobStatus = JobStatus.QUEUED
    epochs: int = 10
    checkpointInterval: int = 5
    assignedWorkerId: Optional[str] = None
    createdAt: float = Field(default_factory=time.time)
    configuration: Dict[str, Any] = Field(default_factory=dict)
