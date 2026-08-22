from typing import Dict, Any

class ExperimentManager:
    def __init__(self, experiment_id: str = "EXP-001"):
        self.experiment_id = experiment_id
        self._has_mlflow = False
        try:
            import mlflow
            mlflow.set_experiment(experiment_id)
            self._has_mlflow = True
        except Exception:
            self._has_mlflow = False

    def log_job(self, job_id: str, params: Dict[str, Any], metrics: Dict[str, float]):
        if self._has_mlflow:
            try:
                import mlflow
                with mlflow.start_run(run_name=job_id):
                    mlflow.log_params(params)
                    mlflow.log_metrics(metrics)
            except Exception:
                pass
