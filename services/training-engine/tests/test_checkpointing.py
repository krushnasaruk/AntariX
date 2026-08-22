import pytest
from app.training.checkpoint_manager import CheckpointManager

def test_checkpoint_save_and_restore(tmp_path):
    mgr = CheckpointManager(checkpoint_dir=str(tmp_path))

    path = mgr.save_checkpoint("J1", 5, {"weights": [1.0, 2.0]})
    assert path is not None

    cp = mgr.load_checkpoint("J1")
    assert cp is not None
    assert cp["jobId"] == "J1"
    assert cp["epoch"] == 5
    assert cp["state_dict"]["weights"] == [1.0, 2.0]
