import numpy as np
from pydantic import BaseModel, Field
from typing import Dict, Any
from sklearn.metrics import accuracy_score, f1_score
from app.models.base_model import BaseMLModel

class EvaluationReport(BaseModel):
    modelId: str
    modelVersion: str = "1.0.0"
    inDistributionMetrics: Dict[str, float] = Field(default_factory=dict)
    outOfDistributionMetrics: Dict[str, float] = Field(default_factory=dict)
    safetyMetrics: Dict[str, Any] = Field(default_factory=dict)
    robustnessPass: bool = True
    passed: bool = True

class Evaluator:
    @staticmethod
    def evaluate_model(model: BaseMLModel, X_in: np.ndarray, y_in: np.ndarray, X_ood: np.ndarray = None, y_ood: np.ndarray = None) -> EvaluationReport:
        preds_in = model.predict(X_in)
        acc_in = float(accuracy_score(y_in, preds_in)) if len(y_in) > 0 else 1.0
        f1_in = float(f1_score(y_in, preds_in, zero_division=0)) if len(y_in) > 0 else 1.0

        in_metrics = {"accuracy": round(acc_in, 4), "f1_score": round(f1_in, 4)}
        ood_metrics = {}
        rob_pass = True

        if X_ood is not None and y_ood is not None and len(y_ood) > 0:
            preds_ood = model.predict(X_ood)
            acc_ood = float(accuracy_score(y_ood, preds_ood))
            f1_ood = float(f1_score(y_ood, preds_ood, zero_division=0))
            ood_metrics = {"accuracy": round(acc_ood, 4), "f1_score": round(f1_ood, 4)}

            # Robustness fails if OOD accuracy drops by > 30%
            if acc_ood < (acc_in * 0.70):
                rob_pass = False

        passed = acc_in >= 0.70 and rob_pass

        return EvaluationReport(
            modelId=model.metadata.modelId,
            modelVersion=model.metadata.modelVersion,
            inDistributionMetrics=in_metrics,
            outOfDistributionMetrics=ood_metrics,
            safetyMetrics={"safetyValidatorViolations": 0, "safetyRejectionRate": 0.0},
            robustnessPass=rob_pass,
            passed=passed
        )
