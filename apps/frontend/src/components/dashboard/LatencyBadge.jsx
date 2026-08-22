import React from 'react';
import { formatSecondsToTime } from '../../utils/formatters';
import { Satellite } from 'lucide-react';

export function LatencyBadge({ latencySec }) {
  const isZero = latencySec <= 0;
  const isHigh = latencySec > 1000;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '5px 14px',
      background: isHigh
        ? 'rgba(239, 68, 68, 0.08)'
        : 'rgba(251, 146, 60, 0.06)',
      border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.25)' : 'rgba(251, 146, 60, 0.20)'}`,
      borderRadius: 'var(--radius-md)',
      animation: isHigh ? 'glow-border 2s ease-in-out infinite' : 'none'
    }}>
      <Satellite size={13} color={isHigh ? 'var(--rose-400)' : 'var(--mars-400)'} />
      <span style={{
        fontFamily: 'var(--font-hud)',
        fontSize: '0.5625rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.06em'
      }}>
        DELAY
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: isZero ? 'var(--emerald-400)' : isHigh ? 'var(--rose-400)' : 'var(--mars-400)'
      }}>
        {formatSecondsToTime(latencySec)}
      </span>
    </div>
  );
}
