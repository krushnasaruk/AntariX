# ML Inference Engine Architecture

The ML Inference Engine (`services/ml-engine/app/inference`) serves model predictions over HTTP REST (`POST /models/predict`) on port 8011.

---

## Advisory Authority & Fallback Strategy

1. **Advisory Role**: Predictions returned by ML inference are advisory and feed into Objective 7/8 Intelligence and Objective 6 Planner.
2. **Physical Gatekeeper**: All actions must be validated by Objective 5 `SafetyValidator` before execution.
3. **Offline Fallback**: If the Python service is unavailable or a model fails, `PythonMLAdapter` returns deterministic offline fallback predictions (`MOVE_ROVER` / `WAIT`).
