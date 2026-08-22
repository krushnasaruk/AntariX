from typing import Dict, Any, List
from app.datasets.dataset_manifest import DatasetManifest

class SplitValidator:
    @staticmethod
    def validate_manifest(manifest: DatasetManifest) -> Dict[str, Any]:
        train_set = set(manifest.trainEpisodes)
        val_set = set(manifest.validationEpisodes)
        test_set = set(manifest.testEpisodes)

        train_val_overlap = train_set.intersection(val_set)
        train_test_overlap = train_set.intersection(test_set)
        val_test_overlap = val_set.intersection(test_set)

        has_episode_leakage = len(train_val_overlap) > 0 or len(train_test_overlap) > 0 or len(val_test_overlap) > 0

        valid = not has_episode_leakage and manifest.rowCount > 0

        return {
            "valid": valid,
            "hasEpisodeLeakage": has_episode_leakage,
            "trainValOverlap": list(train_val_overlap),
            "trainTestOverlap": list(train_test_overlap),
            "valTestOverlap": list(val_test_overlap)
        }
