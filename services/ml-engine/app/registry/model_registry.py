import os
import pickle
from typing import Dict, Any, Optional, List
from app.models.model_metadata import ModelMetadata
from app.models.base_model import BaseMLModel

from app.config.config import ml_config

class ModelRegistry:
    def __init__(self, registry_dir: str = None):
        self.registry_dir = registry_dir or ml_config.MODEL_REGISTRY_DIR
        os.makedirs(self.registry_dir, exist_ok=True)
        self._models: Dict[str, BaseMLModel] = {}
        self._metadata: Dict[str, ModelMetadata] = {}

    def register_model(self, model: BaseMLModel) -> ModelMetadata:
        m_id = model.metadata.modelId
        self._models[m_id] = model
        self._metadata[m_id] = model.metadata

        # Save artifact file
        artifact_path = os.path.join(self.registry_dir, f"{m_id}.pkl")
        with open(artifact_path, "wb") as f:
            pickle.dump(model, f)
        model.metadata.artifactPath = artifact_path

        return model.metadata

    def get_model(self, model_id: str) -> Optional[BaseMLModel]:
        if model_id in self._models:
            return self._models[model_id]

        artifact_path = os.path.join(self.registry_dir, f"{model_id}.pkl")
        if os.path.exists(artifact_path):
            with open(artifact_path, "rb") as f:
                model = pickle.load(f)
                self._models[model_id] = model
                self._metadata[model_id] = model.metadata
                return model

        return None

    def promote_model(self, model_id: str, new_status: str) -> ModelMetadata:
        model = self.get_model(model_id)
        if not model:
            raise KeyError(f"Model '{model_id}' not found in registry.")

        model.metadata.status = new_status
        return self.register_model(model)

    def list_models(self) -> List[ModelMetadata]:
        if os.path.exists(self.registry_dir):
            for fname in os.listdir(self.registry_dir):
                if fname.endswith(".pkl"):
                    m_id = fname[:-4]
                    if m_id not in self._metadata:
                        self.get_model(m_id)
        return list(self._metadata.values())
