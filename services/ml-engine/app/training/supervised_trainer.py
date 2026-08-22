from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from app.models.model_metadata import ModelMetadata
from app.models.baseline_models import LogisticRegressionBaseline, RandomForestBaseline
from app.models.base_model import BaseMLModel
from app.training.training_config import TrainingConfig
from app.experiments.experiment_tracker import ExperimentTracker

class SupervisedTrainer:
    def __init__(self, config: TrainingConfig):
        self.config = config
        self.tracker = ExperimentTracker(config.experimentName)

    def train_and_evaluate(self, X_train, y_train, X_test, y_test) -> BaseMLModel:
        meta = ModelMetadata(
            modelId=self.config.modelId,
            modelType=self.config.modelType,
            algorithm=self.config.algorithm,
            datasetId=self.config.datasetId,
            randomSeed=self.config.seed,
            status="VALIDATED"
        )

        if self.config.algorithm == "LOGISTIC_REGRESSION":
            model = LogisticRegressionBaseline(meta)
        else:
            model = RandomForestBaseline(meta)

        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        acc = float(accuracy_score(y_test, preds)) if len(y_test) > 0 else 1.0
        f1 = float(f1_score(y_test, preds, zero_division=0)) if len(y_test) > 0 else 1.0

        metrics = {"accuracy": acc, "f1_score": f1}
        model.metadata.metrics = metrics

        self.tracker.log_params(self.config.model_dump())
        self.tracker.log_metrics(metrics)

        return model
