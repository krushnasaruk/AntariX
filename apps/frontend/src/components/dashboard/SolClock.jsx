import React, { useState, useEffect } from 'react';
import { Clock, Sun } from 'lucide-react';

const SOL_SECONDS = 88775.244;

export function SolClock() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulated Sol number (days since a reference "landing" epoch)
  const landingEpoch = new Date('2024-02-18T00:00:00Z').getTime();
  const elapsedMs = now - landingEpoch;
  const elapsedSolSeconds = elapsedMs / 1000;
  const currentSol = Math.floor(elapsedSolSeconds / SOL_SECONDS);

  // Martian time within current Sol
  const solFraction = (elapsedSolSeconds % SOL_SECONDS) / SOL_SECONDS;
  const martianHours = Math.floor(solFraction * 24);
  const martianMinutes = Math.floor((solFraction * 24 - martianHours) * 60);
  const martianSeconds = Math.floor(((solFraction * 24 - martianHours) * 60 - martianMinutes) * 60);

  const mtcStr = `${String(martianHours).padStart(2, '0')}:${String(martianMinutes).padStart(2, '0')}:${String(martianSeconds).padStart(2, '0')}`;

  // Earth UTC
  const utc = new Date(now);
  const utcStr = `${String(utc.getUTCHours()).padStart(2, '0')}:${String(utc.getUTCMinutes()).padStart(2, '0')}:${String(utc.getUTCSeconds()).padStart(2, '0')}`;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px',
        background: 'var(--bg-app)',
        border: '1px solid var(--structure-ink)',
        borderRadius: 'var(--radius-sm)'
      }}>
        <Sun size={12} color="var(--signal-caution)" />
        <span style={{ color: '#94A3B8', fontSize: '0.6rem', fontFamily: 'var(--font-main)', letterSpacing: '0.05em' }}>SOL</span>
        <span className="tabular-nums" style={{ color: 'var(--signal-caution)', fontWeight: 700 }}>{currentSol}</span>
        <span style={{ color: 'var(--structure-ink-light)' }}>•</span>
        <span className="tabular-nums" style={{ color: 'var(--signal-caution)' }}>{mtcStr}</span>
        <span style={{ color: '#94A3B8', fontSize: '0.6rem' }}>MTC</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px',
        background: 'var(--bg-app)',
        border: '1px solid var(--structure-ink)',
        borderRadius: 'var(--radius-sm)'
      }}>
        <Clock size={12} color="var(--structure-ink-light)" />
        <span className="tabular-nums" style={{ color: '#E2E8F0' }}>{utcStr}</span>
        <span style={{ color: '#94A3B8', fontSize: '0.6rem' }}>UTC</span>
      </div>
    </div>
  );
}
