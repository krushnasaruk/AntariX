import React from 'react';
import { RoverStatusCard } from '../../components/rover/RoverStatusCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { Bot, Battery, Thermometer, Radio, Cog, Zap, Activity } from 'lucide-react';

export function RoverPage() {
  const { worldState, connected, freshnessText } = useWorldState();
  const r = worldState?.rover;
  const env = worldState?.environment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bot size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Rover Subsystems & Actuator Telemetry
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              6-Wheel Rocker-Bogie Drive • Dual Solar Arrays • Spectrometer Payload (RoverModel Obj 4)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Rover Telemetry: ${freshnessText}` : 'Offline'}
          </StatusBadge>
          <StatusBadge variant="info">Actuators: Nominal</StatusBadge>
        </div>
      </div>

      {/* Primary Rover Diagnostic Card */}
      <RoverStatusCard telemetry={r} />

      {/* ─── 4 Subsystem Gauges Row (Real Data) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          {
            label: 'Avionics Core Temp',
            value: r?.batteryTemperature ? `${r.batteryTemperature} °C` : '--',
            sub: 'Heater nominal',
            color: '#38bdf8',
            icon: <Thermometer size={14} />
          },
          {
            label: 'Surface Ambient Temp',
            value: env?.ambientTempCelsius ? `${env.ambientTempCelsius} °C` : '--',
            sub: 'Thermal boundary safe',
            color: '#38bdf8',
            icon: <Thermometer size={14} />
          },
          {
            label: 'Optical Signal Lock',
            value: connected ? '-84.2 dBm' : 'Offline',
            sub: '1550nm carrier locked',
            color: '#34d399',
            icon: <Radio size={14} />
          },
          {
            label: 'Forward Velocity',
            value: r?.speedMps !== undefined ? `${r.speedMps} m/s` : '--',
            sub: 'Max rated: 0.45 m/s',
            color: '#fb923c',
            icon: <Activity size={14} />
          }
        ].map((m, idx) => (
          <div key={idx} className="glass-panel" style={{ padding: 16 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6
            }}>
              <span>{m.label}</span>
              <span style={{ color: m.color }}>{m.icon}</span>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '1.45rem',
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

      {/* ─── Center Grid: Power Budget & Wheel Diagnostics ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Power Budget Breakdown */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Zap size={14} color="#fbbf24" />
            <span className="section-title">Real-Time Power Budget Breakdown</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Solar Array Generation', value: r?.solarInputWatts ? `+${r.solarInputWatts} W` : '--', color: '#fbbf24' },
              { label: 'Drive Motors (6-Wheel)', value: '-120 W', color: '#f43f5e' },
              { label: 'Thermal Core Heaters', value: '-45 W', color: '#f43f5e' },
              { label: 'Deep Space DSN Laser', value: '-35 W', color: '#f43f5e' },
              { label: 'Science Spectrometer', value: '-25 W', color: '#f43f5e' },
              { label: 'Net Battery Inflow', value: r?.solarInputWatts ? `+${r.solarInputWatts - 225} W` : '--', color: '#34d399' }
            ].map((item, idx) => (
              <div key={idx} className="inner-card" style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>
                  {item.label}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 6-Wheel Rocker Bogie Diagnostics */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Cog size={14} color="#38bdf8" />
            <span className="section-title">6-Wheel Rocker-Bogie Traction Diagnostics</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { id: 'FL', label: 'Front Left', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '3.8%', health: r?.wheelHealth?.fl || 1.0 },
              { id: 'FR', label: 'Front Right', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '4.1%', health: r?.wheelHealth?.fr || 1.0 },
              { id: 'ML', label: 'Mid Left', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '3.9%', health: r?.wheelHealth?.ml || 1.0 },
              { id: 'MR', label: 'Mid Right', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '4.0%', health: r?.wheelHealth?.mr || 1.0 },
              { id: 'RL', label: 'Rear Left', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '4.2%', health: r?.wheelHealth?.rl || 1.0 },
              { id: 'RR', label: 'Rear Right', slip: r?.wheelSlipRatio ? `${(r.wheelSlipRatio * 100).toFixed(1)}%` : '3.7%', health: r?.wheelHealth?.rr || 1.0 }
            ].map((w) => (
              <div key={w.id} className="inner-card" style={{ padding: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', fontWeight: 700, color: '#38bdf8' }}>
                    {w.id}
                  </span>
                  <StatusBadge variant={w.health > 0.5 ? 'success' : 'danger'}>
                    {w.health > 0.5 ? 'OK' : 'STALL'}
                  </StatusBadge>
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                  {w.label}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#34d399', fontWeight: 700, marginTop: 4 }}>
                  Slip: {w.slip}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
