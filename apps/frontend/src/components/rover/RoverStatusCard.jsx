import React from 'react';
import { Battery, Zap, Thermometer, Gauge as GaugeIcon, Activity } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

export function RoverStatusCard({ telemetry }) {
  const t = telemetry || {};
  const battery = t.batteryLevel !== undefined ? t.batteryLevel * (t.batteryLevel <= 1 ? 100 : 1) : 94.2;
  const solar = t.solarInputWatts !== undefined ? t.solarInputWatts : 578;
  const temp = t.externalTempCelsius !== undefined ? t.externalTempCelsius : -62.4;
  const slip = t.wheelSlipRatio !== undefined ? t.wheelSlipRatio * 100 : 4.0;

  const isLowPower = battery < 15.0;
  const isHighSlip = slip > 20.0;

  const metrics = [
    {
      label: 'BATT_SOC',
      value: `${battery.toFixed(1)}%`,
      sub: battery > 15 ? '15.0% Floor OK' : 'CRITICAL RESERVE',
      icon: <Battery size={14} color={isLowPower ? 'var(--signal-critical)' : 'var(--signal-nominal)'} />,
      color: isLowPower ? 'var(--signal-critical)' : 'var(--signal-nominal)',
      pct: Math.min(100, Math.max(0, battery)),
    },
    {
      label: 'SOLAR_PWR',
      value: `${Math.round(solar)} W`,
      sub: solar > 200 ? 'Active' : 'Dust Tau Peak',
      icon: <Zap size={14} color="var(--signal-caution)" />,
      color: 'var(--signal-caution)',
      pct: Math.min(100, (solar / 750) * 100),
    },
    {
      label: 'EXT_TEMP',
      value: `${temp > 0 ? `+${temp.toFixed(1)}` : temp.toFixed(1)}°C`,
      sub: 'Avionics HTR Nom',
      icon: <Thermometer size={14} color="var(--structure-ink-light)" />,
      color: 'var(--structure-ink-light)',
      pct: Math.min(100, Math.max(10, ((temp + 120) / 140) * 100)),
    },
    {
      label: 'WHEEL_SLIP',
      value: `${slip.toFixed(1)}%`,
      sub: isHighSlip ? 'Slip Hazard' : 'Regolith Grip OK',
      icon: <GaugeIcon size={14} color={isHighSlip ? 'var(--signal-critical)' : 'var(--structure-ink-light)'} />,
      color: isHighSlip ? 'var(--signal-critical)' : 'var(--structure-ink-light)',
      pct: Math.min(100, Math.max(5, (slip / 50) * 100)),
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: 16 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 8,
        marginBottom: 12,
        borderBottom: '1px solid var(--structure-ink)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={14} color="var(--structure-ink-light)" />
          <span className="section-title">
            Rover Telemetry
          </span>
        </div>

        <StatusBadge variant={isLowPower ? 'danger' : 'success'}>
          {isLowPower ? 'LOW POWER WARNING' : 'ALL SYSTEMS NOMINAL'}
        </StatusBadge>
      </div>

      {/* Strict Dense List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-app)',
              borderBottom: idx === metrics.length - 1 ? 'none' : '1px solid var(--structure-ink)',
              padding: '10px 4px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {m.icon}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: '#94A3B8',
                    letterSpacing: '0.05em'
                  }}>{m.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-main)',
                    fontSize: '0.65rem',
                    color: '#64748B'
                  }}>{m.sub}</span>
                </div>
              </div>
              <div className="tabular-nums" style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: m.color,
                textAlign: 'right'
              }}>
                {m.value}
              </div>
            </div>
            {/* Progress Bar Indicator */}
            <div className="progress-bar" style={{ marginTop: 8, height: '1px', background: 'var(--structure-ink)' }}>
              <div className="progress-bar-fill" style={{ width: `${m.pct}%`, background: m.color, height: '100%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
