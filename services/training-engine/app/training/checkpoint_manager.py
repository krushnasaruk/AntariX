import os
import pickle
from typing import Dict, Any, Optional
from app.config import config

class CheckpointManager:
    def __init__(self, checkpoint_dir: str = None):
        self.checkpoint_dir = checkpoint_dir or config.CHECKPOINT_DIR
        os.makedirs(self.checkpoint_dir, exist_ok=True)

    def save_checkpoint(self, job_id: str, epoch: int, state_dict: Dict[str, Any]) -> str:
        filename = f"checkpoint_{job_id}_epoch_{epoch}.pkl"
        path = os.path.join(self.checkpoint_dir, filename)

        checkpoint_data = {
            "jobId": job_id,
            "epoch": epoch,
            "state_dict": state_dict
        }

        with open(path, "wb") as f:
            pickle.dump(checkpoint_data, f)

        return path

    def load_checkpoint(self, job_id: str, epoch: Optional[int] = None) -> Optional[Dict[str, Any]]:
        if not os.path.exists(self.checkpoint_dir):
            return None

        files = [f for f in os.listdir(self.checkpoint_dir) if f.startswith(f"checkpoint_{job_id}_")]
        if not files:
            return None

        files.sort()
        target_file = files[-1] # Load latest checkpoint

        path = os.path.join(self.checkpoint_dir, target_file)
        with open(path, "rb") as f:
            return pickle.load(f)
