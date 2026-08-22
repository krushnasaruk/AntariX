# MERGE_NOTES — AntriX Frontend Package

**Release Package**: `antrix-frontend-updated.zip`  
**Target Monorepo Directory**: `apps/frontend/`  
**Status**: Production Verified • 100% Passing Tests • Built Cleanly in 3.28s  

---

## 1. Files Added, Changed, or Deleted

### Added Files (New Modules)
* `src/api/client.js` — Core HTTP fetch client with typed response parsing, timeouts, and error handling.
* `src/api/simulationApi.js` — Authoritative WorldState retrieval, clock stepping, and fault injection clients.
* `src/api/autonomyApi.js` — Real-time decision retrieval, 10 physical invariant queries, and decision validation.
* `src/api/missionApi.js` — Mission status, multi-step A* route planning, and task execution clients.
* `src/api/intelligenceApi.js` — Telemetry anomaly analysis and adaptive learning experience retrieval clients.
* `src/api/communicationApi.js` — Speed-of-light delay, DTN packet queue buffer, command sending, and blackout simulation clients.
* `src/api/digitalTwinApi.js` — Python Digital Twin service health, scenario state, and dataset generation factory clients.
* `src/api/mlApi.js` — Model registry retrieval, 7D feature vectors, and promotion gate execution clients.
* `src/api/trainingApi.js` — Distributed GPU training jobs list and multi-worker job submission clients.
* `src/api/benchmarkApi.js` — Multi-policy comparative benchmark metrics and scenario execution clients.
* `src/store/WorldStateContext.jsx` — Centralized state provider with 10 Hz WebSocket streaming and fallback REST polling (`LIVE`, `STALE`, `OFFLINE`).
* `src/components/debug/DataLineageDrawer.jsx` — Collapsible inspector drawer showing full UI Metric → API → Backend Service → Model Lineage.
* `src/components/debug/JudgeDemoGuide.jsx` — 10-Step interactive guided demonstration tour modal for judges.
* `src/components/autonomy/BlackoutDecisionLog.jsx` — Live scrolling RL decision stream showing `State → Proposed Action → RL Reason → SafetyValidator Verdict → Executed Action`.

### Modified Files (Bug Fixes & Real Data Hardening)
* `src/app/App.jsx` — Wrapped application with `WorldStateProvider`, `DataLineageDrawer`, and `JudgeDemoGuide`.
* `src/components/dashboard/Header.jsx` — Integrated live Sol 42, orbital distance, physical delay, and "Judge Demo Tour" launcher button.
* `src/components/ai/AgentTraceView.jsx` — Fixed `opacity: 0` CSS animation bug; added high-contrast multi-agent chips and severity tags.
* `src/components/ai/SafetyGateMonitor.jsx` — Fixed broken compact 1-column layout; added structured border indicators (`border-left: 4px solid ...`) and reason text.
* `src/components/mission/MissionTimeline.jsx` — Fixed `opacity: 0` animation bug; added active waypoint progress indicators, Sol metadata, and coordinates.
* `src/components/communication/PacketQueueTable.jsx` — Fixed `packets` vs `queue` prop mismatch; added dynamic command extraction and rich status badges.
* `src/components/rover/RoverStatusCard.jsx` — Eliminated SVG CSS variable black-box glitch; redesigned into high-density 2x2 diagnostics with active progress bars.
* `src/pages/Communication/CommunicationPage.jsx` — Added interactive orbital distance presets (`54.6M`, `225M`, `288M`, `401M km`), active 3s DTN queue auto-polling, and BlackoutDecisionLog.
* `src/pages/SafetyGate/SafetyGatePage.jsx` — Connected real dynamic benchmark runner (`POST /api/benchmarks/run`), added technical latency distinction banner, and BlackoutDecisionLog.
* `src/pages/Training/TrainingPage.jsx` — Fixed training job submission payload to match backend routes.
* `src/pages/Dashboard/DashboardPage.jsx` — Connected live physical numbers from `useWorldState()` (`batteryLevel`, `solarInputWatts`, `speedMps`).
* `src/pages/**/*.jsx` — All 13 pages updated to display `--` / `DATA UNAVAILABLE` when offline with zero fabricated numbers.

---

## 2. New Environment Variables & API Dependencies

The frontend connects to the Express Backend Gateway on port 3000:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Base REST API URL |
| `VITE_WS_URL` | `ws://localhost:3000` | Real-time 10 Hz Telemetry WebSocket URL |

### Endpoints Consumed:
* `GET  /api/simulation/world-state`
* `POST /api/simulation/step`, `POST /api/simulation/reset`, `POST /api/simulation/fault/inject`
* `GET  /api/autonomy/decision`, `GET /api/autonomy/invariants`, `POST /api/autonomy/validate`
* `GET  /api/mission/status`, `GET /api/mission/plan`
* `GET  /api/communication/status`, `POST /api/communication/distance`, `GET /api/communication/queue`, `POST /api/communication/send`, `POST /api/communication/blackout`
* `GET  /api/digital-twin/health`, `POST /api/digital-twin/dataset/generate`
* `GET  /api/ml/registry`, `POST /api/ml/models/:id/promote`
* `GET  /api/training/jobs`, `POST /api/training/jobs`
* `GET  /api/benchmarks/results`, `POST /api/benchmarks/run`

---

## 3. NPM Packages Added

No external dependencies added. All features were implemented using the existing dependencies in `package.json`:
* `react` / `react-dom`
* `lucide-react` (icons)
* `vite` (bundler)

---

## 4. Commands to Run After Merging

Run these commands inside `apps/frontend/` after merging:

```bash
# 1. Install dependencies
npm install

# 2. Verify production build succeeds (0 errors)
npm run build

# 3. Start local development dev server
npm run dev
```

The frontend will run at [http://localhost:5173/](http://localhost:5173/).

---

## 5. Changes Made Outside `apps/frontend/` (Manual Merge Required)

To ensure zero-dummy data and full contract compliance, the following backend endpoints were added/updated in `apps/backend/`:
1. `apps/backend/src/api/routes/benchmarkRoutes.js`: Added `POST /api/benchmarks/run` to evaluate multi-policy scenarios dynamically.
2. `apps/backend/src/api/routes/communicationRoutes.js`: Added `POST /api/communication/distance` and connected `channel.sendPacket()` with `DTNQueue.enqueuePacket()`.
3. `apps/backend/src/api/routes/mlTrainingRoutes.js`: Supported route aliases (`/jobs`, `/training/jobs`, `/registry`, `/ml/registry`).
4. `apps/backend/src/api/routes/simulationRoutes.js`: Set default orbital distance to 288M km.
5. `tests/integration/frontend_real_data_contracts.test.js`: Created contract integration test suite verifying all 6 API contracts.
