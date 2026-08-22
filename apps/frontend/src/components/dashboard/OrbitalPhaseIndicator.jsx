import React from 'react';
import { ORBITAL_PRESETS } from '../../utils/constants';

export function OrbitalPhaseIndicator({ currentPreset = 'NOMINAL' }) {
  const presets = Object.entries(ORBITAL_PRESETS);
  const activeIdx = presets.findIndex(([k]) => k === currentPreset);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontFamily: 'var(--font-mono)', fontSize: '0.625rem'
    }}>
      {presets.map(([key, preset], idx) => {
        const isActive = key === currentPreset;
        return (
          <div key={key} style={{
            display: 'flex', alignItems: 'center', gap: 4
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: isActive
                ? (key === 'OPPOSITION' ? 'var(--emerald-400)' : key === 'CONJUNCTION' ? 'var(--rose-400)' : 'var(--amber-400)')
                : 'var(--text-muted)',
              boxShadow: isActive ? `0 0 8px ${key === 'OPPOSITION' ? 'rgba(52,211,153,0.5)' : key === 'CONJUNCTION' ? 'rgba(244,63,94,0.5)' : 'rgba(245,158,11,0.5)'}` : 'none',
              transition: 'all 0.3s ease'
            }} />
            <span style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: isActive ? 700 : 400,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {preset.label}
            </span>
            {idx < presets.length - 1 && (
              <div style={{
                width: 20, height: 1,
                background: 'var(--border-subtle)',
                margin: '0 2px'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
