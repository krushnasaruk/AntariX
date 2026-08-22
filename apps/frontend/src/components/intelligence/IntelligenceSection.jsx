import React from 'react';
import { BrainCircuit, AlertTriangle, ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

const PIPELINE_STAGES = [
  { stage: 'OBSERVE', desc: 'Normalized 7D feature observation telemetry' },
  { stage: 'DETECT', desc: 'Isolation forest & statistical thresholding' },
  { stage: 'PREDICT', desc: '100-step predictive battery & position state' },
  { stage: 'ASSESS', desc: 'Multi-agent risk level & mission confidence' },
  { stage: 'PLAN', desc: 'A* contingency replanning & scoring' },
  { stage: 'VALIDATE', desc: 'Objective 5 physical safety boundary check' },
  { stage: 'ACT', desc: 'Physical motor & instrument actuation' }
];

export function IntelligenceSection() {
  return (
    <section id="intelligence-section" className="section-container" style={{ background: 'rgba(4, 8, 22, 0.4)' }}>
      <div className="section-tag">
        <BrainCircuit size={12} />
        OBJECTIVE 07 & 08 • ONBOARD INTELLIGENCE
      </div>

      <h2 className="section-heading-lg">
        Intelligence that reasons<br />
        before it acts.
      </h2>

      <p className="section-description">
        Onboard Python microservices analyze telemetry, recognize recurring failure patterns, and generate advisory policies. Every recommendation is scored and vetted before touching hardware.
      </p>

      {/* 7-Step Reasoning Pipeline */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: 10,
        marginBottom: 40
      }}>
        {PIPELINE_STAGES.map((p, idx) => (
          <div key={p.stage} className="tech-card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
              PHASE 0{idx + 1}
            </div>
            <div style={{ fontFamily: 'var(--font-tech)', fontSize: '0.9375rem', fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>
              {p.stage}
            </div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6875rem', color: '#64748b', lineHeight: 1.4 }}>
              {p.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Example Intelligence Output & Non-Direct Execution Gate */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* Sample Intelligence Report */}
        <div className="tech-card" style={{ padding: 28, borderLeft: '4px solid #f43f5e' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} color="#f43f5e" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#f1f5f9' }}>
                AI INTELLIGENCE REPORT #482
              </span>
            </div>
            <span style={{
              padding: '3px 10px', borderRadius: 9999,
              background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)',
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#f43f5e', fontWeight: 700
            }}>
              RISK: HIGH
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            <div style={{ padding: 12, background: 'rgba(4, 8, 22, 0.7)', borderRadius: 8 }}>
              <span style={{ color: '#64748b' }}>ANOMALY:</span> <strong style={{ color: '#f43f5e' }}>BATTERY ABNORMAL COLD DRAIN</strong>
            </div>
            <div style={{ padding: 12, background: 'rgba(4, 8, 22, 0.7)', borderRadius: 8 }}>
              <span style={{ color: '#64748b' }}>PREDICTION:</span> <strong style={{ color: '#fbbf24' }}>Reserve floor violation expected in 420s</strong>
            </div>
            <div style={{ padding: 12, background: 'rgba(4, 8, 22, 0.7)', borderRadius: 8 }}>
              <span style={{ color: '#64748b' }}>RECOMMENDATION:</span> <strong style={{ color: '#38bdf8' }}>REPLAN TO SHELTER & RECHARGE</strong>
            </div>
            <div style={{ padding: 12, background: 'rgba(4, 8, 22, 0.7)', borderRadius: 8 }}>
              <span style={{ color: '#64748b' }}>CONFIDENCE:</span> <strong style={{ color: '#34d399' }}>0.95 (HIGH CERTAINTY)</strong>
            </div>
          </div>
        </div>

        {/* The Non-Direct Execution Gate */}
        <div className="tech-card tech-card-glow" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={18} color="#34d399" />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9' }}>
              The Hard Decoupling Guarantee
            </h3>
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: 20 }}>
            In AntriX, AI/ML models <strong>never</strong> mutate physical actuators directly. All policy recommendations must pass through deterministic planning and authoritative physical safety validation:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(4, 8, 22, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem'
          }}>
            <span style={{ color: '#818cf8', fontWeight: 700 }}>AI ADVISORY</span>
            <ArrowRight size={13} color="#38bdf8" />
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>PLANNER</span>
            <ArrowRight size={13} color="#38bdf8" />
            <span style={{ color: '#34d399', fontWeight: 700 }}>SAFETY GATE</span>
            <ArrowRight size={13} color="#38bdf8" />
            <span style={{ color: '#fb923c', fontWeight: 700 }}>ROVER</span>
          </div>
        </div>
      </div>
    </section>
  );
}
