import React from 'react';
import { Cpu, Award, TrendingUp, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const TRAINING_STAGES = [
  'DIGITAL TWIN',
  'DATA FACTORY',
  'FAULT INJECTION',
  'SCENARIO FACTORY',
  'ML TRAINING',
  'RL (MARSGYMENV)',
  'SAFETY EVAL',
  'DEPLOYMENT'
];

export function TrainingSection() {
  return (
    <section id="training-section" className="section-container" style={{ background: 'rgba(4, 8, 22, 0.4)' }}>
      <div className="section-tag">
        <Cpu size={12} />
        OBJECTIVES 11 & 12 • PRODUCTION ML / RL TRAINING PLATFORM
      </div>

      <h2 className="section-heading-lg">
        Trained in simulation.<br />
        Proven on terrain.
      </h2>

      <p className="section-description">
        AntriX couples Gymnasium environment wrappers (MarsGymEnv) with NVIDIA GPU training orchestration and MLflow experiment tracking, validating reinforcement learning policies against hard physical safety constraints.
      </p>

      {/* Production Pipeline */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 18px',
        background: 'rgba(4, 8, 22, 0.8)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        marginBottom: 36,
        overflowX: 'auto',
        gap: 8
      }}>
        {TRAINING_STAGES.map((st, idx) => (
          <React.Fragment key={st}>
            <div style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(8, 16, 36, 0.9)',
              border: '1px solid var(--border-hairline)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              fontWeight: 700,
              color: idx === 5 ? '#34d399' : '#cbd5e1',
              whiteSpace: 'nowrap'
            }}>
              {st}
            </div>
            {idx < TRAINING_STAGES.length - 1 && (
              <ArrowRight size={12} color="#38bdf8" opacity={0.5} style={{ flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Benchmark Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {/* Policy 1 */}
        <div className="tech-card" style={{ padding: 26 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#94a3b8', fontWeight: 700, marginBottom: 8 }}>
            BASELINE ALGORITHM
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
            Rule-Based A*
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Avg Energy:</span> <strong style={{ color: '#fbbf24' }}>85.0 Wh</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Traverse Time:</span> <strong style={{ color: '#f1f5f9' }}>142s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Safety Score:</span> <strong style={{ color: '#34d399' }}>9.8 / 10</strong>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: '#64748b', marginTop: 14 }}>
            *Simulation benchmark on Crater-07 100-step episode
          </div>
        </div>

        {/* Policy 2 */}
        <div className="tech-card" style={{ padding: 26 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#38bdf8', fontWeight: 700, marginBottom: 8 }}>
            SUPERVISED POLICY
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
            RandomForest Policy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Avg Energy:</span> <strong style={{ color: '#34d399' }}>72.0 Wh (-15%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Traverse Time:</span> <strong style={{ color: '#f1f5f9' }}>98s</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(4, 8, 22, 0.6)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Safety Score:</span> <strong style={{ color: '#fbbf24' }}>8.2 / 10</strong>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: '#64748b', marginTop: 14 }}>
            *Simulation benchmark on Crater-07 100-step episode
          </div>
        </div>

        {/* Policy 3 */}
        <div className="tech-card tech-card-glow" style={{ padding: 26, border: '1px solid rgba(52, 211, 153, 0.35)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#34d399', fontWeight: 700, marginBottom: 8 }}>
            REINFORCEMENT LEARNING
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginBottom: 16 }}>
            PPO + SafetyWrapper
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(6, 24, 18, 0.7)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Avg Energy:</span> <strong style={{ color: '#34d399' }}>63.4 Wh (-25.4%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(6, 24, 18, 0.7)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Traverse Time:</span> <strong style={{ color: '#34d399' }}>74s (-47.8%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(6, 24, 18, 0.7)', borderRadius: 6 }}>
              <span style={{ color: '#64748b' }}>Safety Score:</span> <strong style={{ color: '#34d399' }}>9.9 / 10</strong>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: '#34d399', marginTop: 14 }}>
            *Optimal Pareto efficiency with zero safety violations
          </div>
        </div>
      </div>
    </section>
  );
}
