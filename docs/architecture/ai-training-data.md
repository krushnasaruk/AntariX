# AI Training Data, Dataset Quality & Leakage Protection
## AntriX Machine Learning Data Engineering Specification

> **Document Type**: Data Engineering & ML Quality Standard  
> **Status**: IMPLEMENTED

---

## 1. Episode-Safe Train / Val / Test Partitioning

In time-series robotics applications, random row splitting causes severe **temporal and target leakage**. AntriX enforces strict **episode-level partitioning**:

```text
Dataset (100 Episodes)
├── Train Set (70%): Episodes 001 - 070 (Nominal + Injected Faults)
├── Validation Set (15%): Episodes 071 - 085 (Unseen Parameter Variations)
└── Test Set (15%): Episodes 086 - 100 (Unseen Multi-Fault Combinations)
```

---

## 2. Automated Quality Gates

Before any dataset is admitted to the training pipeline, `DatasetValidator` verifies:
- **Timestamp Monotonicity**: Timestamps advance strictly by $\Delta t > 0$.
- **Physical Invariants**: Battery fraction $0.0 \le \text{bat} \le 1.0$, velocities within physical limits.
- **Kinematic Continuity**: Position jumps $\le 50\text{m/step}$.
- **Zero Missingness**: No null or undefined values in observation features.
- **Zero Split Overlap**: Hard check that $\text{TrainEpisodes} \cap \text{TestEpisodes} = \emptyset$.

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `DatasetValidator` with quality scoring and leakage checks in `services/digital-twin/app/datasets/dataset_validator.py`.
  - 4 dataset families (Supervised, Time-Series, RL, Anomaly Detection).
  - Parquet storage and DuckDB SQL query pipeline.

- **SIMPLIFIED**:
  - Features are normalized using linear min-max scaling ($[0, 1]$).

- **ASSUMED**:
  - Synthetic fault distributions provide sufficient coverage for baseline RL exploration.

- **FUTURE WORK**:
  - Automated active learning pipeline prioritizing generation of edge cases where model uncertainty is highest.
