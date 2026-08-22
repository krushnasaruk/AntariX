# AntriX Frontend Metric Sources Registry

This registry documents the authoritative provenance of every operational metric, telemetry value, and benchmark calculation displayed across the AntriX Mission Control user interface.

---

| Metric Name | Display Location | Frontend Consumer | API Endpoint | Backend Gateway Service | Authoritative Source of Truth |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Speed-of-Light Delay** | Top Header, Comm Page, Dashboard Card | `CommunicationPage.jsx`, `DashboardPage.jsx` | `GET /api/communication/status` | `communicationRoutes.js` | `calculateOneWayDelay(distanceKm)` (`delay-engine.js`) using $c = 299,792,458\text{ m/s}$ |
| **Earth-Mars Distance** | Top Header, Comm Page | `CommunicationPage.jsx` | `GET /api/communication/status` | `communicationRoutes.js` | `DTNCommunicationChannel.distanceKm` |
| **Battery State of Charge (%)** | Header, Rover Page, Telemetry Page | `WorldStateContext.jsx` | `ws://localhost:3000` | `simulationRoutes.js` | `RoverModel.batteryLevel` (`rover-model.js`) |
| **Battery Reserve Floor (%)** | Rover Page, Safety Gate | `RoverPage.jsx`, `SafetyGatePage.jsx` | `GET /api/autonomy/invariants` | `autonomyRoutes.js` | `SafetyValidator.MIN_BATTERY_RESERVE = 0.15` |
| **Solar Array Generation (W)** | Dashboard Card, Rover Page | `DashboardPage.jsx`, `RoverPage.jsx` | `ws://localhost:3000` | `simulationRoutes.js` | `RoverModel.calculateSolarInput(solarIntensity, dustLevel)` |
| **6-Wheel Motor Current & Slip** | Rover Subsystems Page | `RoverPage.jsx` | `ws://localhost:3000` | `simulationRoutes.js` | `RoverModel.telemetry.wheelSlip` (`rover-model.js`) |
| **Martian Surface Gravity** | Simulation Page | `SimulationPage.jsx` | `GET /api/simulation/world-state` | `simulationRoutes.js` | `MarsEnvironment.gravity = 3.721` ($\text{m/s}^2$) |
| **Martian Temperature & Pressure** | Simulation Page, Header | `SimulationPage.jsx` | `GET /api/simulation/world-state` | `simulationRoutes.js` | `MarsEnvironment.weather.temperature`, `atmosphericPressure` |
| **Atmospheric Dust Tau** | Simulation Page, AI Page | `SimulationPage.jsx`, `AIPage.jsx` | `GET /api/simulation/world-state` | `simulationRoutes.js` | `MarsEnvironment.weather.dustLevel` |
| **DTN Queued Bundles** | Comm Page, DTN Queue Page | `CommunicationPage.jsx`, `DataQueuePage.jsx` | `GET /api/communication/queue` | `communicationRoutes.js` | `DTNQueue.getQueueSize()` (`dtn-queue.js`) |
| **DTN Priority Allocations** | DTN Queue Page | `DataQueuePage.jsx` | `GET /api/communication/queue` | `communicationRoutes.js` | `PacketPriority` (CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1) |
| **10 Physical Safety Invariants** | Safety Gate Page | `SafetyGatePage.jsx` | `GET /api/autonomy/invariants` | `autonomyRoutes.js` | `SafetyValidator.rules` (`safety-validator.js`) |
| **Multi-Policy Benchmark Scores** | Safety Gate Benchmark Panel | `SafetyGatePage.jsx` | `GET /api/benchmarks/results` | `benchmarkRoutes.js` | `reports/benchmark-results.json` (`run-policy-benchmark.js`) |
| **Mission Energy Cost Forecast** | Mission Plan Page | `MissionPage.jsx` | `GET /api/mission/plan` | `missionRoutes.js` | `MissionPlanner.scorePlan()` (`plan-scoring.js`) |
| **A* Path Traversal Distance** | Mission Plan Page | `MissionPage.jsx` | `GET /api/mission/plan` | `missionRoutes.js` | `MissionPlan.totalDistanceMeters` (`mission-planner.js`) |
| **7D MarsGymEnv Feature Vector** | ML Registry Page | `MLRegistryPage.jsx` | `GET /api/ml/registry` | `mlTrainingRoutes.js` | `PythonMLEngine.extract_features()` (`feature_pipeline.py`) |
| **Distributed RL Worker Load** | Training Engine Page | `TrainingPage.jsx` | `GET /api/training/jobs` | `mlTrainingRoutes.js` | `PythonTrainingEngine.get_cluster_status()` (`trainer.py`) |
| **Immutable System Audit Events** | System Events Page | `EventsPage.jsx` | `GET /api/mission/events` | `missionRoutes.js` | `MissionManager.eventLog` (`mission-manager.js`) |
