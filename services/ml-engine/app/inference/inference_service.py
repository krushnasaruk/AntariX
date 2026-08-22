import time
import numpy as np
from typing import Dict, Any
from app.registry.model_registry import ModelRegistry
from app.features.feature_pipeline import FeaturePipeline

class InferenceService:
    def __init__(self, registry: ModelRegistry = None):
        self.registry = registry or ModelRegistry()

    def predict(self, model_id: str, obs: Dict[str, Any]) -> Dict[str, Any]:
        model = self.registry.get_model(model_id)
        if not model:
            # Fallback prediction if model is missing or offline
            return {
                "modelId": model_id,
                "modelVersion": "1.0.0-fallback",
                "prediction": "MOVE_ROVER",
                "confidence": 0.50,
                "timestamp": time.time(),
                "explanation": {"fallback": True, "reason": f"Model '{model_id}' not found in registry."}
            }

        feat_vec = FeaturePipeline.extract_features_from_obs(obs)
        X = np.array([feat_vec.to_list()], dtype=np.float32)

        pred_val = model.predict(X)[0]
        probs = model.predict_proba(X)[0]
        conf = float(np.max(probs))

        pred_label = "WAIT" if pred_val == 1 else "MOVE_ROVER"

        return {
            "modelId": model_id,
            "modelVersion": model.metadata.modelVersion,
            "prediction": pred_label,
            "confidence": round(conf, 4),
            "timestamp": time.time(),
            "explanation": {
                "algorithm": model.metadata.algorithm,
                "featuresUsed": FeaturePipeline.FEATURE_NAMES
            }
        }
