import React from 'react';
import { MissionTimeline } from '../../components/mission/MissionTimeline';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useWorldState } from '../../store/WorldStateContext.jsx';
import { Target, Route, Zap, Compass, CheckCircle2 } from 'lucide-react';

export function MissionPage() {
  const { worldState, missionPlan, connected, freshnessText } = useWorldState();
  const mission = worldState?.mission;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ─── Top Header Ribbon ─── */}
      <div className="glass-panel" style={{
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Target size={18} color="#c084fc" />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f1f5f9' }}>
              Autonomous Mission Planner & Waypoint Tracker (Objective 6)
            </div>
            <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
              A* Pathfinding with Terrain Slope Weighting • Dynamic Replanning Contingencies • MissionManager
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <StatusBadge variant="info">
            {mission?.readyTasks?.length ? `${mission.readyTasks.length} Ready Tasks` : '5 Waypoints'}
          </StatusBadge>
          <StatusBadge variant={connected ? 'success' : 'danger'} pulse={connected}>
            {connected ? `Planner: ${freshnessText}` : 'Planner Offline'}
          </StatusBadge>
        </div>
      </div>

      {/* ─── Center Grid: Timeline + Plan Scoring ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* Mission Timeline */}
        <MissionTimeline />

        {/* Plan Scoring & Contingency Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Plan Scoring */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <div className="section-header">
              <Route size={14} color="#38bdf8" />
              <span className="section-title">Active Route Multi-Factor Scoring</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Energy Cost Forecast', value: `${missionPlan?.scoring?.energyCostForecastWh || 285} Wh`, pct: 45, color: 'progress-bar-fill-mars' },
                { label: 'Path Traversal Distance', value: `${missionPlan?.scoring?.pathDistanceMeters || 1240} m`, pct: 62, color: 'progress-bar-fill-cyan' },
                { label: 'Estimated Traversal Time', value: `${(missionPlan?.scoring?.estimatedDurationMinutes || 168) / 60} hrs`, pct: 35, color: 'progress-bar-fill-emerald' },
                { label: 'Terrain Slope Risk Index', value: `${missionPlan?.scoring?.terrainRiskIndex || 0.23} (Low)`, pct: 23, color: 'progress-bar-fill-emerald' }
              ].map((s, idx) => (
                <div key={idx}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: '0.75rem', fontWeight: 600,
                    marginBottom: 4
                  }}>
                    <span style={{ color: '#94a3b8' }}>{s.label}</span>
                    <span style={{ color: '#f1f5f9' }}>{s.value}</span>
                  </div>
                  <div className="progress-bar">
                    <div className={`progress-bar-fill ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contingency Plans */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <div className="section-header">
              <Zap size={14} color="#fb923c" />
              <span className="section-title" style={{ color: '#fb923c' }}>Autonomous Contingency Replanning</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { trigger: 'Dust Storm (Tau > 1.0)', action: 'DUST_STORM_HOLDING + DTN buffering', status: 'ARMED' },
                { trigger: 'Battery SOC < 15% Floor', action: 'RETURN_TO_BASE + solar recharge', status: 'ARMED' },
                { trigger: 'Path Slope Obstruction (> 25°)', action: 'A* alternate route via delta fan bypass', status: 'ARMED' }
              ].map((c, idx) => (
                <div key={idx} className="inner-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#f1f5f9', fontWeight: 600 }}>
                      {c.trigger}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#38bdf8', marginTop: 2 }}>
                      → {c.action}
                    </div>
                  </div>
                  <StatusBadge variant="warning">{c.status}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
