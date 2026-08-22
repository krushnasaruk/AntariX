import random
import sys
import numpy as np
import torch
from pydantic import BaseModel, Field
from typing import Dict, Any

class ReproducibilityManifest(BaseModel):
    seed: int
    datasetVersion: str = "dataset-v1"
    environmentVersion: str = "mars-gym-v1"
    configHash: str = "cfg-hash-42"
    pythonVersion: str = Field(default_factory=lambda: sys.version.split()[0])
    pytorchVersion: str = Field(default_factory=lambda: torch.__version__)
    cudaAvailable: bool = Field(default_factory=lambda: torch.cuda.is_available())
    device: str = "cpu"

class ReproducibilityManager:
    @staticmethod
    def set_seeds(seed: int = 42) -> ReproducibilityManifest:
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)

        return ReproducibilityManifest(
            seed=seed,
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
