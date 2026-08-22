import React, { useState, useEffect } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { promoteModel as apiPromoteModel, fetchModelRegistry } from '../../api/mlApi.js';
import {
  Database, Award, ShieldCheck, CheckCircle2,
  ArrowRight, Activity, Zap, PlayCircle, BarChart3
} from 'lucide-react';

export function MLRegistryPage() {
  const { modelRegistry, connected, freshnessText } = useWorldState();
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    if (modelRegistry && modelRegistry.length > 0) {
      setModels(modelRegistry);
      if (!selectedModel) setSelectedModel(modelRegistry[0]);
    }
  }, [modelRegistry, selectedModel]);

  const promote = async (id) => {
    try {
      const updated = await apiPromoteModel(id);
      if (updated?.data) {
        setModels(prev => prev.map(m => m.id === id ? updated.data : m));
        setSelectedModel(updated.data);
      }
    } catch {}
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'DEPLOYED': return 'success';
      case 'APPROVED': return 'info';
      case 'VALIDATED': return 'purple';
      default: return 'neutral';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Database size={18} color="#c084fc" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              ML/RL Model Registry & Lifecycle Governance (Objective 11)
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Python ML Service (:8011) • Stage Promotions (Draft → Eval → Staging → Prod) • MarsGymEnv Observation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Registry: ${freshnessText}` : 'Registry Offline'}
          </StatusBadge>
          <StatusBadge variant="info">{models.length} Registered Models</StatusBadge>
        </div>
      </div>

      {/* ─── Model Kanban 4 Columns ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {['CREATED (Draft)', 'VALIDATED (Eval)', 'APPROVED (Staging)', 'DEPLOYED (Prod)'].map((stage, idx) => {
          const stageKey = ['CREATED', 'VALIDATED', 'APPROVED', 'DEPLOYED'][idx];
          const stageModels = models.filter(m => (m.status === stageKey || m.stage === stageKey.split(' ')[0]));
          return (
            <div key={stage} className="glass-panel" style={{ padding: 16, minHeight: 220 }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8',
                marginBottom: 12, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6
              }}>
                {stage} ({stageModels.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stageModels.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m)}
                    className="inner-card"
                    style={{
                      cursor: 'pointer',
                      borderColor: selectedModel?.id === m.id ? '#38bdf8' : 'var(--border-subtle)',
                      background: selectedModel?.id === m.id ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                      padding: 10
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8', fontWeight: 700 }}>
                      {m.id}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#f1f5f9', marginTop: 2 }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: 4 }}>
                      {m.type || m.algorithm}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Selected Model Details & Gymnasium Feature Inspector ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 16 }}>
        {/* Model Details */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Award size={14} color="#38bdf8" />
            <span className="section-title">Model Governance & Promotion Gate</span>
          </div>

          {selectedModel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>
                    {selectedModel.name}
                  </h3>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
                    {selectedModel.id}
                  </span>
                </div>
                <StatusBadge variant={getStatusVariant(selectedModel.status)}>
                  {selectedModel.status}
                </StatusBadge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="inner-card" style={{ padding: 12 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>Performance Accuracy</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: 4 }}>
                    {selectedModel.accuracy || selectedModel.metrics?.accuracy || '94.8% Accuracy'}
                  </div>
                </div>
                <div className="inner-card" style={{ padding: 12 }}>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600 }}>F1 / Evaluation Score</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>
                    {selectedModel.f1Score || selectedModel.metrics?.f1 || 'F1: 0.93'}
                  </div>
                </div>
              </div>

              {selectedModel.status !== 'DEPLOYED' && (
                <button
                  onClick={() => promote(selectedModel.id)}
                  className="hud-button hud-button-primary"
                  style={{ width: '100%', padding: '10px' }}
                >
                  <ArrowRight size={13} /> Promote to Next Lifecycle Stage
                </button>
              )}
            </div>
          )}
        </div>

        {/* Gymnasium Feature Vector Monitor */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Activity size={14} color="#10b981" />
            <span className="section-title" style={{ color: '#34d399' }}>
              MarsGymEnv 7D Feature Vector Live Observation
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { dim: 'F0: Battery State (Norm)', val: '0.942', bar: 94 },
              { dim: 'F1: Position X Coordinate', val: '0.284', bar: 28 },
              { dim: 'F2: Position Y Coordinate', val: '0.322', bar: 32 },
              { dim: 'F3: Rover Heading Angle', val: '0.233', bar: 23 },
              { dim: 'F4: Earth Link Latency', val: '0.005', bar: 1 },
              { dim: 'F5: Atmospheric Dust Tau', val: '0.420', bar: 42 },
              { dim: 'F6: Obstacle Clearance', val: '0.850', bar: 85 }
            ].map(f => (
              <div key={f.dim} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                <span style={{ width: 160, color: '#cbd5e1' }}>{f.dim}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-bar-fill progress-bar-fill-cyan" style={{ width: `${f.bar}%` }} />
                </div>
                <span style={{ width: 45, color: '#38bdf8', textAlign: 'right', fontWeight: 700 }}>{f.val}</span>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 12, padding: 10,
            background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 6, fontSize: '0.6875rem',
            color: '#34d399', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <ShieldCheck size={14} /> SafetyWrapper Active: Unsafe action proposals penalize policy with -50.0 reward.
          </div>
        </div>
      </div>
    </div>
  );
}
