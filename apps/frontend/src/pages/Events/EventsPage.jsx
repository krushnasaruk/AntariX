import React, { useState } from 'react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { ShieldCheck, AlertTriangle, Info, Bell, Filter } from 'lucide-react';

export function EventsPage() {
  const { worldState, connected, freshnessText } = useWorldState();
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const events = [
    { id: 'EVT-001', type: 'INFO', time: '14:22:01', module: 'DTN_PROTOCOL', msg: 'Bundle PKT-491 delivered with CRC32 verification success' },
    { id: 'EVT-002', type: 'INFO', time: '14:21:45', module: 'SIM_CORE', msg: 'Simulation stepped forward 1.0s in Jezero Crater sector 07' },
    { id: 'EVT-003', type: 'WARNING', time: '14:20:12', module: 'AUTONOMY_ENGINE', msg: 'Loose sand slope detected (12.4°). Slip ratio adjusted to 4.0%' },
    { id: 'EVT-004', type: 'INFO', time: '14:18:30', module: 'SAFETY_GATE', msg: 'Action MOVE_ROVER verified against 10 hard physical invariants' },
    { id: 'EVT-005', type: 'CRITICAL', time: '14:15:00', module: 'COMM_SUBSYSTEM', msg: 'Solar Conjunction Blackout simulation armed on DTN buffer' }
  ];

  const filtered = filterSeverity === 'ALL'
    ? events
    : events.filter(e => e.type === filterSeverity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Bell size={18} color="#fbbf24" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              System Event Stream & Immutable Mission Audit Log
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              Append-Only Audit Log • Timestamped Provenance • Subsystem Lifecycle Records
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Audit Stream: ${freshnessText}` : 'Audit Stream Offline'}
          </StatusBadge>
          <StatusBadge variant="info">{events.length} System Records</StatusBadge>
        </div>
      </div>

      {/* ─── Filter Bar ─── */}
      <div style={{ display: 'flex', gap: 8 }}>
        {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className="hud-button"
            style={{
              padding: '6px 14px',
              background: filterSeverity === sev ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: filterSeverity === sev ? '#38bdf8' : 'var(--border-subtle)',
              color: filterSeverity === sev ? '#ffffff' : '#94a3b8'
            }}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* ─── Events Table ─── */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <table className="hud-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Severity</th>
              <th>Origin Module</th>
              <th>Event Description</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(evt => (
              <tr key={evt.id}>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{evt.time}</td>
                <td>
                  <StatusBadge variant={evt.type === 'CRITICAL' ? 'danger' : evt.type === 'WARNING' ? 'warning' : 'info'}>
                    {evt.type}
                  </StatusBadge>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8', fontWeight: 600 }}>{evt.module}</td>
                <td style={{ color: '#f1f5f9' }}>{evt.msg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
