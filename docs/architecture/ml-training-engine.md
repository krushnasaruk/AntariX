# ML Training Engine Architecture

The ML Training Engine (`services/ml-engine`) provides a modular, CPU-compatible, GPU-ready machine learning framework backing supervised learning, time-series prediction, anomaly detection, Gymnasium-compatible reinforcement learning (`MarsGymEnv`), MLflow experiment tracking, model registry promotion lifecycle, and HTTP REST inference on port 8011.

---

## Architecture Data Flow

```text
Objective 10 Dataset (Parquet / DuckDB)
    ↓
DatasetLoader & Provenance Validation
    ↓
FeaturePipeline (7-dim normalized feature vector, no target leakage)
    ↓
Supervised / Anomaly / RL Trainer
    ↓
MLflow Experiment Tracker (params, metrics, artifacts)
    ↓
ModelRegistry (CREATED → VALIDATED → APPROVED → DEPLOYED)
    ↓
InferenceService (FastAPI HTTP REST port 8011)
    ↓
Objective 7/8 Intelligence Engine
    ↓
Objective 6 Mission Planner
    ↓
Objective 5 SafetyValidator (Physical Safety Gatekeeper)
    ↓
Objective 4 Digital Twin Simulation Execution
```
