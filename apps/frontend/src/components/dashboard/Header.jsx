import React from 'react';
import { LatencyBadge } from './LatencyBadge';
import { SolClock } from './SolClock';
import { Sparkles, Radio, Wifi, ShieldCheck, Award } from 'lucide-react';
import { PAGES } from '../../utils/constants';

export function Header({ latencySec, connected, activePage, onSelectPage, onOpenJudgeTour }) {
  return (
    <header className="app-header">
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 6,
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
          flexShrink: 0
        }}>
          <Sparkles size={16} color="#ffffff" />
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: '0.9375rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            AntriX
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 600,
              padding: '1px 6px',
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#94a3b8',
              letterSpacing: '0.02em'
            }}>
              Mission Control
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-main)',
            fontSize: '0.6875rem',
            color: '#64748b',
            letterSpacing: '0.01em'
          }}>
            Jezero Crater Sector 07 • Earth–Mars Autonomous Ground Link
          </div>
        </div>
      </div>

      {/* Center: Sol Time & Latency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <SolClock />
        <LatencyBadge latencySec={latencySec} />
      </div>

      {/* Right: Link Status & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          background: connected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`,
          borderRadius: 6,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: connected ? '#34d399' : '#fb7185'
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: connected ? '#10b981' : '#f43f5e',
            animation: connected ? 'pulse-dot 1.5s infinite' : 'none'
          }} />
          {connected ? 'DSN Online' : 'Link Offline'}
        </div>

        <button
          onClick={onOpenJudgeTour}
          className="hud-button"
          style={{
            background: 'rgba(251, 191, 36, 0.1)',
            borderColor: 'rgba(251, 191, 36, 0.35)',
            color: '#fbbf24',
            fontWeight: 700
          }}
        >
          <Award size={13} color="#fbbf24" />
          Judge Demo Tour
        </button>

        <button
          onClick={() => onSelectPage && onSelectPage(PAGES.COMMUNICATION)}
          className="hud-button hud-button-primary"
        >
          <Radio size={13} />
          Uplink Console
        </button>
      </div>
    </header>
  );
}
