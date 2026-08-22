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
      gap: 16,
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem'
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 12px',
        background: 'rgba(251, 146, 60, 0.08)',
        border: '1px solid rgba(251, 146, 60, 0.20)',
        borderRadius: 'var(--radius-md)'
      }}>
        <Sun size={12} color="var(--mars-400)" />
        <span style={{ color: 'var(--text-muted)', fontSize: '0.5625rem', fontFamily: 'var(--font-hud)', letterSpacing: '0.06em' }}>SOL</span>
        <span style={{ color: 'var(--mars-400)', fontWeight: 700 }}>{currentSol}</span>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <span style={{ color: 'var(--mars-300)' }}>{mtcStr}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.5rem' }}>MTC</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 12px',
        background: 'rgba(34, 211, 238, 0.05)',
        border: '1px solid rgba(34, 211, 238, 0.12)',
        borderRadius: 'var(--radius-md)'
      }}>
        <Clock size={12} color="var(--cyan-500)" />
        <span style={{ color: 'var(--cyan-400)' }}>{utcStr}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.5rem' }}>UTC</span>
      </div>
    </div>
  );
}
