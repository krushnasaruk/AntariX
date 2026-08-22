import React from 'react';
import { MapPin, CheckCircle2, Circle, Clock, Navigation } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

const DEMO_WAYPOINTS = [
  { id: 1, name: 'Alpha Site — Landing Zone', x: 100, y: 150, status: 'COMPLETED', sol: 1, desc: 'Touchdown telemetry & initial mast deploy' },
  { id: 2, name: 'Bravo Ridge — Delta Fan', x: 280, y: 320, status: 'COMPLETED', sol: 15, desc: 'Layered clay rock traverse completed' },
  { id: 3, name: 'Charlie Basin — Clay Deposit', x: 450, y: 580, status: 'ACTIVE', sol: 42, desc: 'Autonomous drill sampling & core caching' },
  { id: 4, name: 'Delta Crater — Edge Sampling', x: 800, y: 720, status: 'PENDING', sol: null, desc: 'High-slope rim approach survey' },
  { id: 5, name: 'Echo Plains — Return Traverse', x: 600, y: 400, status: 'PENDING', sol: null, desc: 'Fast traverse return to base outpost' }
];

const statusConfig = {
  COMPLETED: { color: '#34d399', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.30)', badge: 'success' },
  ACTIVE: { color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.35)', badge: 'info' },
  PENDING: { color: '#94a3b8', bg: 'rgba(255, 255, 255, 0.03)', border: 'var(--border-subtle)', badge: 'neutral' }
};

export function MissionTimeline({ waypoints = DEMO_WAYPOINTS }) {
  const completed = waypoints.filter(w => w.status === 'COMPLETED').length;
  const progressPct = Math.round((completed / waypoints.length) * 100);

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <div className="section-header">
        <MapPin size={16} color="#38bdf8" />
        <span className="section-title">Mission Waypoints & Traverse Timeline</span>
        <span className="section-subtitle" style={{ marginLeft: 'auto' }}>
          {completed}/{waypoints.length} Completed • {progressPct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 18 }}>
        <div className="progress-bar-fill progress-bar-fill-cyan" style={{ width: `${progressPct}%` }} />
      </div>

      {/* Timeline List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {waypoints.map((wp) => {
          const cfg = statusConfig[wp.status] || statusConfig.PENDING;
          const isActive = wp.status === 'ACTIVE';

          return (
            <div
              key={wp.id}
              className="inner-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '12px 16px',
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderLeft: `4px solid ${cfg.color}`
              }}
            >
              {/* Status Icon */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: cfg.bg, border: `2px solid ${cfg.color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2
              }}>
                {wp.status === 'COMPLETED' && <CheckCircle2 size={13} color="#34d399" />}
                {wp.status === 'ACTIVE' && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#38bdf8',
                    animation: 'pulse-dot 1.5s infinite'
                  }} />
                )}
                {wp.status === 'PENDING' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748b' }} />
                )}
              </div>

              {/* Waypoint Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{
                    fontFamily: 'var(--font-main)',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    color: isActive ? '#38bdf8' : '#f1f5f9'
                  }}>
                    {wp.name}
                  </span>
                  <StatusBadge variant={cfg.badge} pulse={isActive}>
                    {wp.status}
                  </StatusBadge>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {wp.desc}
                </div>

                <div style={{
                  display: 'flex', gap: 14,
                  fontFamily: 'var(--font-mono)', fontSize: '0.6875rem',
                  color: '#64748b', marginTop: 6
                }}>
                  <span>Grid: ({wp.x}, {wp.y})</span>
                  {wp.sol && <span style={{ color: '#38bdf8' }}>Sol {wp.sol}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
