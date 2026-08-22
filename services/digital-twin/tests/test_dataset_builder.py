import pytest
from app.datasets.dataset_builder import DatasetBuilder

def test_dataset_builder_generation_and_reproducibility(tmp_path):
    builder = DatasetBuilder(base_dir=str(tmp_path))
    manifest1, quality1, data1 = builder.build_dataset("ds-test-01", num_episodes=10, seed=42)
    manifest2, quality2, data2 = builder.build_dataset("ds-test-02", num_episodes=10, seed=42)

    assert manifest1.records == 100
    assert quality1.passed is True
    assert len(data1["splits"]["train"]) == 7
    assert len(data1["splits"]["validation"]) == 2
    assert len(data1["splits"]["test"]) == 1

    # Same seed produces equivalent records
    assert data1["records"][0]["battery"] == data2["records"][0]["battery"]
    assert data1["records"][0]["next_action"] == data2["records"][0]["next_action"]
