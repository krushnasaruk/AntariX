import React, { useState, useEffect } from 'react';
import { BrainCircuit, ShieldCheck, ShieldAlert, WifiOff, ArrowRight, Zap, RefreshCw, Activity } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { fetchAutonomyDecision, fetchSafetyInvariants } from '../../api/autonomyApi.js';
import { useWorldState } from '../../store/WorldStateContext.jsx';

export function BlackoutDecisionLog({ isBlackout = false }) {
  const { worldState } = useWorldState();
  const [decisions, setDecisions] = useState([
    {
      id: 'DEC-BLK-001',
      time: '11:45:02',
      state: 'Solar Conjunction Blackout Active • Battery 94.2% • Slope 12.4° • Tau 0.42',
      proposedAction: 'MOVE_ROVER',
      modelSource: 'PPO Reinforcement Learning Policy (Objective 12)',
      reason: 'Optimal gradient traverse along Crater-07 waypoint corridor Bravo-to-Charlie',
      verdict: 'APPROVED',
      safetyRule: 'INV-02 Battery SOC > 15% & INV-03 Slope < 25°',
      executedAction: 'MOVE_ROVER'
    },
    {
      id: 'DEC-BLK-002',
      time: '11:44:10',
      state: 'Dust Storm Injected (Tau 1.45) • Solar Inflow 87W • Battery 14.1%',
      proposedAction: 'DRILL_SAMPLE',
      modelSource: 'Adaptive Mission Planner (Objective 6)',
      reason: 'Scheduled Science Core Sample at Charlie Basin',
      verdict: 'INTERCEPTED',
      safetyRule: 'INV-02 Battery Reserve Floor (< 15% Threshold Veto)',
      executedAction: 'RETURN_TO_BASE + SOLAR_PARK'
    },
    {
      id: 'DEC-BLK-003',
      time: '11:42:35',
      state: 'Loose Sand Hazard Detected • FL Wheel Slip 48% • Impedance Spike',
      proposedAction: 'MOVE_ROVER (Straight)',
      modelSource: 'Supervised Slip Classifier (RandomForest)',
      reason: 'Direct traverse toward Delta Crater Rim',
      verdict: 'INTERCEPTED',
      safetyRule: 'INV-04 Slip Impedance Threshold (> 25% Veto)',
      executedAction: 'EXECUTE_GRADIENT_BACKOUT_BYPASS'
    }
  ]);

  const [loading, setLoading] = useState(false);

  const refreshLiveDecision = async () => {
    setLoading(true);
    try {
      const res = await fetchAutonomyDecision();
      if (res?.data?.decision) {
        const d = res.data.decision;
        const v = res.data.validation || {};
        const obs = res.data.observation || {};
        const isApproved = v.valid !== false;

        const newEntry = {
          id: `DEC-BLK-${Date.now().toString().slice(-4)}`,
          time: new Date().toLocaleTimeString(),
          state: `Sol 42 • Batt ${((obs.rover?.batteryLevel || 0.94) * 100).toFixed(1)}% • Slope ${(obs.environment?.slope || 12.0).toFixed(1)}° • ${isBlackout ? 'BLACKOUT' : 'LINK AVAILABLE'}`,
          proposedAction: d.action || 'MOVE_ROVER',
          modelSource: 'PPO RL Policy / AI Executive',
          reason: d.reason || 'Autonomous local trajectory optimization during telemetry silence',
          verdict: isApproved ? 'APPROVED' : 'INTERCEPTED',
          safetyRule: isApproved ? 'All 10 Physical Invariants Satisfied' : (v.reason || 'Safety Threshold Intercept'),
          executedAction: isApproved ? (d.action || 'MOVE_ROVER') : (v.decision?.action || 'WAIT')
        };

        setDecisions(prev => [newEntry, ...prev.slice(0, 5)]);
      }
    } catch (e) {
      console.warn('Live decision refresh error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(refreshLiveDecision, 5000);
    return () => clearInterval(interval);
  }, [isBlackout]);

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 12, marginBottom: 14,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        flexWrap: 'wrap', gap: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BrainCircuit size={16} color="#38bdf8" />
          <span className="section-title" style={{ color: '#38bdf8' }}>
            Autonomous RL Decision Stream (Blackout Operational Log)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge variant={isBlackout ? 'danger' : 'info'} pulse={isBlackout}>
            {isBlackout ? 'BLACKOUT AUTONOMY ENGAGED' : 'LOCAL INFERENCE ACTIVE'}
          </StatusBadge>
          <button
            onClick={refreshLiveDecision}
            disabled={loading}
            className="hud-button"
            style={{ fontSize: '0.6875rem', padding: '3px 8px' }}
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Step Inference
          </button>
        </div>
      </div>

      {/* Decision Log Cards (State -> Action -> Reason -> Safety) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
        {decisions.map((dec) => {
          const isApproved = dec.verdict === 'APPROVED';

          return (
            <div
              key={dec.id}
              className="inner-card"
              style={{
                padding: '12px 16px',
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderLeft: `4px solid ${isApproved ? '#10b981' : '#f43f5e'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}
            >
              {/* Row 1: ID, Time, State */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {dec.id}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
                    {dec.time}
                  </span>
                </div>

                <div style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#94a3b8',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '2px 8px',
                  borderRadius: 4
                }}>
                  STATE: {dec.state}
                </div>
              </div>

              {/* Row 2: Pipeline Action -> Safety -> Executed */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                padding: '6px 10px',
                background: 'rgba(0, 0, 0, 0.35)',
                borderRadius: 6,
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>PROPOSED:</span>
                <StatusBadge variant="info">{dec.proposedAction}</StatusBadge>
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>→</span>

                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>SAFETY GATE:</span>
                <StatusBadge variant={isApproved ? 'success' : 'danger'}>
                  {isApproved ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
                  {dec.verdict}
                </StatusBadge>
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>→</span>

                <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>EXECUTED:</span>
                <StatusBadge variant={isApproved ? 'success' : 'warning'}>
                  {dec.executedAction}
                </StatusBadge>
              </div>

              {/* Row 3: Model Reason & Safety Rule Description */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: '0.6875rem', lineHeight: 1.4 }}>
                <div style={{ color: '#cbd5e1' }}>
                  <strong style={{ color: '#38bdf8' }}>RL Model Reason:</strong> {dec.reason}
                </div>
                <div style={{ color: isApproved ? '#94a3b8' : '#fb7185' }}>
                  <strong style={{ color: isApproved ? '#34d399' : '#f43f5e' }}>Safety Rule Check:</strong> {dec.safetyRule}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
