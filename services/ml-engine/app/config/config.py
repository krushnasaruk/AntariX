import os
import torch

class MLConfig:
    SERVICE_NAME: str = "ml-engine"
    VERSION: str = "1.0.0"
    MODEL_REGISTRY_DIR: str = os.getenv("MODEL_REGISTRY_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "registry_store")))
    MLFLOW_TRACKING_URI: str = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")

    @property
    def device(self) -> str:
        if torch.cuda.is_available():
            return "cuda"
        return "cpu"

    @property
    def device_info(self) -> dict:
        is_cuda = torch.cuda.is_available()
        return {
            "device": "cuda" if is_cuda else "cpu",
            "cuda_available": is_cuda,
            "gpu_name": torch.cuda.get_device_name(0) if is_cuda else "None (CPU Execution Mode)"
        }

ml_config = MLConfig()
