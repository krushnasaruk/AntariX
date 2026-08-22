import React, { useState } from 'react';
import { Header } from '../components/dashboard/Header';
import { Sidebar } from '../components/dashboard/Sidebar';
import { DataLineageDrawer } from '../components/debug/DataLineageDrawer';
import { JudgeDemoGuide } from '../components/debug/JudgeDemoGuide';
import { renderPage } from './routes';
import { WorldStateProvider, useWorldState } from '../store/WorldStateContext.jsx';
import { PAGES } from '../utils/constants';
import '../styles/index.css';

function MainLayout() {
  const [activePage, setActivePage] = useState(PAGES.DASHBOARD);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const { worldState, connected } = useWorldState();

  const latencySec = worldState?.communication?.oneWayDelaySec !== undefined
    ? worldState.communication.oneWayDelaySec
    : null;

  return (
    <div className="app-shell">
      {/* Top Header */}
      <Header
        latencySec={latencySec}
        connected={connected}
        activePage={activePage}
        onSelectPage={setActivePage}
        onOpenJudgeTour={() => setIsTourOpen(true)}
      />

      {/* Main Body: Sidebar + Active Page */}
      <div className="app-body">
        <Sidebar
          activePage={activePage}
          onSelectPage={setActivePage}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
        />

        <main className="app-main">
          {renderPage(activePage, {
            worldState,
            telemetry: worldState?.rover || null,
            latencySec,
            connected
          })}
        </main>
      </div>

      {/* Real Data Lineage Inspector */}
      <DataLineageDrawer />

      {/* Judge Demonstration 10-Step Guided Tour */}
      <JudgeDemoGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={(page) => setActivePage(page)}
      />
    </div>
  );
}

export function App() {
  return (
    <WorldStateProvider>
      <MainLayout />
    </WorldStateProvider>
  );
}

export default App;
