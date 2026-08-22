import React, { useState, useEffect } from 'react';
import { Sparkles, Terminal, Activity, ArrowRight } from 'lucide-react';

export function Navbar({ onOpenConsole, onNavigateSection }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 72,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 36px',
      background: scrolled ? 'rgba(2, 4, 10, 0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid transparent',
      transition: 'all 0.3s ease'
    }}>
      {/* Brand Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <a
          href="#"
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none', color: '#ffffff'
          }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)'
          }}>
            <Sparkles size={16} color="#ffffff" />
          </div>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.15rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#ffffff'
          }}>
            ANTRIX
          </span>
        </a>

        {/* Minimal Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          {[
            { label: 'Platform', target: 'problem-section' },
            { label: 'Architecture', target: 'architecture-section' },
            { label: 'Digital Twin', target: 'digital-twin-section' },
            { label: 'AI Engine', target: 'intelligence-section' },
            { label: 'Safety Gate', target: 'safety-section' },
            { label: 'Research', target: 'training-section' },
            { label: 'Tech Stack', target: 'technology-section' }
          ].map(item => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.target)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-sans)', fontSize: '0.875rem',
                color: '#94a3b8', fontWeight: 500,
                transition: 'color 0.2s ease', padding: 0
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 9999,
          background: 'rgba(52, 211, 153, 0.08)',
          border: '1px solid rgba(52, 211, 153, 0.2)',
          fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#34d399'
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          DSN LINK ONLINE
        </div>

        <button
          onClick={onOpenConsole}
          className="btn-primary"
          style={{ padding: '8px 20px', fontSize: '0.8125rem' }}
        >
          <Activity size={14} />
          Launch Simulation
        </button>
      </div>
    </nav>
  );
}
