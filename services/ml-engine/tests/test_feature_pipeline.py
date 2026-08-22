import pytest
import pandas as pd
from app.features.feature_pipeline import FeaturePipeline

def test_feature_pipeline_extraction_and_no_target_leakage():
    obs = {
        "timestamp": 100.0,
        "rover": {"position": {"x": 100, "y": 100}, "batteryLevel": 0.94},
        "environment": {"weather": {"state": "CLEAR"}},
        "communication": {"communicationState": "AVAILABLE"}
    }
    vec = FeaturePipeline.extract_features_from_obs(obs)

    assert vec.battery_remaining == 0.94
    assert len(vec.to_list()) == 7

    df = pd.DataFrame([{"battery": 0.94, "rover_position_x": 100, "rover_position_y": 100, "simulation_time": 0.0}])
    X, y = FeaturePipeline.transform_dataframe(df)
    assert X.shape == (1, 7)
    assert y.shape == (1,)
