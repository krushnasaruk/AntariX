import React, { useState } from 'react';
import { Award, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Radio, BrainCircuit, X, Play } from 'lucide-react';
import { PAGES } from '../../utils/constants';

const DEMO_STEPS = [
  {
    step: 1,
    title: '1. Select Mission Scenario & Baseline',
    desc: 'Demonstrate that Mars operations encounter high physical latency (3 to 22 minutes one-way) and 14-day conjunction blackouts.',
    page: PAGES.DASHBOARD,
    highlight: 'Check the Top Header showing ~12m 31s speed-of-light delay calculated directly from 225M km orbital distance.'
  },
  {
    step: 2,
    title: '2. Inspect Live Physical WorldState',
    desc: 'Verify that every telemetry number originates from physical RoverModel and MarsEnvironment simulation with zero mock values.',
    page: PAGES.DASHBOARD,
    highlight: 'Expand the Data Lineage & Provenance Inspector at the bottom right to see the full UI → API → Model lineage.'
  },
  {
    step: 3,
    title: '3. Simulate Solar Conjunction Blackout',
    desc: 'Demonstrate store-and-forward Delay-Tolerant Networking (DTN) buffer resilience.',
    page: PAGES.COMMUNICATION,
    highlight: 'Click "Simulate Solar Conjunction Blackout", then transmit a command. Watch it buffer safely in DTN flash memory.'
  },
  {
    step: 4,
    title: '4. Execute Head-to-Head Benchmark',
    desc: 'Execute real comparative benchmark: Traditional Earth Joysticking vs AntriX Autonomous AI Stack.',
    page: PAGES.SAFETY_GATE,
    highlight: 'Click "Execute Head-to-Head Benchmark" to see Earth Control fail due to 44.6m delay while AntriX AI safely preserves battery.'
  },
  {
    step: 5,
    title: '5. Inject Physical Digital Twin Fault',
    desc: 'Trigger a real physical dust storm or motor stall in the 14-Type Fault Sandbox.',
    page: PAGES.DIGITAL_TWIN,
    highlight: 'Switch to "14-Type Fault Sandbox" tab and inject "Dust Storm (Solar Inflow -85%)".'
  },
  {
    step: 6,
    title: '6. AI Real-Time Anomaly Detection',
    desc: 'Observe the 3-sigma multi-agent anomaly detector catching the sudden solar drop.',
    page: PAGES.AI,
    highlight: 'Inspect the live Risk Assessment score, recommended fallback, and multi-agent reasoning trace.'
  },
  {
    step: 7,
    title: '7. Autonomous Mission Replanning',
    desc: 'The Mission Planner generates an automated contingency plan to preserve vehicle health.',
    page: PAGES.MISSION,
    highlight: 'View the automated "DUST_STORM_HOLDING" contingency plan and A* slope-weighted route scoring.'
  },
  {
    step: 8,
    title: '8. Authoritative SafetyValidator Gate',
    desc: 'The SafetyValidator mathematically verifies 10 hard physical invariants before actuation.',
    page: PAGES.SAFETY_GATE,
    highlight: 'Observe the intercept event stream proving that AI recommendations cannot bypass physical safety rules.'
  },
  {
    step: 9,
    title: '9. Columnar Telemetry Analytics',
    desc: 'Execute analytical SQL queries directly on parquet telemetry batches.',
    page: PAGES.DIGITAL_TWIN,
    highlight: 'Switch to "DuckDB SQL Analytics" tab and click "Run Query" for in-process telemetry analytics.'
  },
  {
    step: 10,
    title: '10. Final Mission Provenance & Result',
    desc: 'Review the immutable audit log and multi-policy metrics.',
    page: PAGES.EVENTS,
    highlight: 'Review the append-only event log showing complete causal provenance from anomaly to safe resolution.'
  }
];

export function JudgeDemoGuide({ isOpen, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const active = DEMO_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (onNavigate) onNavigate(DEMO_STEPS[nextIdx].page);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (onNavigate) onNavigate(DEMO_STEPS[prevIdx].page);
    }
  };

  const handleGoToPage = () => {
    if (onNavigate) onNavigate(active.page);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.82)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 20
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: 680,
        padding: 24,
        border: '1px solid rgba(56, 189, 248, 0.35)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={20} color="#38bdf8" />
            <span style={{ fontFamily: 'var(--font-main)', fontWeight: 800, fontSize: '1rem', color: '#f1f5f9' }}>
              Judge Demonstration Guided Tour
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {DEMO_STEPS.map((s, i) => (
            <div
              key={i}
              onClick={() => { setCurrentStep(i); if (onNavigate) onNavigate(s.page); }}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: i <= currentStep ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          ))}
        </div>

        {/* Step Content Card */}
        <div className="inner-card" style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          borderLeft: '4px solid #38bdf8',
          background: 'rgba(56, 189, 248, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#38bdf8'
            }}>
              STEP {active.step} OF 10
            </span>
            <span style={{
              fontSize: '0.6875rem',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'rgba(56, 189, 248, 0.15)',
              color: '#7dd3fc',
              fontWeight: 600
            }}>
              Target: {active.page}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-main)', fontSize: '1.0625rem', fontWeight: 700, color: '#ffffff' }}>
            {active.title}
          </div>

          <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: 1.5 }}>
            {active.desc}
          </div>

          <div style={{
            padding: '10px 14px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 6,
            fontSize: '0.75rem',
            color: '#fbbf24',
            lineHeight: 1.45
          }}>
            💡 <strong>Action for Judges:</strong> {active.highlight}
          </div>
        </div>

        {/* Footer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <button
            onClick={handleGoToPage}
            className="hud-button"
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            <Play size={12} />
            Jump to {active.page} Page
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="hud-button"
              style={{ opacity: currentStep === 0 ? 0.4 : 1, cursor: currentStep === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ArrowLeft size={13} />
              Previous
            </button>

            {currentStep < DEMO_STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="hud-button hud-button-primary"
              >
                Next Step
                <ArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="hud-button hud-button-primary"
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                <CheckCircle2 size={13} />
                Finish Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
