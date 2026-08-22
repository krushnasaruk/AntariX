import React from 'react';
import { MarsVisualization } from './MarsVisualization';
import { Sparkles, ArrowRight, Shield, Activity } from 'lucide-react';

export function HeroSection({ onOpenConsole, onExploreTwin, onViewArch }) {
  return (
    <section style={{
      position: 'relative',
      paddingTop: 130,
      paddingBottom: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      overflow: 'visible'
    }}>
      {/* Eyebrow Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 18px',
        borderRadius: 9999,
        background: 'rgba(56, 189, 248, 0.06)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: '#93c5fd',
        marginBottom: 24,
        boxShadow: '0 0 25px rgba(56, 189, 248, 0.12)'
      }}>
        <Sparkles size={13} color="#38bdf8" />
        <span>EARTH ↔ MARS AUTONOMOUS INTELLIGENCE</span>
      </div>

      {/* Dominant Headline */}
      <h1 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 'clamp(2.8rem, 6.2vw, 5.2rem)',
        fontWeight: 800,
        lineHeight: 1.05,
        letterSpacing: '-0.035em',
        maxWidth: 960,
        margin: '0 auto 18px auto'
      }}>
        Autonomous <span className="text-gradient-cyan">Intelligence</span><br />
        For <span className="text-gradient-mars">Mars.</span>
      </h1>

      {/* Alternative Supporting Line */}
      <div style={{
        fontFamily: 'var(--font-tech)',
        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        color: '#94a3b8',
        marginBottom: 22,
        textTransform: 'uppercase'
      }}>
        Simulate • Predict • Decide • Adapt
      </div>

      {/* Supporting Paragraph */}
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'clamp(1rem, 1.6vw, 1.15rem)',
        lineHeight: 1.65,
        color: '#94a3b8',
        maxWidth: 740,
        margin: '0 auto 36px auto'
      }}>
        AntriX is a physics-aware Mars mission intelligence platform that enables autonomous decision-making, digital-twin simulation, predictive risk analysis, and adaptive mission planning under extreme communication delay.
      </p>

      {/* CTA Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={onExploreTwin || onOpenConsole}
          className="btn-primary"
        >
          Explore Digital Twin <ArrowRight size={15} />
        </button>

        <button
          onClick={onViewArch || (() => {
            const el = document.getElementById('architecture-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          })}
          className="btn-secondary"
        >
          <Activity size={15} color="#38bdf8" />
          View Architecture
        </button>
      </div>

      {/* Cinematic Abstract Mars Visualization */}
      <div style={{ width: '100%', maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}>
        <MarsVisualization />
      </div>
    </section>
  );
}
