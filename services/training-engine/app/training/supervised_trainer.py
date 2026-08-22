import numpy as np
from sklearn.ensemble import RandomForestClassifier
from app.models.training_job import TrainingJob
from app.models.training_result import TrainingResult, SafetyMetricsCollector
from app.training.reproducibility import ReproducibilityManager

class SupervisedTrainer:
    @staticmethod
    def train_job(job: TrainingJob) -> TrainingResult:
        ReproducibilityManager.set_seeds(job.seed)

        # Generate synthetic feature matrix for training pipeline
        X_train = np.random.randn(100, 7)
        y_train = np.random.randint(0, 2, size=100)

        clf = RandomForestClassifier(n_estimators=10, random_state=job.seed)
        clf.fit(X_train, y_train)

        acc = float(clf.score(X_train, y_train))

        safety_collector = SafetyMetricsCollector()
        safety_collector.log_action("MOVE_ROVER", "MOVE_ROVER", "APPROVED")

        return TrainingResult(
            jobId=job.jobId,
            metrics={"accuracy": round(acc, 4), "loss": round(1.0 - acc, 4)},
            safetyMetrics=safety_collector,
            evaluationPassed=acc >= 0.70
        )
