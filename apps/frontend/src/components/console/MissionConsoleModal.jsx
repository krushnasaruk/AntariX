import React, { useState } from 'react';
import { Sidebar } from '../dashboard/Sidebar';
import { renderPage } from '../../app/routes';
import { PAGES } from '../../utils/constants';
import { SolClock } from '../dashboard/SolClock';
import { LatencyBadge } from '../dashboard/LatencyBadge';
import { X, Maximize2, Minimize2, Search, Bell, Sparkles } from 'lucide-react';

export function MissionConsoleModal({ isOpen, onClose, telemetry, opticalLink, latencySec }) {
  const [activePage, setActivePage] = useState(PAGES.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="console-modal-backdrop" onClick={onClose}>
      <div
        className="console-modal-window"
        style={{
          width: isFullscreen ? '98vw' : '94vw',
          height: isFullscreen ? '96vh' : '90vh',
          maxWidth: isFullscreen ? '100vw' : '1440px'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="console-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Window control dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={onClose}
                style={{ width: 11, height: 11, borderRadius: '50%', background: '#f43f5e', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Close"
              />
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                style={{ width: 11, height: 11, borderRadius: '50%', background: '#fbbf24', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Toggle Sidebar"
              />
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{ width: 11, height: 11, borderRadius: '50%', background: '#34d399', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Toggle Fullscreen"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} color="#38bdf8" />
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.8125rem', fontWeight: 800, color: '#f1f5f9' }}>
                ANTRIX MISSION CONTROL
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#64748b' }}>
                • {activePage.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Center Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SolClock />
            <LatencyBadge latencySec={latencySec} />
          </div>

          {/* Right Window Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: 4, display: 'flex'
              }}
              title={isFullscreen ? 'Restore' : 'Maximize'}
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: 4, display: 'flex'
              }}
              title="Close Console"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar + Active Page */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            activePage={activePage}
            onSelectPage={setActivePage}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          <div style={{ flex: 1, padding: 24, overflowY: 'auto', background: '#02050f' }}>
            {renderPage(activePage, { telemetry, opticalLink, latencySec })}
          </div>
        </div>
      </div>
    </div>
  );
}
