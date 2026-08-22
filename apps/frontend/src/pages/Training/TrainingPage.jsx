import React, { useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { MiniChart } from '../../components/ui/MiniChart';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { createTrainingJob } from '../../api/trainingApi.js';
import {
  Cpu, Play, Zap, Terminal, CheckCircle2,
  Activity, Layers, RotateCcw, AlertTriangle, ShieldCheck
} from 'lucide-react';

export function TrainingPage() {
  const { trainingJobs, connected, freshnessText } = useWorldState();
  const [modelType, setModelType] = useState('RL');
  const [algorithm, setAlgorithm] = useState('PPO');
  const [epochs, setEpochs] = useState(50);
  const [seed, setSeed] = useState(42);
  const [activeJobs, setActiveJobs] = useState(trainingJobs || []);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  const handleLaunch = async () => {
    setSubmitting(true);
    try {
      const res = await createTrainingJob({ modelType, algorithm, epochs, seed });
      if (res?.data) {
        setActiveJobs(prev => [res.data, ...prev]);
        setSubmitMsg(`✓ Launched ${res.data.id} on GPU Cluster Node #01`);
        setTimeout(() => setSubmitMsg(null), 4000);
      }
    } catch {
      setSubmitMsg('✗ Error launching training job');
    } finally {
      setSubmitting(false);
    }
  };

  const displayJobs = activeJobs.length > 0 ? activeJobs : (trainingJobs.length > 0 ? trainingJobs : [
    { id: 'TRAIN-JOB-00042', expId: 'EXP-MARS-RL-01', modelType: 'RL (PPO)', dataset: 'mars-comm-v1', seed: 42, epochs: 50, progress: 100, status: 'COMPLETED', loss: [2.4, 1.8, 1.2, 0.8, 0.4, 0.25, 0.18, 0.12] },
    { id: 'TRAIN-JOB-00043', expId: 'EXP-MARS-RL-02', modelType: 'RL (SAC)', dataset: 'mars-comm-v1', seed: 1337, epochs: 100, progress: 64, status: 'RUNNING', loss: [3.1, 2.7, 2.1, 1.6, 1.1, 0.9] }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Cpu size={18} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Production Distributed ML/RL Training Engine (Objective 12)
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Python Training Service (:8012) • Multi-Worker Nodes • Safety-Aware PPO & SAC Agents
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Cluster: ${freshnessText}` : 'Cluster Offline'}
          </StatusBadge>
          <StatusBadge variant="info">2 Active Workers</StatusBadge>
        </div>
      </div>

      {/* ─── Center Grid: Launch Form + GPU Workers ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Launch Form */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Play size={14} color="#38bdf8" />
            <span className="section-title">Launch Distributed Training Job</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Model Paradigm
              </label>
              <select value={modelType} onChange={e => setModelType(e.target.value)} className="hud-select">
                <option value="RL">Reinforcement Learning (Gym)</option>
                <option value="SUPERVISED">Supervised (Regression / Clf)</option>
                <option value="ANOMALY">Unsupervised Autoencoder</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Algorithm Architecture
              </label>
              <select value={algorithm} onChange={e => setAlgorithm(e.target.value)} className="hud-select">
                <option value="PPO">PPO (Proximal Policy Opt)</option>
                <option value="SAC">SAC (Soft Actor-Critic)</option>
                <option value="RANDOM_FOREST">Random Forest</option>
                <option value="AUTOENCODER">Variational Autoencoder</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Total Epochs / Iterations
              </label>
              <input
                type="number"
                value={epochs}
                onChange={e => setEpochs(Number(e.target.value))}
                className="hud-input"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Deterministic Master Seed
              </label>
              <input
                type="number"
                value={seed}
                onChange={e => setSeed(Number(e.target.value))}
                className="hud-input"
              />
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={submitting}
            className="hud-button hud-button-primary"
            style={{ width: '100%', padding: '10px' }}
          >
            <Cpu size={13} />
            {submitting ? 'Launching on GPU Cluster...' : 'Submit Distributed Training Run'}
          </button>

          {submitMsg && (
            <div style={{
              marginTop: 12, padding: 10,
              background: submitMsg.startsWith('✓') ? 'rgba(56, 189, 248, 0.08)' : 'rgba(244, 63, 94, 0.08)',
              border: `1px solid ${submitMsg.startsWith('✓') ? 'rgba(56, 189, 248, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              borderRadius: 6, fontSize: '0.75rem',
              color: submitMsg.startsWith('✓') ? '#38bdf8' : '#f43f5e',
              fontFamily: 'var(--font-mono)'
            }}>
              {submitMsg}
            </div>
          )}
        </div>

        {/* Worker Pool Status */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Layers size={14} color="#10b981" />
            <span className="section-title" style={{ color: '#34d399' }}>
              Worker Node Cluster Pool
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'WORKER-NODE-01', gpu: 'NVIDIA RTX A6000 (48GB VRAM)', utilization: '78%', temp: '62°C', status: 'ACTIVE' },
              { id: 'WORKER-NODE-02', gpu: 'NVIDIA RTX 4090 (24GB VRAM)', utilization: '42%', temp: '54°C', status: 'ACTIVE' },
              { id: 'WORKER-NODE-03', gpu: 'Apple M3 Max (Metal / MPS)', utilization: '0%', temp: '38°C', status: 'STANDBY' }
            ].map(w => (
              <div key={w.id} className="inner-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700 }}>
                    {w.id}
                  </span>
                  <StatusBadge variant={w.status === 'ACTIVE' ? 'success' : 'neutral'}>
                    {w.status}
                  </StatusBadge>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 600, marginTop: 2 }}>
                  {w.gpu}
                </div>
                <div style={{ display: 'flex', gap: 14, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#94a3b8', marginTop: 4 }}>
                  <span>Load: <strong style={{ color: '#34d399' }}>{w.utilization}</strong></span>
                  <span>Temp: <strong style={{ color: '#38bdf8' }}>{w.temp}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Training Jobs Stream ─── */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div className="section-header">
          <Activity size={14} color="#38bdf8" />
          <span className="section-title">Active & Completed Training Experiment Runs</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {displayJobs.map(job => (
            <div key={job.id} className="inner-card" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 700 }}>
                    {job.id}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    ({job.expId || 'EXP-MARS'})
                  </span>
                </div>
                <StatusBadge variant={job.status === 'COMPLETED' ? 'success' : job.status === 'RUNNING' ? 'info' : 'neutral'}>
                  {job.status}
                </StatusBadge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: '0.75rem', color: '#94a3b8' }}>
                <div>Type: <strong style={{ color: '#f1f5f9' }}>{job.modelType}</strong></div>
                <div>Epochs: <strong style={{ color: '#f1f5f9' }}>{job.epochs}</strong></div>
                <div>Progress: <strong style={{ color: '#34d399' }}>{job.progress}%</strong></div>
              </div>

              {job.loss && job.loss.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: 2 }}>
                    Loss Convergence Curve:
                  </div>
                  <MiniChart data={job.loss} color="#34d399" width={320} height={32} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
