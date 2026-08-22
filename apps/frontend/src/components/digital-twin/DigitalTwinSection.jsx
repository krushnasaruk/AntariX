import React, { useState } from 'react';
import { Box, Play, Pause, Save, Eye, Battery, Compass, CheckCircle2, Compass as CompassIcon, Wind, Target } from 'lucide-react';
import { RadarCanvas } from '../simulation/RadarCanvas';

export function DigitalTwinSection({ onOpenConsole }) {
  const [twinActive, setTwinActive] = useState(true);

  return (
    <section id="digital-twin-section" className="section-container">
      <div className="section-tag">
        <Box size={12} />
        OBJECTIVE 09 & 10 • DIGITAL TWIN FABRIC
      </div>

      <h2 className="section-heading-lg">
        Know what the rover sees.
      </h2>

      <p className="section-description">
        AntriX maintains a deterministic, high-throughput digital twin runtime decoupled from wall-clock time. Every physical interaction is logged to Apache Parquet and queried via DuckDB.
      </p>

      {/* Main Digital Twin Interactive Display */}
      <div className="tech-card" style={{ padding: 32 }}>
        {/* Top Control Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 20,
          marginBottom: 24,
          borderBottom: '1px solid var(--border-hairline)',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: twinActive ? '#34d399' : '#f59e0b',
              boxShadow: twinActive ? '0 0 10px #34d399' : 'none'
            }} />
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9375rem', color: '#f1f5f9' }}>
              JEZERO CRATER-07 • DIGITAL TWIN RUNTIME (PORT 8010)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setTwinActive(!twinActive)}
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.75rem' }}
            >
              {twinActive ? <Pause size={12} /> : <Play size={12} />}
              {twinActive ? 'PAUSE CLOCK' : 'RESUME CLOCK'}
            </button>
            <button
              onClick={onOpenConsole}
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '0.75rem' }}
            >
              OPEN FULL TWIN CONSOLE
            </button>
          </div>
        </div>

        {/* 3 Telemetry Data Panels Surrounding Technical Map */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {/* Panel 1: Rover */}
          <div style={{
            padding: 16,
            background: 'rgba(4, 8, 22, 0.7)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 10
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#38bdf8', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Battery size={13} /> ROVER TELEMETRY
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div><span style={{ color: '#64748b' }}>BATTERY:</span> <strong style={{ color: '#34d399' }}>94.2%</strong></div>
              <div><span style={{ color: '#64748b' }}>HEADING:</span> <strong style={{ color: '#f1f5f9' }}>132°</strong></div>
              <div><span style={{ color: '#64748b' }}>VELOCITY:</span> <strong style={{ color: '#f1f5f9' }}>0.12 m/s</strong></div>
              <div><span style={{ color: '#64748b' }}>STATUS:</span> <strong style={{ color: '#34d399' }}>NOMINAL</strong></div>
            </div>
          </div>

          {/* Panel 2: Environment */}
          <div style={{
            padding: 16,
            background: 'rgba(4, 8, 22, 0.7)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 10
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#fb923c', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Wind size={13} /> ENVIRONMENT
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div><span style={{ color: '#64748b' }}>WEATHER:</span> <strong style={{ color: '#38bdf8' }}>CLEAR SKY</strong></div>
              <div><span style={{ color: '#64748b' }}>VISIBILITY:</span> <strong style={{ color: '#f1f5f9' }}>100%</strong></div>
              <div><span style={{ color: '#64748b' }}>DUST (TAU):</span> <strong style={{ color: '#34d399' }}>0.42</strong></div>
              <div><span style={{ color: '#64748b' }}>TERRAIN:</span> <strong style={{ color: '#f1f5f9' }}>CRATER-07</strong></div>
            </div>
          </div>

          {/* Panel 3: Mission Task */}
          <div style={{
            padding: 16,
            background: 'rgba(4, 8, 22, 0.7)',
            border: '1px solid var(--border-hairline)',
            borderRadius: 10
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#a855f7', fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Target size={13} /> MISSION OBJECTIVE
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <div><span style={{ color: '#64748b' }}>TASK ID:</span> <strong style={{ color: '#f1f5f9' }}>TASK 04</strong></div>
              <div><span style={{ color: '#64748b' }}>SAMPLE:</span> <strong style={{ color: '#38bdf8' }}>BRAVO RIDGE</strong></div>
              <div><span style={{ color: '#64748b' }}>PROGRESS:</span> <strong style={{ color: '#34d399' }}>62%</strong></div>
              <div><span style={{ color: '#64748b' }}>ENERGY:</span> <strong style={{ color: '#fbbf24' }}>-45 W DRAIN</strong></div>
            </div>
          </div>
        </div>

        {/* Tactical Radar Display Centerpiece */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RadarCanvas position={{ x: 284, y: 322, heading: 42 }} width={540} height={360} />
        </div>
      </div>
    </section>
  );
}
