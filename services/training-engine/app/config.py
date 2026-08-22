import os
import sys
import torch

training_engine_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if training_engine_dir not in sys.path:
    sys.path.insert(0, training_engine_dir)

ml_engine_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml-engine"))
if ml_engine_path not in sys.path:
    sys.path.append(ml_engine_path)

class TrainingEngineConfig:
    SERVICE_NAME: str = "training-engine"
    VERSION: str = "1.0.0"
    PORT: int = 8012
    CHECKPOINT_DIR: str = os.getenv("CHECKPOINT_DIR", os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "checkpoints")))
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
            "gpu_name": torch.cuda.get_device_name(0) if is_cuda else "None (CPU Execution Mode)",
            "vram_gb": round(torch.cuda.get_device_properties(0).total_memory / (1024**3), 2) if is_cuda else 0.0
        }

config = TrainingEngineConfig()
