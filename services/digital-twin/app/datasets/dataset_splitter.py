import numpy as np
from typing import List, Dict, Any, Tuple

class DatasetSplitter:
    @staticmethod
    def split_episodes(episode_ids: List[str], seed: int = 42, train_ratio: float = 0.70, val_ratio: float = 0.15) -> Dict[str, List[str]]:
        rng = np.random.default_rng(seed)
        shuffled = list(episode_ids)
        rng.shuffle(shuffled)

        n = len(shuffled)
        n_train = max(1, int(round(n * train_ratio))) if n >= 3 else n
        n_val = max(1, int(round(n * val_ratio))) if n >= 3 else 0

        train_ids = shuffled[:n_train]
        val_ids = shuffled[n_train:n_train + n_val]
        test_ids = shuffled[n_train + n_val:]

        return {
            "train": train_ids,
            "validation": val_ids,
            "test": test_ids
        }
