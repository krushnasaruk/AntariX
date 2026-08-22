# GPU Training Handoff Guide

This guide explains how a teammate with a GPU-capable machine (e.g. RTX 4050 laptop) can execute computationally intensive ML/RL training jobs.

---

## Step-by-Step GPU Handoff Workflow

1. **Clone Repository**:
   ```bash
   git clone <repo-url>
   cd AntriX
   ```

2. **Setup Python Environment & Verify CUDA**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   pip install -r services/ml-engine/requirements.txt
   python -c "import torch; print('CUDA Available:', torch.cuda.is_available(), 'GPU Name:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
   ```

3. **Execute GPU-Accelerated Training Run**:
   ```bash
   python -m app.training.training_runner --model-id MODEL-GPU-001 --algorithm RANDOM_FOREST
   ```

4. **Verify MLflow Tracking & Model Artifacts**:
   Model artifacts and metadata will be registered in `services/ml-engine/registry_store/MODEL-GPU-001.pkl` and MLflow tracking store (`mlruns/`).

5. **Commit Model Artifacts & Push**:
   Commit the trained model artifact file to the repository or sync via model registry.
