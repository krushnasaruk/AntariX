# ML/RL Training Architecture, Model Registry & Evaluation Platform

The **ML Engine Service** (`services/ml-engine`) provides a CPU-compatible, GPU-ready machine learning framework backing supervised learning, time-series prediction, anomaly detection, Gymnasium-compatible reinforcement learning (`MarsGymEnv`), MLflow experiment tracking, model registry promotion lifecycle, and HTTP REST inference on port 8011.

---

## 1. Device Selection & GPU Handoff

The ML engine automatically selects CPU or CUDA device (`torch.cuda.is_available()`). Development and automated tests run seamlessly on CPU, while GPU-capable compute workers (e.g. teammate's RTX 4050 laptop) execute high-throughput training runs via:

```bash
python -m app.training.training_runner --config configs/battery_predictor.yaml
```

---

## 2. API Endpoints

- `POST /models/predict`
- `POST /models/train`
- `GET /models/registry`
- `GET /models/{model_id}`
- `POST /models/{model_id}/promote`
- `POST /models/evaluate`
- `GET /models/health`
- `GET /models/version`
