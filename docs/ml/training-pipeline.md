# ML Training Pipeline Documentation

This document describes the reproducible training pipeline in `services/ml-engine/app/training`.

---

## Reproducible Training Workflow

1. Load dataset via `DatasetLoader`.
2. Extract 7-dim normalized features via `FeaturePipeline`.
3. Perform train/test splitting (80% train / 20% test).
4. Train baseline or neural model (`SupervisedTrainer`).
5. Log parameters & metrics to MLflow (`ExperimentTracker`).
6. Save artifact and update model status in `ModelRegistry`.
