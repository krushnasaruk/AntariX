# AntriX Frontend Data Flow Architecture

This document maps every UI component in the AntriX Mission Control visualization layer through the frontend service layer, canonical REST/WebSocket API endpoints, Express Gateway backend, to the authoritative backend source-of-truth modules in `@earth-mars/simulation-core`, `@earth-mars/communication-protocol`, and Python microservices.

---

## Complete Component-to-Source Data Flow Map

```
UI Component
    ↓
Frontend Service / Hook
    ↓
API Endpoint / WS Topic
    ↓
Backend Service / Route
    ↓
Source-of-Truth Module
```

### 1. Global Mission Header & Status Ribbon
* **UI Component**: `TopNav.jsx` & `App.jsx`
* **Frontend Service**: `useWorldState()` hook (`WorldStateContext.jsx`)
* **API Endpoint**: `ws://localhost:3000` (WebSocket) / `GET /api/simulation/world-state`
* **Backend Service**: `apps/backend/src/websocket/wsServer.js` & `simulationRoutes.js`
* **Source-of-Truth**: `activeSimulation.getWorldState()` (`packages/simulation-core/environment/mars-environment.js` & `rover-model.js`)

### 2. Physical Signal Propagation Delay
* **UI Component**: `CommunicationPage.jsx` / `DashboardPage.jsx` (Metric Card 1)
* **Frontend Service**: `useCommunication()` hook & `fetchCommStatus()` (`communicationApi.js`)
* **API Endpoint**: `GET /api/communication/status`
* **Backend Service**: `apps/backend/src/api/routes/communicationRoutes.js`
* **Source-of-Truth**: `calculateOneWayDelay(distanceKm)` (`packages/communication-protocol/delay-engine.js`) using physical speed of light $c = 299,792,458\text{ m/s}$

### 3. Battery State of Charge & Power Draw
* **UI Component**: `RoverPage.jsx` / `DashboardPage.jsx` / `TelemetryPage.jsx`
* **Frontend Service**: `useRoverTelemetry()` hook (`WorldStateContext.jsx`)
* **API Endpoint**: `ws://localhost:3000` / `GET /api/simulation/world-state`
* **Backend Service**: `apps/backend/src/api/routes/simulationRoutes.js`
* **Source-of-Truth**: `RoverModel.batteryLevel` & `RoverModel.calculateEnergyDraw()` (`packages/simulation-core/environment/rover-model.js`)

### 4. 2D Tactical Radar & Jezero Elevation Map
* **UI Component**: `TacticalRadar.jsx`
* **Frontend Service**: `useWorldState()` hook (`WorldStateContext.jsx`)
* **API Endpoint**: `ws://localhost:3000`
* **Backend Service**: `apps/backend/src/websocket/wsServer.js`
* **Source-of-Truth**: `activeSimulation.rover.position`, `activeSimulation.rover.heading`, `activeSimulation.env.hazards`, `activeSimulation.missionManager.waypoints`

### 5. Deep Space DTN Command Uplink & Solar Conjunction Blackout
* **UI Component**: `CommunicationPage.jsx` & `DataQueuePage.jsx`
* **Frontend Service**: `sendDTNCommand()`, `fetchDTNQueue()`, `apiToggleBlackout()` (`communicationApi.js`)
* **API Endpoint**: `POST /api/communication/send`, `GET /api/communication/queue`, `POST /api/communication/blackout`
* **Backend Service**: `apps/backend/src/api/routes/communicationRoutes.js`
* **Source-of-Truth**: `DTNCommunicationChannel` (`packages/communication-protocol/dtn-channel.js`) & `DTNQueue` (`packages/communication-protocol/dtn-queue.js`)

### 6. Authoritative Safety Validator & Physical Invariants
* **UI Component**: `SafetyGatePage.jsx` / `SafetyGateMonitor.jsx`
* **Frontend Service**: `useAutonomy()` hook & `fetchInvariants()`, `validateDecision()` (`autonomyApi.js`)
* **API Endpoint**: `GET /api/autonomy/invariants`, `POST /api/autonomy/validate`
* **Backend Service**: `apps/backend/src/api/routes/autonomyRoutes.js`
* **Source-of-Truth**: `SafetyValidator.validate(decision, observation)` (`packages/simulation-core/autonomy/safety-validator.js`)

### 7. Multi-Agent Reasoning Trace & Anomaly Detector
* **UI Component**: `AIPage.jsx` / `AgentTraceView.jsx`
* **Frontend Service**: `useIntelligence()` hook & `analyzeTelemetry()` (`intelligenceApi.js`)
* **API Endpoint**: `GET /api/intelligence/analyze`, `GET /api/intelligence/learning`
* **Backend Service**: `apps/backend/src/api/routes/intelligenceRoutes.js` (reverse proxy to Python AI Service `:8000`)
* **Source-of-Truth**: `PythonAIEngine.analyze()` (`services/ai-engine/app/api/routes.py`) with fallback to `MissionIntelligenceEngine` (`packages/simulation-core/intelligence/mission-intelligence-engine.js`)

### 8. Autonomous Mission Planner & A* Route Scoring
* **UI Component**: `MissionPage.jsx` / `MissionTimeline.jsx`
* **Frontend Service**: `useMissionPlan()` hook & `fetchMissionPlan()` (`missionApi.js`)
* **API Endpoint**: `GET /api/mission/plan`
* **Backend Service**: `apps/backend/src/api/routes/missionRoutes.js`
* **Source-of-Truth**: `MissionPlanner.plan(observation)` (`packages/simulation-core/autonomy/planner/mission-planner.js`)

### 9. Digital Twin 14-Type Fault Sandbox & DuckDB Analytics
* **UI Component**: `DigitalTwinPage.jsx`
* **Frontend Service**: `fetchTwinHealth()`, `generateDataset()` (`digitalTwinApi.js`) & `injectFault()` (`simulationApi.js`)
* **API Endpoint**: `POST /api/simulation/fault/inject`, `GET /api/digital-twin/health`, `POST /api/digital-twin/dataset/generate`
* **Backend Service**: `apps/backend/src/api/routes/simulationRoutes.js` & `digitalTwinRoutes.js` (proxying to `:8010`)
* **Source-of-Truth**: `MarsEnvironment.injectFault()` (`packages/simulation-core/environment/mars-environment.js`) & `PythonDigitalTwinRuntime` (`services/digital-twin/app/runtime.py`)

### 10. Head-to-Head Policy Benchmarking Engine
* **UI Component**: `SafetyGatePage.jsx` (Benchmark Panel)
* **Frontend Service**: `fetchBenchmarkResults()`, `executeBenchmarkScenario()` (`benchmarkApi.js`)
* **API Endpoint**: `GET /api/benchmarks/results`, `POST /api/benchmarks/run`
* **Backend Service**: `apps/backend/src/api/routes/benchmarkRoutes.js`
* **Source-of-Truth**: `scripts/benchmarking/run-policy-benchmark.js` executing multi-policy comparative evaluation across identical initial conditions.

### 11. ML Model Governance & 7D Feature Vectors
* **UI Component**: `MLRegistryPage.jsx`
* **Frontend Service**: `fetchModelRegistry()`, `promoteModel()` (`mlApi.js`)
* **API Endpoint**: `GET /api/ml/registry`, `POST /api/ml/models/:id/promote`
* **Backend Service**: `apps/backend/src/api/routes/mlTrainingRoutes.js` (proxying to `:8011`)
* **Source-of-Truth**: `ModelRegistry` (`services/ml-engine/app/model_registry.py`)

### 12. Distributed RL Training Engine & Loss Curves
* **UI Component**: `TrainingPage.jsx`
* **Frontend Service**: `fetchTrainingJobs()`, `createTrainingJob()` (`trainingApi.js`)
* **API Endpoint**: `GET /api/training/jobs`, `POST /api/training/jobs`
* **Backend Service**: `apps/backend/src/api/routes/mlTrainingRoutes.js` (proxying to `:8012`)
* **Source-of-Truth**: `TrainingClusterManager` (`services/training-engine/app/trainer.py`)
