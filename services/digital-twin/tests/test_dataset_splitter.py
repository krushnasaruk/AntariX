import pytest
from app.datasets.dataset_splitter import DatasetSplitter

def test_episode_safe_dataset_splitting():
    episode_ids = [f"EP-{i}" for i in range(100)]
    splits = DatasetSplitter.split_episodes(episode_ids, seed=42, train_ratio=0.70, val_ratio=0.15)

    assert len(splits["train"]) == 70
    assert len(splits["validation"]) == 15
    assert len(splits["test"]) == 15

    # Check zero overlap (episode-safe)
    train_set = set(splits["train"])
    val_set = set(splits["validation"])
    test_set = set(splits["test"])

    assert len(train_set.intersection(val_set)) == 0
    assert len(train_set.intersection(test_set)) == 0
    assert len(val_set.intersection(test_set)) == 0
