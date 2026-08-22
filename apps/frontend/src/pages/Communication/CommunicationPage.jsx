import React, { useState, useEffect } from 'react';
import { sendDTNCommand, toggleBlackout as apiToggleBlackout, fetchDTNQueue } from '../../api/communicationApi.js';
import { formatSecondsToTime } from '../../utils/formatters';
import { COMMAND_TYPES } from '../../utils/constants';
import { PacketQueueTable } from '../../components/communication/PacketQueueTable';
import { BlackoutDecisionLog } from '../../components/autonomy/BlackoutDecisionLog';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { Radio, Send, Satellite, Wifi, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export function CommunicationPage() {
  const { worldState, connected, freshnessText } = useWorldState();
  const [cmdType, setCmdType] = useState('MOVE_ROVER');
  const [paramsStr, setParamsStr] = useState('{"dx": 10, "dy": 0}');
  const [txStatus, setTxStatus] = useState(null);
  const [blackoutActive, setBlackoutActive] = useState(false);
  const [queueData, setQueueData] = useState([]);

  const comm = worldState?.communication;

  useEffect(() => {
    const loadQueue = () => {
      fetchDTNQueue().then(res => {
        if (res?.data?.uplink) setQueueData(res.data.uplink);
      }).catch(() => {});
    };
    loadQueue();
    const interval = setInterval(loadQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = async () => {
    try {
      let parsed = {};
      try {
        parsed = paramsStr ? JSON.parse(paramsStr) : {};
      } catch {
        parsed = { rawInput: paramsStr };
      }
      const res = await sendDTNCommand(cmdType, parsed);
      const isBlocked = res?.packet?.status === 'BUFFERED_DURING_BLACKOUT' || blackoutActive;
      if (isBlocked) {
        setTxStatus(`⚠ Transmission Buffered — Command ${cmdType} stored in DTN flash buffer (${res.packet?.id || 'PKT-OK'})`);
      } else {
        setTxStatus(`✓ Command ${cmdType} queued in DTN pipeline (${res.packet?.id || 'PKT-OK'})`);
      }
      fetchDTNQueue().then(r => { if (r?.data?.uplink) setQueueData(r.data.uplink); });
    } catch (e) {
      setTxStatus('✗ Network error: unable to reach Deep Space Gateway');
    }
  };

  const handleToggleBlackout = async () => {
    const nextState = !blackoutActive;
    setBlackoutActive(nextState);
    await apiToggleBlackout(nextState).catch(() => {});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Radio size={18} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Deep Space Optical Communication & DTN Pipeline
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              DSN 1550nm Laser Carrier • RFC 5050 Bundle Protocol • Store-and-Forward Routing
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={blackoutActive ? 'danger' : 'success'} pulse={blackoutActive}>
            {blackoutActive ? 'Solar Conjunction Blackout' : 'Optical Link Locked'}
          </StatusBadge>
          <StatusBadge variant="info">100 Mbps Bandwidth</StatusBadge>
        </div>
      </div>

      {/* ─── 4 Link Status Metrics (Real Data) ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          {
            label: 'Light Propagation Delay',
            value: comm?.oneWayDelaySec !== undefined ? formatSecondsToTime(comm.oneWayDelaySec) : '--',
            sub: comm?.distanceKm ? `${(comm.distanceKm / 1e6).toFixed(0)}M km distance` : '225M km nominal',
            color: '#fb923c',
            icon: <Satellite size={14} />
          },
          {
            label: 'Optical Bandwidth',
            value: comm?.opticalBandwidthMbps ? `${comm.opticalBandwidthMbps} Mbps` : '100 Mbps',
            sub: `${comm?.carrierWavelengthNm || 1550}nm laser carrier`,
            color: '#38bdf8',
            icon: <Wifi size={14} />
          },
          {
            label: 'Link Signal Margin',
            value: comm?.linkMarginDb ? `${comm.linkMarginDb.toFixed(1)} dB` : '14.2 dB',
            sub: 'BER: 10⁻⁹ nominal',
            color: '#34d399',
            icon: <Radio size={14} />
          },
          {
            label: 'DTN Buffer Status',
            value: comm?.dtnQueueSize !== undefined ? `${comm.dtnQueueSize} Bundles` : '0 Dropped',
            sub: 'Store & forward ready',
            color: '#c084fc',
            icon: <ShieldCheck size={14} />
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
              fontFamily: 'var(--font-mono)', fontSize: '1.5rem',
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

      {/* ─── Orbital Ephemeris & Distance Presets (Live Calculation) ─── */}
      <div className="glass-panel" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Satellite size={15} color="#38bdf8" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>
            Earth–Mars Ephemeris Orbital Distance:
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#fb923c', fontWeight: 700 }}>
            {comm?.distanceKm ? `${(comm.distanceKm / 1e6).toFixed(1)}M km` : '288.0M km'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Opposition (54.6M km)', dist: 54600000 },
            { label: 'Nominal (225M km)', dist: 225000000 },
            { label: 'Current Live (288M km)', dist: 288000000 },
            { label: 'Conjunction (401M km)', dist: 401000000 }
          ].map((preset) => {
            const isSelected = comm?.distanceKm === preset.dist;
            return (
              <button
                key={preset.dist}
                onClick={async () => {
                  await import('../../api/communicationApi.js').then(m => m.updateDistance(preset.dist));
                }}
                className="hud-button"
                style={{
                  fontSize: '0.6875rem',
                  padding: '4px 10px',
                  background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSelected ? '#38bdf8' : 'var(--border-subtle)',
                  color: isSelected ? '#38bdf8' : '#94a3b8',
                  fontWeight: isSelected ? 700 : 500
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Center Grid: Command Transmitter & Blackout Simulation ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Command Transmitter */}
        <div className="glass-panel" style={{ padding: 20 }}>
          <div className="section-header">
            <Send size={14} color="#38bdf8" />
            <span className="section-title">Deep Space Uplink Command Transmitter</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                Command Type
              </label>
              <select value={cmdType} onChange={e => setCmdType(e.target.value)} className="hud-select">
                {COMMAND_TYPES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                JSON Telemetry Payload
              </label>
              <textarea
                rows="3"
                value={paramsStr}
                onChange={e => setParamsStr(e.target.value)}
                className="hud-textarea"
              />
            </div>

            <button onClick={handleSend} className="hud-button hud-button-primary" style={{ alignSelf: 'flex-start', padding: '8px 18px' }}>
              <Send size={13} />
              Transmit via Deep Space Network
            </button>

            {txStatus && (
              <div style={{
                padding: '10px 14px',
                background: txStatus.startsWith('✓') ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${txStatus.startsWith('✓') ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: 6,
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: txStatus.startsWith('✓') ? '#38bdf8' : '#fb923c'
              }}>
                {txStatus}
              </div>
            )}
          </div>
        </div>

        {/* Blackout & Priority Tiers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Blackout toggle */}
          <div className={blackoutActive ? 'glass-panel-danger' : 'glass-panel'} style={{ padding: 20 }}>
            <div className="section-header">
              <AlertTriangle size={14} color={blackoutActive ? '#f43f5e' : '#fb923c'} />
              <span className="section-title" style={{ color: blackoutActive ? '#f43f5e' : '#fb923c' }}>
                Solar Conjunction Blackout Simulator
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: 14 }}>
              During Solar Conjunction, Mars passes behind the Sun causing total radio blackout for up to 14 sols. All packets are buffered locally via DTN store-and-forward.
            </p>
            <button
              onClick={handleToggleBlackout}
              className={blackoutActive ? 'hud-button-danger hud-button' : 'hud-button hud-button-mars'}
              style={{ width: '100%', padding: '8px' }}
            >
              {blackoutActive ? 'Disable Blackout Simulation' : 'Simulate Solar Conjunction Blackout'}
            </button>
          </div>

          {/* DTN Priority Info */}
          <div className="glass-panel" style={{ padding: 18 }}>
            <div className="section-header">
              <span className="section-title">DTN 4-Tier Priority Engine</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { tier: 'CRITICAL', desc: 'Hazard alerts & SafetyValidator vetoes', variant: 'danger' },
                { tier: 'HIGH', desc: 'Real-time rover kinematics & battery telemetry', variant: 'warning' },
                { tier: 'NORMAL', desc: 'Scientific drill spectrometry & imagery', variant: 'info' },
                { tier: 'LOW', desc: 'Diagnostic background logs & housekeeping', variant: 'neutral' }
              ].map((t, idx) => (
                <div key={idx} className="inner-card" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px'
                }}>
                  <StatusBadge variant={t.variant}>{t.tier}</StatusBadge>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                    {t.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom: Packet Queue Table (Real Data) ─── */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div className="section-header">
          <span className="section-title">Active DTN Store-and-Forward Packet Queue</span>
        </div>
        <PacketQueueTable queue={queueData} />
      </div>

      {/* ─── Blackout Autonomous RL Decision Stream ─── */}
      <BlackoutDecisionLog isBlackout={blackoutActive} />
    </div>
  );
}
