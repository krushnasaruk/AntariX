import React from 'react';
import { formatSecondsToTime } from '../../utils/formatters';
import { Satellite } from 'lucide-react';

export function LatencyBadge({ latencySec }) {
  const isZero = latencySec <= 0;
  const isHigh = latencySec > 1000;

  // Strict Signal Grammar
  const colorToken = isZero ? 'var(--signal-nominal)' : isHigh ? 'var(--signal-caution)' : 'var(--structure-ink-light)';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 10px',
      background: 'var(--bg-app)',
      border: `1px solid var(--structure-ink)`,
      borderRadius: 'var(--radius-sm)'
    }}>
      <Satellite size={14} color={colorToken} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{
          fontFamily: 'var(--font-main)',
          fontSize: '0.6rem',
          fontWeight: 600,
          color: '#94A3B8',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '2px'
        }}>
          t=d/c Latency
        </span>
        <span className="tabular-nums" style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: colorToken
        }}>
          {formatSecondsToTime(latencySec)}
        </span>
      </div>
    </div>
  );
}
