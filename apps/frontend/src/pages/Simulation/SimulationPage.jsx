import React, { useState } from 'react';
import { RadarCanvas } from '../../components/simulation/RadarCanvas';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { Orbit, Wind, Thermometer, Eye, Gauge as GaugeIcon, Play, Pause, RotateCcw } from 'lucide-react';

export function SimulationPage() {
  const { worldState, connected, freshnessText, step, reset } = useWorldState();
  const [simRunning, setSimRunning] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  const env = worldState?.environment;
  const rover = worldState?.rover;

  const envMetrics = [
    { label: 'Simulation Environment', value: env?.location || 'Jezero Crater — Sector 07', sub: 'Elevation mapped (Crater07Scenario)', color: '#fb923c', icon: <Orbit size={14} /> },
    { label: 'Martian Gravity Constant', value: `${env?.gravityMps2 || 3.721} m/s²`, sub: '0.3794G acceleration', color: '#38bdf8', icon: <GaugeIcon size={14} /> },
    { label: 'Atmospheric Dust (Tau)', value: env?.atmosphericDustTau ? `${env.atmosphericDustTau} Tau` : '0.42 Tau', sub: 'Clear sky conditions', color: '#34d399', icon: <Eye size={14} /> },
    { label: 'Surface Temperature', value: env?.ambientTempCelsius ? `${env.ambientTempCelsius} °C` : '-62.4 °C', sub: 'Diurnal range: -90° to -15°', color: '#38bdf8', icon: <Thermometer size={14} /> },
    { label: 'Atmospheric Pressure', value: `${env?.surfacePressurePa || 610} Pa`, sub: '0.006 atm CO₂ dominant', color: '#c084fc', icon: <Wind size={14} /> },
    { label: 'Soil Regolith Traction Slip', value: rover?.wheelSlipRatio ? `${(rover.wheelSlipRatio * 100).toFixed(1)}% Slip` : '4.0% Slip', sub: 'Max traction nominal', color: '#fbbf24', icon: <GaugeIcon size={14} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Orbit size={18} color="#fb923c" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Martian Physical Environment & Terrain Kinematics
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Jezero Crater-07 2D Kinematics • Diurnal Thermal Cycles • MarsEnvironment (Obj 4)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => reset(42)}
            className="hud-button"
            style={{ padding: '6px 12px' }}
          >
            <RotateCcw size={13} /> Reset Baseline
          </button>

          <button
            onClick={() => setSimRunning(!simRunning)}
            className="hud-button hud-button-primary"
            style={{ padding: '6px 14px' }}
          >
            {simRunning ? <Pause size={12} /> : <Play size={12} />}
            {simRunning ? 'Pause Engine' : 'Resume Engine'}
          </button>

          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Sim Core: ${freshnessText}` : 'Offline'}
          </StatusBadge>
        </div>
      </div>

      {/* ─── 6 Environment Telemetry Cards (Real Data) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {envMetrics.map((m, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6
            }}>
              <span>{m.label}</span>
              <span style={{ color: m.color }}>{m.icon}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.4rem',
              fontWeight: 700, color: m.color, lineHeight: 1.1
            }}>
              {m.value}
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: 4 }}>
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ─── Full-Size Radar Display Container ─── */}
      <div className="glass-panel" style={{
        padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div className="section-header" style={{ width: '100%' }}>
          <span className="section-title">Tactical Jezero Crater Elevation & Hazard Wireframe</span>
        </div>
        <RadarCanvas position={rover?.position || { x: 284, y: 322, heading: 42 }} width={580} height={380} />
      </div>
    </div>
  );
}
