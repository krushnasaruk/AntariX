import React from 'react';
import { Terminal, Cpu, Database, Orbit, Radio, Code2 } from 'lucide-react';

const TECH_DOMAINS = [
  {
    domain: 'Simulation Kernel',
    engine: 'Node.js 18+ (ES Modules)',
    desc: 'Deterministic Sol clock (24h 39m 35.244s), 2D kinematics physics, Crater-07 elevation grid, slope friction.',
    items: ['@earth-mars/simulation-core', 'A* Pathfinding', 'EventBus'],
    icon: <Orbit size={18} color="#fb923c" />
  },
  {
    domain: 'AI & Intelligence',
    engine: 'Python 3.11+ • FastAPI',
    desc: 'Subsystem anomaly detection, 100-step predictive battery trajectories, experience vector clustering.',
    items: ['PyTorch', 'NumPy / SciPy', 'FastAPI REST (Port 8000)'],
    icon: <Cpu size={18} color="#38bdf8" />
  },
  {
    domain: 'Digital Twin & Data Fabric',
    engine: 'DuckDB • Apache Parquet',
    desc: 'State snapshots (TwinState), 14-type fault injector, deterministic replay engine, episode-safe splitter.',
    items: ['DuckDB In-Memory', 'PyArrow / Parquet', 'FastAPI (Port 8010)'],
    icon: <Database size={18} color="#818cf8" />
  },
  {
    domain: 'ML / RL Training Platform',
    engine: 'Gymnasium • Stable-Baselines3',
    desc: 'MarsGymEnv safety wrapper, CUDA GPU worker offloading (NVIDIA RTX 4050), MLflow experiment tracking.',
    items: ['PPO / SAC Algorithms', 'Model Registry', 'FastAPI (Ports 8011/8012)'],
    icon: <Terminal size={18} color="#34d399" />
  },
  {
    domain: 'Deep Space DSN & DTN',
    engine: 'Speed-of-Light Delay Engine',
    desc: 'Physical speed-of-light propagation (c = 299,792,458 m/s), store-and-forward bundle protocol, blackout queues.',
    items: ['@earth-mars/communication-protocol', 'DTN Bundle Protocol', 'WebSockets'],
    icon: <Radio size={18} color="#38bdf8" />
  },
  {
    domain: 'Mission Control UI',
    engine: 'React 18 • Vite',
    desc: 'Tactical Jezero canvas radar, SVG arc telemetry gauges, aerospace dark glassmorphism, responsive shell.',
    items: ['React 18', 'Canvas 2D HUD', 'Vanilla Design System'],
    icon: <Code2 size={18} color="#60a5fa" />
  }
];

export function TechnologySection() {
  return (
    <section id="technology-section" className="section-container">
      <div className="section-tag">
        <Terminal size={12} />
        ENGINEERING & ARCHITECTURE
      </div>

      <h2 className="section-heading-lg">
        Engineered for extreme<br />
        operational constraints.
      </h2>

      <p className="section-description">
        A hybrid multi-service architecture spanning Node.js deterministic physics, high-performance Python analytical services, DuckDB columnar storage, and distributed GPU training.
      </p>

      {/* 6 Clean Tech Domain Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {TECH_DOMAINS.map(t => (
          <div key={t.domain} className="tech-card" style={{ padding: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'rgba(4, 8, 22, 0.8)', border: '1px solid var(--border-hairline)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {t.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700, color: '#f1f5f9' }}>
                  {t.domain}
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8' }}>
                  {t.engine}
                </div>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
              {t.desc}
            </p>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {t.items.map(item => (
                <span key={item} style={{
                  padding: '3px 9px', borderRadius: 4,
                  background: 'rgba(4, 8, 22, 0.9)', border: '1px solid var(--border-hairline)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#cbd5e1'
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
