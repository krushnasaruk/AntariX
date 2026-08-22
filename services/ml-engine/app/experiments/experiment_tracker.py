from typing import Dict, Any

class ExperimentTracker:
    def __init__(self, experiment_name: str = "mars-mission-ml"):
        self.experiment_name = experiment_name
        self._has_mlflow = False
        try:
            import mlflow
            mlflow.set_experiment(experiment_name)
            self._has_mlflow = True
        except Exception:
            self._has_mlflow = False

    def log_params(self, params: Dict[str, Any]):
        if self._has_mlflow:
            try:
                import mlflow
                mlflow.log_params(params)
            except Exception:
                pass

    def log_metrics(self, metrics: Dict[str, float]):
        if self._has_mlflow:
            try:
                import mlflow
                mlflow.log_metrics(metrics)
            except Exception:
                pass
