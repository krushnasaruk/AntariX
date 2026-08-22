import React from 'react';
import { Battery, Zap, Thermometer, Gauge as GaugeIcon, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
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
      label: 'BATTERY STATE OF CHARGE',
      value: `${battery.toFixed(1)}%`,
      sub: battery > 15 ? '15.0% Reserve Floor • Nominal' : 'CRITICAL RESERVE VIOLATION',
      icon: <Battery size={15} color={isLowPower ? '#f43f5e' : '#34d399'} />,
      color: isLowPower ? '#f43f5e' : '#34d399',
      pct: Math.min(100, Math.max(0, battery)),
      barColor: isLowPower ? '#f43f5e' : '#10b981'
    },
    {
      label: 'SOLAR ARRAY INPUT',
      value: `${Math.round(solar)} W`,
      sub: solar > 200 ? 'Triple-Junction GaAs • Active' : 'Low Irradiance • Dust Tau Peak',
      icon: <Zap size={15} color="#fbbf24" />,
      color: '#fbbf24',
      pct: Math.min(100, (solar / 750) * 100),
      barColor: '#f59e0b'
    },
    {
      label: 'MARTIAN SURFACE TEMP',
      value: `${temp > 0 ? `+${temp.toFixed(1)}` : temp.toFixed(1)}°C`,
      sub: 'Jezero Sector 07 • Avionics Heaters Nominal',
      icon: <Thermometer size={15} color="#38bdf8" />,
      color: '#38bdf8',
      pct: Math.min(100, Math.max(10, ((temp + 120) / 140) * 100)),
      barColor: '#0284c7'
    },
    {
      label: '6-WHEEL TRACTION SLIP',
      value: `${slip.toFixed(1)}%`,
      sub: isHighSlip ? 'High Slip Hazard • Intercept Armed' : 'Rocker-Bogie Regolith Grip OK',
      icon: <GaugeIcon size={15} color={isHighSlip ? '#fb923c' : '#a855f7'} />,
      color: isHighSlip ? '#fb923c' : '#c084fc',
      pct: Math.min(100, Math.max(5, (slip / 50) * 100)),
      barColor: isHighSlip ? '#ea580c' : '#9333ea'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12,
        marginBottom: 16,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={16} color="#38bdf8" />
          <span className="section-title" style={{ color: '#f1f5f9' }}>
            Rover Subsystem Diagnostics & Physical State
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge variant={isLowPower ? 'danger' : 'success'} pulse>
            {isLowPower ? 'LOW POWER WARNING' : 'ALL SYSTEMS NOMINAL'}
          </StatusBadge>
        </div>
      </div>

      {/* 2x2 Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 14
      }}>
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="inner-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '14px 16px',
              background: 'rgba(15, 23, 42, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderLeft: `4px solid ${m.color}`
            }}
          >
            {/* Top Row: Icon + Label */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: 'var(--font-main)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#94a3b8'
              }}>
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </div>
            </div>

            {/* Value Row */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              {m.value}
            </div>

            {/* Sub-label */}
            <div style={{
              fontSize: '0.6875rem',
              color: '#94a3b8',
              lineHeight: 1.3
            }}>
              {m.sub}
            </div>

            {/* Progress Bar Indicator */}
            <div style={{
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.08)',
              marginTop: 4,
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${m.pct}%`,
                height: '100%',
                background: m.barColor,
                borderRadius: 2,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
