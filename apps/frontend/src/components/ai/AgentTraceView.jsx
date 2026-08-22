import React from 'react';
import { BrainCircuit, Activity } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

const DEMO_TRACES = [
  { time: '11:42:01', agent: 'NAV_AGENT', decision: 'Adjusted steering +4.2° to avoid high-slip loose sand dune', severity: 'INFO' },
  { time: '11:40:15', agent: 'ANOMALY_DETECTOR', decision: 'Subsystem battery consumption within nominal 120W envelope', severity: 'INFO' },
  { time: '11:38:00', agent: 'MISSION_PLANNER', decision: 'Waypoint Bravo Ridge reached. Autonomous spectrometer sequence armed.', severity: 'INFO' },
  { time: '11:35:22', agent: 'SAFETY_VALIDATOR', decision: 'Battery reserve above 15% floor — MOVE_ROVER kinematics verified', severity: 'SUCCESS' },
  { time: '11:32:48', agent: 'ANOMALY_DETECTOR', decision: 'Wheel motor current spike detected on FL actuator — monitoring impedance', severity: 'WARNING' }
];

const AGENT_COLORS = {
  NAV_AGENT: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.25)' },
  ANOMALY_DETECTOR: { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.08)', border: 'rgba(251, 146, 60, 0.25)' },
  MISSION_PLANNER: { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.08)', border: 'rgba(192, 132, 252, 0.25)' },
  SAFETY_VALIDATOR: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.25)' }
};

const SEVERITY_VARIANTS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger'
};

export function AgentTraceView({ traces = DEMO_TRACES, maxItems = 5 }) {
  const visibleTraces = traces.slice(0, maxItems);

  return (
    <div className="glass-panel" style={{ padding: 18 }}>
      <div className="section-header">
        <BrainCircuit size={15} color="#fb923c" />
        <span className="section-title" style={{ color: '#fb923c' }}>
          AI Executive Reasoning & Multi-Agent Trace Stream
        </span>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge variant="info">Level 4 Active</StatusBadge>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {visibleTraces.map((t, idx) => {
          const agentStyle = AGENT_COLORS[t.agent] || AGENT_COLORS.NAV_AGENT;
          return (
            <div
              key={idx}
              className="inner-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: agentStyle.bg,
                border: `1px solid ${agentStyle.border}`
              }}
            >
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#64748b',
                whiteSpace: 'nowrap'
              }}>
                {t.time}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: agentStyle.color,
                whiteSpace: 'nowrap'
              }}>
                [{t.agent}]
              </span>
              <span style={{
                fontFamily: 'var(--font-main)',
                fontSize: '0.75rem',
                color: '#e2e8f0',
                lineHeight: 1.45,
                flex: 1
              }}>
                {t.decision}
              </span>
              <StatusBadge variant={SEVERITY_VARIANTS[t.severity] || 'info'}>
                {t.severity}
              </StatusBadge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
