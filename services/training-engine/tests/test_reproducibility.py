import pytest
import numpy as np
import torch
from app.training.reproducibility import ReproducibilityManager

def test_reproducibility_manager_seed_determinism():
    m1 = ReproducibilityManager.set_seeds(42)
    val1 = np.random.randn(5)
    t1 = torch.randn(5)

    m2 = ReproducibilityManager.set_seeds(42)
    val2 = np.random.randn(5)
    t2 = torch.randn(5)

    assert m1.seed == 42
    assert np.allclose(val1, val2)
    assert torch.allclose(t1, t2)
