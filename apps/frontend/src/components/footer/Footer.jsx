import React from 'react';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{
      padding: '48px 36px 36px 36px',
      background: '#02040a',
      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 24,
      maxWidth: 1240,
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 20
      }}>
        {/* Logo & Subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Sparkles size={14} color="#ffffff" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>
            ANTRIX
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
            • Mars Mission Intelligence & Digital Twin
          </span>
        </div>

        {/* Quick Spec Links */}
        <div style={{ display: 'flex', gap: 24, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#94a3b8' }}>
          <span>PORT 3000: BACKEND</span>
          <span>PORT 8000: AI ENGINE</span>
          <span>PORT 8010: DIGITAL TWIN</span>
          <span>PORT 8011: ML ENGINE</span>
          <span>PORT 8012: TRAINING</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        paddingTop: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.625rem',
        color: '#475569'
      }}>
        <span>© 2026 AntriX Project • All Rights Reserved. Built for Deep Space Planetary Autonomy.</span>
        <span>Jezero Crater Sector 07 • Speed of Light c = 299,792,458 m/s</span>
      </div>
    </footer>
  );
}
