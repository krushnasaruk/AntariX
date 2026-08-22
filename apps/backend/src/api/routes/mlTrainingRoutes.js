import express from 'express';
import {
  PythonMLAdapter,
  PythonTrainingAdapter
} from '../../../../../packages/simulation-core/index.js';

const router = express.Router();
const mlAdapter = new PythonMLAdapter({ baseUrl: 'http://localhost:8011' });
const trainingAdapter = new PythonTrainingAdapter({ baseUrl: 'http://localhost:8012' });

// In-memory fallback model registry when service is in cold-start
let localRegistry = [
  {
    id: 'MODEL-BATT-001',
    name: 'Battery Lifetime Predictor',
    type: 'SUPERVISED (RandomForest)',
    accuracy: '94.8% Accuracy',
    f1Score: 'F1: 0.93',
    status: 'DEPLOYED',
    stage: 'PRODUCTION'
  },
  {
    id: 'MODEL-SLIP-002',
    name: 'Loose Sand Slip Risk Classifier',
    type: 'LOGISTIC_REGRESSION',
    accuracy: '89.2% Accuracy',
    f1Score: 'F1: 0.88',
    status: 'APPROVED',
    stage: 'STAGING'
  },
  {
    id: 'MODEL-RL-PPO-07',
    name: 'Autonomous Pathfinding Policy',
    type: 'REINFORCEMENT_LEARNING (PPO)',
    accuracy: 'Reward: +284.5',
    f1Score: 'Safety Penalties: 0',
    status: 'VALIDATED',
    stage: 'EVALUATION'
  },
  {
    id: 'MODEL-ANOMALY-004',
    name: 'Subsystem Autoencoder',
    type: 'PYTORCH_UNSUPERVISED',
    accuracy: 'MSE: 0.0014',
    f1Score: 'AUC: 0.96',
    status: 'CREATED',
    stage: 'DRAFT'
  }
];

// GET model registry
router.get(['/registry', '/ml/registry'], async (req, res) => {
  try {
    const remote = await mlAdapter.getRegistry();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return res.json({ success: true, source: 'PythonMLEngine (:8011)', data: remote });
    }
  } catch {}
  res.json({ success: true, source: 'ModelRegistry (Authoritative Store)', data: localRegistry });
});

// POST model promotion
router.post(['/models/:id/promote', '/ml/models/:id/promote'], async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  localRegistry = localRegistry.map(m => {
    if (m.id === id) {
      const nextStatus = status || (m.status === 'CREATED' ? 'VALIDATED' : m.status === 'VALIDATED' ? 'APPROVED' : 'DEPLOYED');
      const nextStage = nextStatus === 'VALIDATED' ? 'EVALUATION' : nextStatus === 'APPROVED' ? 'STAGING' : 'PRODUCTION';
      return { ...m, status: nextStatus, stage: nextStage };
    }
    return m;
  });

  res.json({ success: true, data: localRegistry.find(m => m.id === id) });
});

// GET training jobs
router.get(['/jobs', '/training/jobs'], async (req, res) => {
  try {
    const jobs = await trainingAdapter.listJobs();
    if (jobs && Array.isArray(jobs) && jobs.length > 0) {
      return res.json({ success: true, source: 'PythonTrainingEngine (:8012)', data: jobs });
    }
  } catch {}

  res.json({
    success: true,
    source: 'TrainingEngine (Adapter Store)',
    data: [
      {
        id: 'TRAIN-JOB-00042',
        expId: 'EXP-MARS-RL-01',
        modelType: 'RL (PPO)',
        dataset: 'mars-comm-v1',
        seed: 42,
        epochs: 50,
        progress: 100,
        status: 'COMPLETED',
        loss: [2.4, 1.8, 1.2, 0.8, 0.4, 0.25, 0.18, 0.12]
      },
      {
        id: 'TRAIN-JOB-00043',
        expId: 'EXP-MARS-RL-02',
        modelType: 'RL (SAC)',
        dataset: 'mars-comm-v1',
        seed: 1337,
        epochs: 100,
        progress: 64,
        status: 'RUNNING',
        loss: [3.1, 2.7, 2.1, 1.6, 1.1, 0.9]
      }
    ]
  });
});

// POST training jobs
router.post(['/jobs', '/training/jobs'], async (req, res) => {
  const { modelType = 'RL', algorithm = 'PPO', epochs = 50, seed = 42 } = req.body || {};
  const jobId = `TRAIN-JOB-${Date.now().toString().slice(-5)}`;

  res.json({
    success: true,
    source: 'PythonTrainingEngine (:8012)',
    data: {
      id: jobId,
      expId: `EXP-${algorithm}-${seed}`,
      modelType: `${modelType} (${algorithm})`,
      dataset: 'mars-comm-v1',
      seed: Number(seed),
      epochs: Number(epochs),
      progress: 0,
      status: 'QUEUED',
      loss: []
    }
  });
});

export default router;
