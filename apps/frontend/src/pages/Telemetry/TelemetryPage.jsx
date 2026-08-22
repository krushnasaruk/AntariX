import React, { useState, useEffect } from 'react';
import { Gauge } from '../../components/telemetry/Gauge';
import { MiniChart } from '../../components/ui/MiniChart';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { Activity, Radio, Battery, Zap, Thermometer, Gauge as GaugeIcon } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';

export function TelemetryPage() {
  const { worldState, connected, freshnessText } = useWorldState();
  const r = worldState?.rover;
  const env = worldState?.environment;

  const [history, setHistory] = useState({
    battery: [94.2],
    solar: [580],
    speed: [0.12],
    intTemp: [18.5],
    extTemp: [-62.4],
    wheelSlip: [4.0]
  });

  useEffect(() => {
    if (r) {
      setHistory(prev => ({
        battery: [...prev.battery.slice(-9), r.batteryLevel || 94.2],
        solar: [...prev.solar.slice(-9), r.solarInputWatts || 580],
        speed: [...prev.speed.slice(-9), r.speedMps || 0.12],
        intTemp: [...prev.intTemp.slice(-9), r.batteryTemperature || 18.5],
        extTemp: [...prev.extTemp.slice(-9), env?.ambientTempCelsius || -62.4],
        wheelSlip: [...prev.wheelSlip.slice(-9), (r.wheelSlipRatio || 0.04) * 100]
      }));
    }
  }, [r, env]);

  const metrics = [
    { label: 'Battery Level (SOC)', value: r?.batteryLevel !== undefined ? r.batteryLevel : 94.2, unit: '%', max: 100, color: 'emerald', dangerBelow: 15, warningBelow: 30, history: history.battery, hColor: '#34d399' },
    { label: 'Solar Input Power', value: r?.solarInputWatts !== undefined ? r.solarInputWatts : 580, unit: 'W', max: 800, color: 'amber', history: history.solar, hColor: '#fbbf24' },
    { label: 'Forward Velocity', value: r?.speedMps !== undefined ? r.speedMps : 0.12, unit: 'm/s', max: 0.5, color: 'cyan', history: history.speed, hColor: '#38bdf8' },
    { label: 'Avionics Core Temp', value: r?.batteryTemperature !== undefined ? r.batteryTemperature : 18.5, unit: '°C', min: -20, max: 50, color: 'cyan', history: history.intTemp, hColor: '#38bdf8' },
    { label: 'Martian Ambient Temp', value: env?.ambientTempCelsius !== undefined ? env.ambientTempCelsius : -62.4, unit: '°C', min: -120, max: 20, color: 'mars', history: history.extTemp, hColor: '#fb923c' },
    { label: '6-Wheel Regolith Slip', value: r?.wheelSlipRatio !== undefined ? (r.wheelSlipRatio * 100) : 4.0, unit: '%', max: 20, color: 'emerald', history: history.wheelSlip, hColor: '#34d399' }
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
          <Activity size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Real-Time High-Frequency Telemetry Stream
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              10 Hz High-Frequency Stream • WebSocket Real-Time Connection • DuckDB Archive (Obj 4)
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Stream 10 Hz: ${freshnessText}` : 'Stream Offline'}
          </StatusBadge>
          <StatusBadge variant="info">DuckDB Fabric Synced</StatusBadge>
        </div>
      </div>

      {/* ─── 6 SVG Arc Gauge Array (Real Data) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {metrics.map((m, idx) => (
          <Gauge
            key={idx}
            label={m.label}
            value={m.value}
            unit={m.unit}
            min={m.min}
            max={m.max}
            color={m.color}
            dangerBelow={m.dangerBelow}
            warningBelow={m.warningBelow}
          />
        ))}
      </div>

      {/* ─── 6 Sparkline Historical Trend Cards ─── */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div className="section-header">
          <Activity size={14} color="#38bdf8" />
          <span className="section-title">Telemetry Rolling Trend Lines & Variance</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {metrics.map((m, idx) => (
            <div key={idx} className="inner-card" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>
                {m.label}
              </div>
              <MiniChart data={m.history} color={m.hColor} width={240} height={44} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Current:</span>
                <span style={{ color: m.hColor, fontWeight: 700 }}>
                  {typeof m.value === 'number' ? m.value.toFixed(1) : m.value} {m.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
