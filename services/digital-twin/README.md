# Mars Digital Twin Runtime, Telemetry Fabric & Simulation Orchestration

The **Mars Digital Twin Service** (`services/digital-twin`) provides a deterministic, reproducible simulation runtime, rich temporal telemetry collection, immutable event logging, checkpointing, replay capabilities, Apache Parquet dataset generation, and DuckDB analytical query execution.

---

## 1. Capabilities

- **Deterministic Simulation Clock**: Advances in fixed/variable timesteps completely independent of wall-clock time.
- **TwinState Snapshot**: Captures 25+ state attributes across mission, rover, environment, weather, battery, DTN queues, active plans, decisions, and intelligence reports.
- **Telemetry Fabric**: Structured timestep telemetry records written to Parquet and queried via DuckDB.
- **Event System**: Immutable simulation event log recording 25+ event categories.
- **Checkpoint & Replay**: Exact state restoration (`checkpoint()`, `restore()`, `resume()`) preserving RNG seeds and state vectors.
- **Batch Orchestration**: `run_batch()` executing multi-episode simulation runs with seed control.

---

## 2. API Endpoints

- `POST /twin/episode/start`
- `POST /twin/episode/{id}/step`
- `POST /twin/episode/{id}/pause`
- `POST /twin/episode/{id}/resume`
- `POST /twin/episode/{id}/checkpoint`
- `POST /twin/episode/{id}/restore`
- `POST /twin/episode/{id}/terminate`
- `GET /twin/episode/{id}/state`
- `GET /twin/episode/{id}/telemetry`
- `GET /twin/episode/{id}/events`
- `POST /twin/replay`
- `POST /twin/batch`
- `GET /twin/health`
- `GET /twin/version`
