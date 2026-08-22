import numpy as np
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.ensemble import RandomForestClassifier
from app.models.base_model import BaseMLModel
from app.models.model_metadata import ModelMetadata

class LogisticRegressionBaseline(BaseMLModel):
    def __init__(self, metadata: ModelMetadata):
        super().__init__(metadata)
        self.model = LogisticRegression(random_state=metadata.randomSeed, max_iter=200)

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

class RandomForestBaseline(BaseMLModel):
    def __init__(self, metadata: ModelMetadata):
        super().__init__(metadata)
        self.model = RandomForestClassifier(n_estimators=50, random_state=metadata.randomSeed)

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)

class LinearRegressionBaseline(BaseMLModel):
    def __init__(self, metadata: ModelMetadata):
        super().__init__(metadata)
        self.model = LinearRegression()

    def fit(self, X: np.ndarray, y: np.ndarray):
        self.model.fit(X, y)
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict(X)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        preds = self.predict(X)
        probs = np.column_stack([1.0 - preds, preds])
        return np.clip(probs, 0.0, 1.0)
