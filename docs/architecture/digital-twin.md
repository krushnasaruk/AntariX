# Mars Digital Twin Runtime, Telemetry Fabric & Simulation Orchestration Architecture

This document describes the design, telemetry fabric, event logging, checkpointing, replay capabilities, Apache Parquet storage, DuckDB query integration, and batch simulation orchestration for the **Mars Digital Twin Service** (Objective 9).

---

## 1. Overview & Architecture Diagram

```mermaid
flowchart TD
    subgraph NODE_SIMULATION [Node.js Simulation Kernel (Authoritative)]
        sim[Physical Simulation (Obj 4)]
        mm[Mission Execution (Obj 3)]
        validator[SafetyValidator (Obj 5)]
        planner[MissionPlanner (Obj 6)]
        dtAdapter[PythonDigitalTwinAdapter]
    end

    subgraph DIGITAL_TWIN [Python Digital Twin Service (services/digital-twin)]
        fastapi[FastAPI Service /twin]
        clock[DeterministicSimulationClock]
        runtime[DigitalTwinRuntime]
        collector[TelemetryCollector]
        recorder[EventRecorder]
        cpManager[CheckpointManager]
        parquet[ParquetStore]
        duckdb[DuckDBStore]
        batch[BatchRunner]
    end

    sim -->|Step Observation| dtAdapter
    dtAdapter -->|POST /twin/episode/step| fastapi
    fastapi --> runtime
    runtime --> clock
    runtime --> collector
    runtime --> recorder
    collector --> parquet
    recorder --> parquet
    parquet --> duckdb

    batch -->|run_batch| runtime
```

---

## 2. Key Subsystems & Responsibilities

- **`DeterministicSimulationClock`**: Advances in fixed/variable timesteps (`step(dt)`) completely independent of wall-clock time.
- **`TwinState` & `StateSnapshot`**: Captures 25+ attributes across mission state, rover state, environment, weather, battery, DTN queues, active plan, decision state, intelligence report, learning recommendation, and safety validation state.
- **`TelemetryCollector` & `TelemetryBuffer`**: Collects structured timestep records and maintains a ring buffer for sliding-window telemetry analysis.
- **`EventRecorder`**: Records immutable simulation events across 25+ categories (`MISSION_STARTED`, `ROVER_MOVED`, `OBSTACLE_ENCOUNTERED`, `BATTERY_CRITICAL`, `SAFETY_REJECTION`, etc.).
- **`CheckpointManager` & `DeterministicReplay`**: Supports exact state restoration (`checkpoint()`, `restore()`, `resume()`) and trajectory divergence checking.
- **`ParquetStore` & `DuckDBStore`**: Writes telemetry and events as Apache Parquet datasets and executes SQL analytical queries.
- **`BatchRunner`**: Executes N episodes with explicit seed control for reproducible ML dataset generation.

---

## 3. Advisory Safety Boundary

The Node.js simulation remains authoritative. Recommendations or policy evaluations performed within the Digital Twin remain strictly advisory and must pass through Objective 5 `SafetyValidator` before execution in simulation.
