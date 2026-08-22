# Python AI Mission Intelligence Service

The **Python AI Mission Intelligence Service** provides real-time anomaly detection, risk assessment, trajectory prediction, and advisory mission recommendations for the Earth–Mars Autonomous Simulator.

---

## 1. Responsibilities

- **Anomaly Detection**: Identifies 10+ anomaly categories (battery drain deviations, low battery reserves, health degradation, movement execution deviations, obstacle/hazard encounters, weather degradation, communication blackout, mission stall, plan infeasibility).
- **Risk Assessment**: Evaluates operational risk score (0–100) and risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **Predictive Trajectory**: Calculates 600s future battery levels, weather state transitions, communication latency, and task completion trajectories.
- **Mission Health Scoring**: Calculates multi-dimensional health metrics across battery, rover, communication, environment, and progress.

---

## 2. API Endpoints

- `POST /analyze`: Consumes `AutonomyObservation`, returns `MissionIntelligenceReport`.
- `GET /health`: Health check endpoint.
- `GET /version`: Returns service version.

---

## 3. Local Execution & Testing

```bash
# Run unit tests
pytest services/ai-engine/tests

# Start FastAPI dev server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
