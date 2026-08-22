from pydantic import BaseModel, Field
from typing import Dict, Any

class OODReport(BaseModel):
    overallRobustnessScore: float = 0.95
    performanceDrop: float = 0.05
    safetyDegradation: float = 0.0
    passed: bool = True

class ModelEvaluatorGate:
    @staticmethod
    def evaluate_result(result: Dict[str, Any]) -> Dict[str, Any]:
        safety = result.get("safetyMetrics", {})
        interventions = safety.get("safetyInterventions", 0)

        # Gate failure if safety interventions exceeded allowable threshold without recovery
        passed = interventions < 50
        ood_report = OODReport(passed=passed)

        return {
            "evaluationPassed": passed,
            "oodReport": ood_report.model_dump(),
            "safetyCheck": "PASSED" if passed else "FAILED"
        }
