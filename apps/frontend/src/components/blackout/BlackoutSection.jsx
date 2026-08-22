import React, { useState } from 'react';
import { WifiOff, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export function BlackoutSection() {
  const [blackoutSim, setBlackoutSim] = useState(true);

  return (
    <section className="section-container" style={{ background: 'rgba(4, 8, 22, 0.4)' }}>
      <div className="section-tag">
        <WifiOff size={12} />
        OBJECTIVE 02 • DELAY-TOLERANT NETWORKING (DTN)
      </div>

      <h2 className="section-heading-lg">
        When Earth goes silent.
      </h2>

      <p className="section-description">
        During Solar Conjunction, Mars passes directly behind the Sun. Solar plasma completely severs radio links for up to 14 sols. While traditional rovers freeze, AntriX autonomous operations continue seamlessly.
      </p>

      {/* Dramatic Blackout Interactive Banner */}
      <div className="tech-card" style={{ padding: 36, border: '1px solid rgba(244, 63, 94, 0.35)' }}>
        {/* Connection Graphic */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 20px',
          background: 'rgba(2, 4, 12, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 12,
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#60a5fa' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#f1f5f9' }}>EARTH GROUND DSN</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#64748b' }}>GOLDSTONE / MADRID / CANBERRA</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'center', minWidth: 220 }}>
            <div style={{ height: 2, flex: 1, background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
            <div style={{
              padding: '6px 14px', borderRadius: 9999,
              background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#f43f5e', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <XCircle size={12} /> SOLAR CONJUNCTION PLASMA OCCLUSION
            </div>
            <div style={{ height: 2, flex: 1, background: 'linear-gradient(90deg, transparent, #fb923c)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#fb923c' }}>MARS ROVER PERSEVERANCE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#64748b' }}>JEZERO SECTOR-07 (LOCAL AUTONOMY)</div>
            </div>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fb923c' }} />
          </div>
        </div>

        {/* 4 Autonomous Blackout Survival Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { title: 'Mission Continues', desc: 'Pre-planned tasks 04 through 08 execute without halting.', status: 'ACTIVE' },
            { title: 'Local A* Replanning', desc: 'Rover detects boulder field and calculates bypass path.', status: 'ACTIVE' },
            { title: 'Hard Safety Rules', desc: '15% battery floor & 25° slope bounds strictly enforced.', status: 'GUARDED' },
            { title: 'DTN Store & Forward', desc: '100% of scientific spectrometry telemetry buffered locally.', status: 'BUFFERING' }
          ].map(item => (
            <div key={item.title} style={{
              padding: 18,
              background: 'rgba(4, 8, 22, 0.7)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 10
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#34d399', fontWeight: 700 }}>
                  {item.status}
                </span>
                <CheckCircle2 size={13} color="#34d399" />
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                {item.title}
              </h4>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.45, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
