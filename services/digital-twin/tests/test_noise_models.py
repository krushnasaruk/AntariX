import pytest
from app.scenarios.noise_models import NoiseModel

def test_noise_model_preserves_ground_truth():
    clean_state = {
        "timestamp": 100.0,
        "rover": {"position": {"x": 100.0, "y": 100.0}, "batteryLevel": 0.94}
    }
    noise_model = NoiseModel(seed=42, sigma=0.05)
    noisy_obs = noise_model.apply_noise(clean_state)

    # Clean state is unchanged
    assert clean_state["rover"]["batteryLevel"] == 0.94
    assert clean_state["rover"]["position"]["x"] == 100.0

    # Noisy observation alters battery & position
    assert noisy_obs["rover"]["batteryLevel"] != 0.94 or noisy_obs["rover"]["position"]["x"] != 100.0
