import React from 'react';
import { AnimatedCounter } from '../ui/AnimatedCounter';

export function Gauge({
  label,
  value,
  unit,
  min = 0,
  max = 100,
  color = 'cyan',
  dangerBelow = null,
  warningBelow = null,
  icon = null
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // Determine arc color based on thresholds
  let strokeColor = 'var(--cyan-400)';
  let glowColor = 'rgba(34, 211, 238, 0.3)';
  let bgGlow = 'rgba(34, 211, 238, 0.05)';

  if (color === 'mars') {
    strokeColor = 'var(--mars-400)';
    glowColor = 'rgba(251, 146, 60, 0.3)';
    bgGlow = 'rgba(251, 146, 60, 0.05)';
  } else if (color === 'emerald') {
    strokeColor = 'var(--emerald-400)';
    glowColor = 'rgba(52, 211, 153, 0.3)';
    bgGlow = 'rgba(52, 211, 153, 0.05)';
  } else if (color === 'amber') {
    strokeColor = 'var(--amber-400)';
    glowColor = 'rgba(245, 158, 11, 0.3)';
    bgGlow = 'rgba(245, 158, 11, 0.05)';
  }

  if (dangerBelow != null && value < dangerBelow) {
    strokeColor = 'var(--rose-400)';
    glowColor = 'rgba(244, 63, 94, 0.4)';
    bgGlow = 'rgba(244, 63, 94, 0.08)';
  } else if (warningBelow != null && value < warningBelow) {
    strokeColor = 'var(--amber-400)';
    glowColor = 'rgba(245, 158, 11, 0.3)';
    bgGlow = 'rgba(245, 158, 11, 0.05)';
  }

  // SVG Arc dimensions
  const size = 80;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // half-circle (180°)
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="inner-card" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'var(--space-4)',
      background: bgGlow,
      transition: 'all 0.4s ease'
    }}>
      {/* SVG Arc Gauge */}
      <svg width={size} height={size / 2 + 8} viewBox={`0 0 ${size} ${size / 2 + 8}`} style={{ overflow: 'visible' }}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="rgba(56, 97, 140, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
            filter: `drop-shadow(0 0 4px ${glowColor})`
          }}
        />
      </svg>

      {/* Value */}
      <div style={{
        marginTop: -4,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
      }}>
        <div style={{
          fontSize: '1.25rem', fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.2
        }}>
          <AnimatedCounter value={value} decimals={1} />
        </div>
        <div style={{
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          letterSpacing: '0.02em'
        }}>
          {unit}
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-hud)',
        fontSize: '0.5625rem',
        fontWeight: 600,
        color: 'var(--text-tertiary)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginTop: 'var(--space-2)',
        textAlign: 'center',
        lineHeight: 1.3
      }}>
        {label}
      </div>
    </div>
  );
}
