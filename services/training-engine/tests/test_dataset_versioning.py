import pytest
from app.datasets.dataset_manifest import DatasetManifest
from app.datasets.split_validator import SplitValidator

def test_dataset_manifest_validation_clean():
    manifest = DatasetManifest(
        datasetId="D1",
        trainEpisodes=["EP-1", "EP-2"],
        validationEpisodes=["EP-3"],
        testEpisodes=["EP-4"]
    )
    res = SplitValidator.validate_manifest(manifest)

    assert res["valid"] is True
    assert res["hasEpisodeLeakage"] is False

def test_dataset_manifest_validation_detects_leakage():
    # Train and test share EP-1 (Episode Leakage)
    manifest = DatasetManifest(
        datasetId="D2",
        trainEpisodes=["EP-1", "EP-2"],
        validationEpisodes=["EP-3"],
        testEpisodes=["EP-1"]
    )
    res = SplitValidator.validate_manifest(manifest)

    assert res["valid"] is False
    assert res["hasEpisodeLeakage"] is True
    assert "EP-1" in res["trainTestOverlap"]
