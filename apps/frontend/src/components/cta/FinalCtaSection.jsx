import React from 'react';
import { ArrowRight, Activity, Sparkles } from 'lucide-react';

export function FinalCtaSection({ onOpenConsole, onViewArch }) {
  return (
    <section style={{
      position: 'relative',
      padding: '120px 24px',
      textAlign: 'center',
      background: 'radial-gradient(ellipse at 50% 100%, rgba(14, 165, 233, 0.15) 0%, rgba(2, 4, 10, 0.95) 70%)',
      borderTop: '1px solid rgba(56, 189, 248, 0.15)',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 9999,
          background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)',
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8',
          marginBottom: 24
        }}>
          <Sparkles size={12} />
          DEEP SPACE MISSION READY
        </div>

        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          marginBottom: 20
        }}>
          Build autonomy for a world<br />
          where Earth is <span className="text-gradient-cyan">20 minutes away.</span>
        </h2>

        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '1.1rem',
          color: '#94a3b8',
          marginBottom: 36
        }}>
          AntriX — Mars Mission Intelligence & Digital Twin.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onOpenConsole} className="btn-primary">
            Launch Digital Twin <ArrowRight size={15} />
          </button>
          <button onClick={onViewArch} className="btn-secondary">
            <Activity size={15} color="#38bdf8" />
            Explore Architecture
          </button>
        </div>
      </div>
    </section>
  );
}
