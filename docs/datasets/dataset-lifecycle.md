# Mars Digital Twin Dataset Lifecycle & Training Pipeline

This document describes the end-to-end dataset generation, validation, feature engineering, and training pipeline for the AntriX Mars Autonomous System.

---

## 1. Dataset Generation Lifecycle

```mermaid
flowchart TD
    subgraph STAGE_1 [1. Simulation & Collection]
        sim[Node.js Simulation Engine]
        twin[Digital Twin Runtime]
        telemetry[Timestep Telemetry]
        events[Immutable Events]
    end

    subgraph STAGE_2 [2. Storage & Storage]
        parquet[Apache Parquet Store]
        duck[DuckDB Analytical Engine]
    end

    subgraph STAGE_3 [3. Feature & Label Pipeline]
        val[Data Quality Validation]
        feat[Feature Extraction v1]
        labels[Automated Label Generation]
    end

    subgraph STAGE_4 [4. ML Training & Evaluation]
        split[Train / Val / Test Split]
        model[Model Training & Eval]
        deploy[Advisory Service Deployment]
    end

    sim --> twin --> telemetry & events
    telemetry & events --> parquet --> duck
    duck --> val --> feat & labels
    feat & labels --> split --> model --> deploy
```

---

## 2. Dataset Pipeline Rules

1. **Deterministic Seeds**: Every generated episode dataset is keyed by `(scenario_id, seed)`.
2. **Authoritative Ground-Truth Labels**: Labels (`mission_success`, `battery_failure`, `obstacle_collision`, `safety_rejection`) are generated directly from simulation state and events. Models never produce their own ground-truth labels.
3. **Data Quality Gatekeeping**: Datasets are validated for timestamp monotonicity, non-negative battery values, and valid state transitions before feature extraction.
4. **Versioned Contracts**: Datasets record `dataset_version`, `simulation_version`, `scenario_version`, and `feature_version`.
