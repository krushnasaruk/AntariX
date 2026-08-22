# Production ML/RL Training Pipeline & Experiment Orchestration Service

The **Training Engine Service** (`services/training-engine`) provides production-grade training job queueing, dataset manifest validation, reproducible seeds, experiment tracking with MLflow, checkpoint save/restore, model registry integration, GPU worker registration/heartbeats, safety-aware RL training, and REST APIs on port 8012.

---

## Service Endpoints

- `GET /health`
- `GET /version`
- `POST /training/jobs`
- `GET /training/jobs`
- `GET /training/jobs/{job_id}`
- `POST /training/jobs/{job_id}/start`
- `POST /training/jobs/{job_id}/checkpoint`
- `POST /training/jobs/{job_id}/resume`
- `POST /workers/register`
- `POST /workers/heartbeat`
- `GET /workers`
- `GET /workers/capabilities`
- `POST /models/{model_id}/evaluate`
- `POST /models/{model_id}/approve`
