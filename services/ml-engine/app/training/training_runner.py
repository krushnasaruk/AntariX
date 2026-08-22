import argparse
import sys
from app.config.config import ml_config
from app.datasets.dataset_loader import DatasetLoader
from app.features.feature_pipeline import FeaturePipeline
from app.training.training_config import TrainingConfig
from app.training.supervised_trainer import SupervisedTrainer
from app.registry.model_registry import ModelRegistry

def run_training_job(config: TrainingConfig) -> str:
    print(f"[ML-TRAIN] Starting ML Training Job on device: {ml_config.device_info}")

    loader = DatasetLoader()
    df = loader.load_telemetry_parquet(config.datasetId)

    X, y = FeaturePipeline.transform_dataframe(df)

    n_samples = len(X)
    n_train = int(n_samples * 0.8)
    X_train, X_test = X[:n_train], X[n_train:]
    y_train, y_test = y[:n_train], y[n_train:]

    trainer = SupervisedTrainer(config)
    model = trainer.train_and_evaluate(X_train, y_train, X_test, y_test)

    registry = ModelRegistry()
    meta = registry.register_model(model)

    print(f"[ML-TRAIN] Training Complete! Registered Model ID: {meta.modelId}, Status: {meta.status}, Accuracy: {meta.metrics.get('accuracy')}")
    return meta.modelId

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run ML Training Job")
    parser.add_argument("--model-id", type=str, default="MODEL-BATT-001", help="Model ID")
    parser.add_argument("--algorithm", type=str, default="RANDOM_FOREST", help="Algorithm")
    args = parser.parse_args()

    cfg = TrainingConfig(modelId=args.model_id, algorithm=args.algorithm)
    run_training_job(cfg)
