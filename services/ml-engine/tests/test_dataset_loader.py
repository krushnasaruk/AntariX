import pytest
from app.datasets.dataset_loader import DatasetLoader

def test_dataset_loader_and_provenance():
    loader = DatasetLoader()
    df = loader.load_telemetry_parquet("mars-comm-v1")

    assert len(df) > 0
    assert loader.validate_provenance(df) is True
