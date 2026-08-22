import numpy as np

class SeedContext:
    def __init__(self, master_seed: int = 42):
        self.master_seed = master_seed
        self._master_rng = np.random.default_rng(master_seed)

    def spawn_rng(self, stream_name: str) -> np.random.Generator:
        # Deterministically derive child seed from stream_name and master_seed
        stream_hash = abs(hash(f"{self.master_seed}_{stream_name}")) % (2**31)
        return np.random.default_rng(stream_hash)
