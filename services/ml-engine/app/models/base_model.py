from abc import ABC, abstractmethod
import numpy as np
from typing import Dict, Any
from app.models.model_metadata import ModelMetadata

class BaseMLModel(ABC):
    def __init__(self, metadata: ModelMetadata):
        self.metadata = metadata

    @abstractmethod
    def fit(self, X: np.ndarray, y: np.ndarray):
        pass

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        pass

    @abstractmethod
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        pass
