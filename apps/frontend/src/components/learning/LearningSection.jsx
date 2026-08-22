import React from 'react';
import { RefreshCw, Database, Sparkles, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

const LOOP_STEPS = [
  'MISSION EXECUTION',
  'EXPERIENCE CAPTURE',
  'FAILURE CLUSTERING',
  'VECTOR MEMORY',
  'STRATEGY SCORING',
  'ADAPTIVE POLICY',
  'NEXT MISSION'
];

export function LearningSection() {
  return (
    <section className="section-container">
      <div className="section-tag">
        <Database size={12} />
        OBJECTIVE 08 • MISSION MEMORY & ADAPTIVE LEARNING
      </div>

      <h2 className="section-heading-lg">
        Every mission becomes<br />
        experience.
      </h2>

      <p className="section-description">
        AntriX stores telemetry outcomes, failure incidents, and energy budgets in a persistent vector memory store. Historical evidence actively modifies strategy ranking without requiring human re-tuning.
      </p>

      {/* Closed Experience Loop Diagram */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '24px 20px',
        background: 'rgba(4, 8, 22, 0.7)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        marginBottom: 36,
        overflowX: 'auto',
        gap: 8
      }}>
        {LOOP_STEPS.map((step, idx) => (
          <React.Fragment key={step}>
            <div style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(8, 16, 36, 0.85)',
              border: '1px solid var(--border-hairline)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: idx === 0 || idx === LOOP_STEPS.length - 1 ? '#38bdf8' : '#cbd5e1',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}>
              {step}
            </div>
            {idx < LOOP_STEPS.length - 1 && (
              <ArrowRight size={14} color="#38bdf8" opacity={0.6} style={{ flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Learned Mitigations Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {[
          {
            failure: 'Sand Dune Entrapment',
            condition: 'Loose regolith with incline > 18°',
            adaptation: 'Auto-boosts traction control & penalizes soft-soil paths by -40% in A* heuristic.',
            confidence: '98.4%'
          },
          {
            failure: 'Battery Thermal Freeze',
            condition: 'Night shadow duration > 180 mins',
            adaptation: 'Prioritizes crater rim solar exposure, scheduling pre-heating 30 mins before sunrise.',
            confidence: '96.2%'
          },
          {
            failure: 'Sudden Dust Storm Tau Spike',
            condition: 'Tau opacity rises > 1.2 in < 2 hrs',
            adaptation: 'Switches power state from active science drilling to low-power shelter wait mode.',
            confidence: '99.1%'
          }
        ].map(item => (
          <div key={item.failure} className="tech-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} /> HISTORICAL FAILURE
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#34d399', fontWeight: 700 }}>
                {item.confidence} CONFIDENCE
              </span>
            </div>

            <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              {item.failure}
            </h4>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#fb923c', marginBottom: 12 }}>
              {item.condition}
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
              <strong style={{ color: '#38bdf8' }}>Learned Strategy:</strong> {item.adaptation}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
