import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

const DEMO_EVENTS = [
  {
    id: 1,
    time: '11:42:18',
    proposedAction: 'MOVE_ROVER',
    executedAction: 'MOVE_ROVER',
    verdict: 'APPROVED',
    reason: 'All safety checks passed — battery 87%, slope 12°, no obstacles detected',
    agentSource: 'NAV_AGENT'
  },
  {
    id: 2,
    time: '11:38:55',
    proposedAction: 'MOVE_ROVER',
    executedAction: 'RETURN_TO_BASE',
    verdict: 'INTERCEPTED',
    reason: 'CRITICAL_BATTERY_RESERVE_FLOOR_VIOLATION — Battery at 13% (< 15% minimum threshold)',
    agentSource: 'ANOMALY_DETECTOR'
  },
  {
    id: 3,
    time: '11:35:02',
    proposedAction: 'DRILL_SAMPLE',
    executedAction: 'WAIT',
    verdict: 'INTERCEPTED',
    reason: 'SLOPE_ANGLE_EXCEEDED — Terrain slope 28° exceeds 25° maximum allowable stability',
    agentSource: 'MISSION_PLANNER'
  }
];

export function SafetyGateMonitor({ events = DEMO_EVENTS }) {
  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'APPROVED': return { variant: 'success', color: '#10b981', border: '#10b981', Icon: ShieldCheck };
      case 'INTERCEPTED': return { variant: 'danger', color: '#f43f5e', border: '#f43f5e', Icon: ShieldAlert };
      case 'OVERRIDDEN': return { variant: 'warning', color: '#fb923c', border: '#fb923c', Icon: ShieldX };
      default: return { variant: 'neutral', color: '#94a3b8', border: '#94a3b8', Icon: ShieldCheck };
    }
  };

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div className="section-header">
        <ShieldCheck size={16} color="#10b981" />
        <span className="section-title" style={{ color: '#34d399' }}>
          Authoritative Safety Validator Intercept Log
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge variant="success" pulse>GATE ACTIVE</StatusBadge>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((evt) => {
          const { variant, color, border, Icon } = getVerdictStyle(evt.verdict);
          const isApproved = evt.verdict === 'APPROVED';

          return (
            <div
              key={evt.id}
              className="inner-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 16px',
                borderLeft: `4px solid ${border}`,
                background: isApproved ? 'rgba(16, 185, 129, 0.04)' : 'rgba(244, 63, 94, 0.04)'
              }}
            >
              {/* Header Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: '#94a3b8', fontWeight: 600
                  }}>
                    {evt.time}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                    color: '#38bdf8', fontWeight: 700
                  }}>
                    [{evt.agentSource}]
                  </span>
                </div>

                {/* Actions and Verdict Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge variant="info">{evt.proposedAction}</StatusBadge>
                  <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>→</span>
                  <StatusBadge variant={isApproved ? 'success' : 'danger'}>
                    {evt.executedAction}
                  </StatusBadge>
                  <StatusBadge variant={variant}>
                    <Icon size={11} />
                    {evt.verdict}
                  </StatusBadge>
                </div>
              </div>

              {/* Reason Description */}
              <div style={{
                fontFamily: 'var(--font-main)',
                fontSize: '0.75rem',
                color: isApproved ? '#94a3b8' : '#fb7185',
                lineHeight: 1.45,
                paddingLeft: 2
              }}>
                {evt.reason}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
