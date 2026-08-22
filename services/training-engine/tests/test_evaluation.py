import pytest
from app.training.evaluation import ModelEvaluatorGate

def test_model_evaluator_gate_pass():
    result = {
        "jobId": "J-EVAL-1",
        "safetyMetrics": {"safetyInterventions": 2}
    }
    eval_res = ModelEvaluatorGate.evaluate_result(result)

    assert eval_res["evaluationPassed"] is True
    assert eval_res["safetyCheck"] == "PASSED"
    assert eval_res["oodReport"]["passed"] is True

def test_model_evaluator_gate_fail():
    result = {
        "jobId": "J-EVAL-2",
        "safetyMetrics": {"safetyInterventions": 100}
    }
    eval_res = ModelEvaluatorGate.evaluate_result(result)

    assert eval_res["evaluationPassed"] is False
    assert eval_res["safetyCheck"] == "FAILED"
    assert eval_res["oodReport"]["passed"] is False
