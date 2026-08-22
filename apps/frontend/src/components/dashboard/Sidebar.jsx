import React from 'react';
import { PAGES, NAV_GROUPS } from '../../utils/constants';
import {
  LayoutDashboard, Radio, Orbit, Bot, BrainCircuit, ShieldCheck,
  Target, Activity, Package, Box, Database, Cpu, AlertTriangle,
  PanelLeftClose, PanelLeft
} from 'lucide-react';

const PAGE_ICONS = {
  [PAGES.DASHBOARD]: LayoutDashboard,
  [PAGES.COMMUNICATION]: Radio,
  [PAGES.SIMULATION]: Orbit,
  [PAGES.ROVER]: Bot,
  [PAGES.AI]: BrainCircuit,
  [PAGES.SAFETY_GATE]: ShieldCheck,
  [PAGES.MISSION]: Target,
  [PAGES.TELEMETRY]: Activity,
  [PAGES.DATA_QUEUE]: Package,
  [PAGES.DIGITAL_TWIN]: Box,
  [PAGES.ML_REGISTRY]: Database,
  [PAGES.TRAINING]: Cpu,
  [PAGES.EVENTS]: AlertTriangle
};

export function Sidebar({ activePage, onSelectPage, collapsed, onToggleCollapse }) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Collapse Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '0 6px 10px 6px',
        marginBottom: 8,
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        {!collapsed && (
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: '#64748b',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            Navigation
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            cursor: 'pointer', padding: 2, display: 'flex',
            borderRadius: 'var(--radius-sm)'
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
        </button>
      </div>

      {/* Nav Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && (
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                color: '#475569',
                letterSpacing: '0.06em',
                padding: '0 8px',
                marginBottom: 4,
                textTransform: 'uppercase'
              }}>
                {group.label}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {group.items.map((page) => {
                const isActive = activePage === page;
                const Icon = PAGE_ICONS[page] || LayoutDashboard;

                return (
                  <button
                    key={page}
                    onClick={() => onSelectPage(page)}
                    title={collapsed ? page : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: collapsed ? 0 : 10,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      width: '100%',
                      padding: collapsed ? '8px' : '7px 10px',
                      background: isActive
                        ? 'var(--structure-ink)'
                        : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '2px solid var(--structure-ink-light)' : '2px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? '#f1f5f9' : '#94a3b8',
                      cursor: 'pointer',
                      transition: 'none',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 600 : 500,
                      textAlign: 'left'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.4)'; // Hover state
                        e.currentTarget.style.color = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <Icon size={14} style={{ flexShrink: 0, color: isActive ? '#f1f5f9' : '#64748b' }} />
                    {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{page}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info */}
      {!collapsed && (
        <div style={{
          marginTop: 'auto',
          padding: '10px 8px 0 8px',
          borderTop: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: '#475569',
          textAlign: 'center'
        }}>
          AntriX v1.0 • Jezero-07
        </div>
      )}
    </aside>
  );
}
