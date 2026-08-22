import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowDown } from 'lucide-react';

export function AutonomySafetySection() {
  return (
    <section id="safety-section" className="section-container">
      <div className="section-tag">
        <ShieldCheck size={12} />
        OBJECTIVE 05 • PHYSICAL SAFETY VALIDATOR
      </div>

      <h2 className="section-heading-lg">
        Autonomy without<br />
        compromising safety.
      </h2>

      {/* The Central Architectural Motto */}
      <div style={{
        padding: '32px 36px',
        background: 'linear-gradient(135deg, rgba(6, 24, 20, 0.8) 0%, rgba(4, 12, 28, 0.8) 100%)',
        border: '1px solid rgba(52, 211, 153, 0.35)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(52, 211, 153, 0.15)',
        marginBottom: 48,
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.2rem, 2.4vw, 1.85rem)',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.4,
          color: '#ffffff',
          margin: 0
        }}>
          "AI recommends.<br />
          <span style={{ color: '#38bdf8' }}>Physics decides what is possible.</span><br />
          <span style={{ color: '#34d399' }}>Safety decides what is allowed.</span>"
        </p>
      </div>

      {/* Authority Hierarchy Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {/* Rule 1: Battery Floor */}
        <div className="tech-card" style={{ padding: 24, borderTop: '3px solid #34d399' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#34d399', fontWeight: 700 }}>
              INVARIANT 01
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: 9999,
              background: 'rgba(52, 211, 153, 0.12)', border: '1px solid rgba(52, 211, 153, 0.3)',
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#34d399', fontWeight: 700
            }}>
              AUTHORITATIVE
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Reserve Battery Floor
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55 }}>
            If battery level falls below 15%, all forward motion is intercepted and replaced with RETURN_TO_BASE emergency solar tracking recharge.
          </p>
        </div>

        {/* Rule 2: Slope Angle */}
        <div className="tech-card" style={{ padding: 24, borderTop: '3px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#38bdf8', fontWeight: 700 }}>
              INVARIANT 02
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: 9999,
              background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)',
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#38bdf8', fontWeight: 700
            }}>
              AUTHORITATIVE
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Maximum Terrain Slope (25°)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55 }}>
            Crater descent paths exceeding 25° incline are rejected to prevent center-of-gravity rollover on loose regolith.
          </p>
        </div>

        {/* Rule 3: Obstacle Proximity */}
        <div className="tech-card" style={{ padding: 24, borderTop: '3px solid #fb923c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#fb923c', fontWeight: 700 }}>
              INVARIANT 03
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: 9999,
              background: 'rgba(251, 146, 60, 0.12)', border: '1px solid rgba(251, 146, 60, 0.3)',
              fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#fb923c', fontWeight: 700
            }}>
              AUTHORITATIVE
            </span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>
            Collision Proximity (2.0m)
          </h3>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8125rem', color: '#94a3b8', lineHeight: 1.55 }}>
            Boulders, cliffs, and sand dunes within 2.0 meters trigger an automatic hold and spawn local A* bypass route options.
          </p>
        </div>
      </div>
    </section>
  );
}
