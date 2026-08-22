import React from 'react';
import { Clock, WifiOff, AlertOctagon, BatteryWarning, Satellite, Zap } from 'lucide-react';

const PROBLEMS = [
  {
    id: '01',
    title: 'Communication Delay',
    tag: '3.0m — 22.3m Latency',
    desc: 'Radio signals traveling at the physical speed of light (c = 299,792,458 m/s) take up to 22.3 minutes one-way. A 44.6-minute round-trip command cycle makes real-time Earth joysticking impossible.',
    icon: <Clock size={20} color="#38bdf8" />,
    badge: 'c = 299,792,458 m/s',
    metric: '44.6 MIN',
    metricLabel: 'Worst-case Roundtrip Latency'
  },
  {
    id: '02',
    title: 'Communication Blackout',
    tag: 'Up to 14 Sol Outages',
    desc: 'During Solar Conjunction, Mars passes behind the Sun. Intense solar plasma occludes all radio communication for up to two weeks. The rover must execute multi-day missions entirely autonomously.',
    icon: <WifiOff size={20} color="#f43f5e" />,
    badge: 'Solar Plasma Occlusion',
    metric: '14 SOLS',
    metricLabel: 'Total Radio Isolation'
  },
  {
    id: '03',
    title: 'Environmental Uncertainty',
    tag: 'Rapid Atmospheric Dusting',
    desc: 'Martian dust storms can reduce solar panel input by up to 85% within hours. Loose regolith causes dangerous wheel slip (>35%), and rocky craters create sudden tip-over risks on slopes >25°.',
    icon: <AlertOctagon size={20} color="#fb923c" />,
    badge: 'Slope > 25° / Tau > 2.0',
    metric: '-85% POWER',
    metricLabel: 'Solar Flux Loss in Storm'
  },
  {
    id: '04',
    title: 'Limited Energy Reserves',
    tag: 'Strict 15% Battery Floor',
    desc: 'Without Earth assistance, every traverse step must account for forward power draw and return-to-base recharge feasibility. Violating the reserve battery floor leads to irrecoverable thermal freeze.',
    icon: <BatteryWarning size={20} color="#fbbf24" />,
    badge: 'Hard Safety Invariant',
    metric: '15% FLOOR',
    metricLabel: 'Non-Negotiable Power Floor'
  }
];

export function ProblemSection() {
  return (
    <section id="problem-section" className="section-container">
      <div className="section-tag">
        <Satellite size={12} />
        THE DEEP SPACE PROBLEM
      </div>

      <h2 className="section-heading-lg">
        On Mars, waiting for Earth<br />
        isn't an option.
      </h2>

      <p className="section-description">
        Traditional planetary exploration relies on ground-in-the-loop teleoperation. Under extreme physical delays and plasma blackouts, waiting for human confirmation causes catastrophic mission failures.
      </p>

      {/* 4 Problem Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
        gap: 20
      }}>
        {PROBLEMS.map(p => (
          <div key={p.id} className="tech-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: 'rgba(56, 189, 248, 0.06)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {p.icon}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b', fontWeight: 700 }}>
                PROBLEM {p.id}
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              {p.title}
            </h3>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8', marginBottom: 14 }}>
              {p.tag}
            </div>

            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', flex: 1, marginBottom: 20 }}>
              {p.desc}
            </p>

            <div style={{
              padding: '12px 14px',
              background: 'rgba(4, 8, 22, 0.7)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 8,
              marginTop: 'auto'
            }}>
              <div style={{ fontFamily: 'var(--font-tech)', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {p.metric}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#64748b' }}>
                {p.metricLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
