import React from 'react';
import { Layers, ShieldCheck, Cpu, Database, Orbit, ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';

const STACK_LAYERS = [
  {
    step: '01',
    layer: 'Mars Physical Environment',
    module: '@earth-mars/simulation-core/environment',
    role: 'Jezero Crater-07 elevation grid, 2D kinematics, dust tau opacity, surface temperature, slope friction.',
    type: 'PHYSICS',
    color: '#fb923c'
  },
  {
    step: '02',
    layer: 'Mars Digital Twin Fabric',
    module: 'services/digital-twin (Port 8010)',
    role: 'Deterministic clock, 25+ attribute TwinState snapshots, Apache Parquet storage, in-process DuckDB analytics.',
    type: 'DATA FABRIC',
    color: '#38bdf8'
  },
  {
    step: '03',
    layer: 'Python AI Mission Intelligence',
    module: 'services/ai-engine (Port 8000)',
    role: 'Real-time anomaly detector, 100-step predictive battery trajectory, multi-agent risk assessment (Advisory).',
    type: 'AI INTELLIGENCE',
    color: '#818cf8'
  },
  {
    step: '04',
    layer: 'Autonomous Mission Planner',
    module: '@earth-mars/simulation-core/autonomy/planner',
    role: 'A* pathfinding with slope weighting, multi-step task queues, contingency plan scoring.',
    type: 'PLANNER',
    color: '#38bdf8'
  },
  {
    step: '05',
    layer: 'Physical SafetyValidator Gatekeeper',
    module: '@earth-mars/simulation-core/autonomy/safety-validator',
    role: '100% Authoritative execution gate. Intercepts AI proposals, enforcing 15% battery floor, 25° slope, and 2m hazard veto.',
    type: 'HARD SAFETY GATE',
    color: '#34d399',
    highlight: true
  },
  {
    step: '06',
    layer: 'Rover Kinematics Execution',
    module: '@earth-mars/simulation-core/physics',
    role: 'Motor torque per wheel, slip ratio calculation, thermal heaters, drill payload actuation.',
    type: 'EXECUTION',
    color: '#fb923c'
  },
  {
    step: '07',
    layer: 'Mission Experience Memory',
    module: 'services/ai-engine/app/memory',
    role: 'Persistent experience repository, failure pattern clusterer (loose regolith, cold drains).',
    type: 'MEMORY',
    color: '#818cf8'
  },
  {
    step: '08',
    layer: 'Adaptive Strategy Learning',
    module: 'services/ai-engine/app/intelligence/adaptive_planning',
    role: 'Historical success scoring, strategy weighting adjustment, cold-start fallbacks (<5 samples).',
    type: 'ADAPTATION',
    color: '#38bdf8'
  }
];

export function ArchitectureSection() {
  return (
    <section id="architecture-section" className="section-container" style={{ background: 'rgba(4, 8, 22, 0.4)' }}>
      <div className="section-tag">
        <Layers size={12} />
        SYSTEM ARCHITECTURE
      </div>

      <h2 className="section-heading-lg">
        An autonomous mission<br />
        intelligence stack.
      </h2>

      <p className="section-description">
        AntriX enforces a strict, unalterable authority hierarchy across all Node.js and Python microservice boundaries. AI advises, but physical safety always commands execution.
      </p>

      {/* Vertical Aerospace Stack Diagram */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 960,
        margin: '0 auto'
      }}>
        {STACK_LAYERS.map((layer, idx) => (
          <div key={layer.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className={`tech-card ${layer.highlight ? 'tech-card-glow' : ''}`}
              style={{
                width: '100%',
                padding: '18px 24px',
                display: 'grid',
                gridTemplateColumns: '50px 1.4fr 1.8fr 130px',
                gap: 18,
                alignItems: 'center',
                borderLeft: `4px solid ${layer.color}`,
                background: layer.highlight ? 'rgba(6, 24, 20, 0.75)' : 'var(--bg-card)'
              }}
            >
              {/* Step */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: layer.color }}>
                {layer.step}
              </span>

              {/* Layer Title & Module */}
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {layer.layer}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#64748b', marginTop: 2 }}>
                  {layer.module}
                </div>
              </div>

              {/* Role */}
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
                {layer.role}
              </p>

              {/* Type Badge */}
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 9999,
                  background: 'rgba(4, 8, 22, 0.8)',
                  border: `1px solid ${layer.color}40`,
                  color: layer.color,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  fontWeight: 700
                }}>
                  {layer.type}
                </span>
              </div>
            </div>

            {idx < STACK_LAYERS.length - 1 && (
              <div style={{ height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowDown size={12} color="#38bdf8" opacity={0.4} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
