# Objective 12 — Production ML/RL Training Pipeline & Experiment Orchestration Architecture

The **Training Engine Service** (`services/training-engine`) provides production-grade training job queueing, dataset manifest validation, reproducible seeds, experiment tracking with MLflow, checkpoint save/restore, model registry integration, GPU worker registration/heartbeats, safety-aware RL training, and REST APIs on port 8012.

---

## 1. System Architecture & Authority Hierarchy

```text
Objective 10 DatasetManifest (Parquet / DuckDB)
    ↓
SplitValidator (Episode-safe split verification, zero target/temporal leakage)
    ↓
ReproducibilityManager (Deterministic seeds for Python random, NumPy, PyTorch, Gym)
    ↓
Supervised / RL Trainer (MarsGymEnv + SafetyWrapper)
    ↓
Objective 5 SafetyValidator (Physical Safety Gatekeeper Interventions)
    ↓
SafetyMetricsCollector (Log proposedAction, executedAction, safetyDecision)
    ↓
CheckpointManager (Resumable checkpointing POST /training/jobs/{id}/checkpoint)
    ↓
MLflow Experiment Manager (Metrics, params, artifacts, reproducibility manifest)
    ↓
ModelRegistry Integration (CREATED → TRAINED → EVALUATED → VALIDATED → APPROVED → DEPLOYED)
    ↓
GPU Worker Architecture (Registration, heartbeats, RTX 4050 assignment)
```

---

## 2. Safety Invariants

- **Invariant 1**: ML/RL models are advisory policy generators.
- **Invariant 2**: Objective 5 `SafetyValidator` remains authoritative over physical execution.
- **Invariant 3**: No model can directly mutate physical simulation state.
- **Invariant 4**: Unsafe actions are rejected or replaced by safe fallbacks (`WAIT` / `RETURN_TO_BASE`).
- **Invariant 5**: Training cannot use test data.
- **Invariant 6**: Training cannot silently bypass dataset validation.
- **Invariant 7**: A trained model cannot automatically become DEPLOYED without passing evaluation gates.
- **Invariant 8**: All training experiments are reproducible from their manifest.
- **Invariant 9**: Digital Twin ground truth remains separate from observed telemetry.
- **Invariant 10**: Physical Earth–Mars latency engine remains Objective 1's single source of truth.
