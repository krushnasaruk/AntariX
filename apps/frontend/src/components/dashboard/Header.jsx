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
          width: 28, height: 28, borderRadius: 'var(--radius-sm)',
          background: 'var(--structure-ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--structure-ink-light)',
          flexShrink: 0
        }}>
          <Sparkles size={14} color="#ffffff" />
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
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--structure-ink-light)',
              color: '#94A3B8',
              letterSpacing: '0.02em',
              textTransform: 'uppercase'
            }}>
              Mission Control
            </span>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: '#64748B',
            letterSpacing: '0.05em'
          }}>
            JEZERO CRATER SEC-07 • EARTH-MARS AUTONOMOUS GROUND LINK
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
          background: 'var(--bg-app)',
          border: '1px solid var(--structure-ink)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: connected ? 'var(--signal-nominal)' : 'var(--signal-critical)'
        }}>
          <span style={{
            width: 4, height: 8,
            background: connected ? 'var(--signal-nominal)' : 'var(--signal-critical)'
          }} />
          {connected ? 'DSN ONLINE' : 'LINK OFFLINE'}
        </div>

        <button
          onClick={onOpenJudgeTour}
          className="hud-button"
          style={{
            borderColor: 'var(--signal-caution)',
            color: 'var(--signal-caution)',
            fontWeight: 600
          }}
        >
          <Award size={13} color="var(--signal-caution)" />
          JUDGE DEMO
        </button>

        <button
          onClick={() => onSelectPage && onSelectPage(PAGES.COMMUNICATION)}
          className="hud-button hud-button-primary"
        >
          <Radio size={13} />
          UPLINK CONSOLE
        </button>
      </div>
    </header>
  );
}
