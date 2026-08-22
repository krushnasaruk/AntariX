# AntriX System Architecture Audit
## Comprehensive Technical Audit of Objectives 1–12 Prior to System Hardening

> **Status**: COMPLETED  
> **Document Purpose**: Authoritative baseline audit evaluating architectural strengths, weaknesses, deterministic assumptions, physics limits, AI imitation risks, uncertainty gaps, and refactoring pathways.

---

## 1. Objectives 1–12 Implementation & Component Mapping

| Objective | Subsystem Domain | Primary Files & File Paths | Key Classes & Functions |
| :--- | :--- | :--- | :--- |
| **Objective 1** | Physical Delay Engine | [`packages/communication-protocol/delay-engine.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/delay-engine.js) | `calculateOneWayDelay()`, `calculateRoundTripDelay()`, `calculateSignalArrivalTime()`, `SPEED_OF_LIGHT_M_S`, `DistanceScenario` |
| **Objective 2** | DTN Bundle Channel | [`packages/communication-protocol/dtn-channel.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/dtn-channel.js)<br>[`packages/communication-protocol/dtn-queue.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/dtn-queue.js)<br>[`packages/communication-protocol/dtn-packet.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/dtn-packet.js) | `DTNCommunicationChannel`, `DTNQueue`, `createDTNPacket()`, `PacketPriority`, `PacketStatus`, `ChannelEvent` |
| **Objective 3** | Mission State & Sol Clock | [`packages/simulation-core/mission/mission-manager.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/mission/mission-manager.js)<br>[`packages/simulation-core/time/sol-clock.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/time/sol-clock.js) | `MissionManager`, `SolClock`, `TaskState`, `MissionStatus`, `TaskQueue` |
| **Objective 4** | Environment & Rover Physics | [`packages/simulation-core/environment/mars-environment.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/environment/mars-environment.js)<br>[`packages/simulation-core/environment/rover-model.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/environment/rover-model.js)<br>[`packages/simulation-core/physics/rover-physics.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/physics/rover-physics.js) | `MarsEnvironment`, `RoverModel`, `RoverPhysicsEngine`, `CraterMap`, `TerrainProperties` |
| **Objective 5** | Autonomy & Safety Gatekeeper | [`packages/simulation-core/autonomy/safety-validator.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/safety-validator.js)<br>[`packages/simulation-core/autonomy/decision-engine.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/decision-engine.js)<br>[`packages/simulation-core/autonomy/decision-rules.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/decision-rules.js) | `SafetyValidator` (Authoritative), `AutonomyDecisionEngine`, `SafetyBatteryRule`, `RoverHealthRule`, `ObstacleSafetyRule` |
| **Objective 6** | Autonomous Planning | [`packages/simulation-core/autonomy/planner/mission-planner.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/planner/mission-planner.js)<br>[`packages/simulation-core/autonomy/planner/contingency-planner.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/planner/contingency-planner.js)<br>[`packages/simulation-core/autonomy/planner/plan-validator.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/planner/plan-validator.js) | `MissionPlanner`, `ContingencyPlanner`, `PlanValidator`, `scorePlan()` |
| **Objective 7** | Python AI Intelligence | [`services/ai-engine/app/intelligence/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/ai-engine/app/intelligence)<br>[`packages/simulation-core/intelligence/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/intelligence) | `AnomalyDetector`, `RiskAssessmentEngine`, `MissionPredictionEngine`, `PythonIntelligenceAdapter` |
| **Objective 8** | AI Memory & Strategy | [`services/ai-engine/app/memory/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/ai-engine/app/memory)<br>[`packages/simulation-core/intelligence/python-learning-adapter.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/intelligence/python-learning-adapter.js) | `ExperienceRepository`, `FailurePatternAnalyzer`, `AdaptiveStrategyEngine` |
| **Objective 9** | Digital Twin & DuckDB | [`services/digital-twin/app/runtime/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/digital-twin/app/runtime)<br>[`services/digital-twin/app/telemetry/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/digital-twin/app/telemetry)<br>[`packages/simulation-core/digital-twin/python-digital-twin-adapter.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/digital-twin/python-digital-twin-adapter.js) | `DeterministicSimulationClock`, `DigitalTwinRuntime`, `StateSnapshot`, `TelemetryCollector`, `CheckpointManager`, `DuckDBStore`, `ParquetStore` |
| **Objective 10** | Scenario Factory & Datasets | [`services/digital-twin/app/scenarios/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/digital-twin/app/scenarios)<br>[`services/digital-twin/app/datasets/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/digital-twin/app/datasets) | `ScenarioFactory`, `FaultInjector`, `NoiseModel`, `DatasetValidator`, `DatasetSplitter`, `DatasetBuilder` |
| **Objective 11** | ML Engine & Gym Safety | [`services/ml-engine/app/rl/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/ml-engine/app/rl)<br>[`services/ml-engine/app/models/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/ml-engine/app/models)<br>[`packages/simulation-core/ml/python-ml-adapter.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/ml/python-ml-adapter.js) | `MarsGymEnv`, `SafetyWrapper`, `FeaturePipeline`, `ModelRegistry`, `InferenceService` |
| **Objective 12** | Production Training Engine | [`services/training-engine/app/training/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/training-engine/app/training)<br>[`services/training-engine/app/workers/`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/services/training-engine/app/workers)<br>[`packages/simulation-core/ml/python-training-adapter.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/ml/python-training-adapter.js) | `RLTrainer`, `SupervisedTrainer`, `ReproducibilityManager`, `WorkerRegistry`, `SafetyMetricsCollector`, `SplitValidator` |

---

## 2. Architectural Strengths

1. **Clear Modular Boundaries**: Microservices communicate over clean REST interfaces (`8000`, `8010`, `8011`, `8012`) with offline fallback handlers in Node.js adapters.
2. **Authoritative Single Source of Truth for Latency**: Objective 1 [`delay-engine.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/delay-engine.js) encapsulates true physical speed-of-light propagation ($c = 299,792,458\text{ m/s}$).
3. **Hard Physical Safety Gatekeeping**: Objective 5 [`SafetyValidator`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/autonomy/safety-validator.js) intercepts unsafe actions before execution in simulation.
4. **Deterministic Reproducibility**: Seed-based generation and deterministic simulation clocks decouple simulation time from wall-clock time.
5. **High-Performance Analytical Storage**: Apache Parquet + DuckDB enables sub-50ms SQL queries on historical telemetry.

---

## 3. Weaknesses & Technical Debt

1. **Deterministic Assumptions Hardcoded Everywhere**:
   - The simulation assumes exact ground truth is always known to the rover without localization error.
   - Fixed drain rates (e.g. `0.0001` fraction/sec) are hardcoded in prediction engines.
   - Weather follows fixed step intervals ($7200\text{s}$ to $10800\text{s}$ dust storm) rather than stochastic atmospheric transitions.
2. **Simplified Rover Physics**:
   - Energy consumption in [`rover-model.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/simulation-core/environment/rover-model.js) is computed as $\text{energy} = \text{distance} \times \text{multiplier} \times \text{rate}$, omitting mass, rolling resistance, slip dynamics, motor efficiency curves, acceleration, and temperature effects.
3. **AI Policy Imitation Risks & Rule-Based Leakage**:
   - In several places, AI baseline predictions mimic the output of deterministic rules rather than learning from environment transitions and reward feedback.
4. **Lack of Formal Belief State & Uncertainty Representation**:
   - Telemetry objects output scalar values without uncertainty metrics ($\mu, \sigma^2, \text{confidence}$). The rover cannot express "I estimate my battery is at 20% with 85% confidence".
5. **Missing Communication Contact Windows & Jitter**:
   - DTN channel does not model orbiter pass contact windows, transmission duration, jitter, or packet corruption.
6. **No Formal Earth Guidance Request Protocol**:
   - When autonomy is stuck, there is no standardized `REQUEST_EARTH_GUIDANCE` protocol with timeout fallbacks to prevent deadlock.
7. **No Out-of-Distribution (OOD) Detection**:
   - Inference services blindly return predictions even when inputs are completely outside training distribution.

---

## 4. Duplicated Logic & Authority

1. **Gym Environment Duplication**:
   - `MarsGymEnv` and `SafetyWrapper` exist in both `services/ml-engine/app/rl/` and `services/training-engine/app/rl/`.
2. **Prediction Engines in JS vs Python**:
   - Both Node.js `prediction-engine.js` and Python `services/ai-engine/app/intelligence/prediction.py` implement overlapping heuristics.
3. **Observation Builders**:
   - Node.js `autonomy-observation.js`, Python `state_snapshot.py`, and `MarsGymEnv._get_obs_vector()` construct observation vectors independently without a single shared contract schema.

---

## 5. Required Refactoring & Upgrade Roadmap

```text
Phase 1: System Audit (Completed in this document)
Phase 2: Formal WorldState & Contracts (Ground Truth vs Belief State)
Phase 3: Deterministic vs Stochastic Simulation Modes
Phase 4: Uncertainty Model (UncertainValue with mean, std, confidence)
Phase 5: Physically Interpretable Rover Energy Model (Mass, rolling resistance, slip, slope, motor loss)
Phase 6: Realistic Communication Model (Contact windows, bandwidth, jitter, corruption)
Phase 7: Unified Fault Injection Framework (Sensor, Actuator, Environment, Comm, Software, AI)
Phase 8: Safety Boundary Refinement (AI -> Planner -> SafetyValidator -> Physics)
Phase 9: Time-Aware & Resource-Aware Planning (Contact windows, weather windows, plan scoring)
Phase 10: Internal Event-Driven Bus (Coexisting with synchronous step API)
Phase 11: Digital Twin Experiment API (reset, step, observe, injectFault, comparePolicies)
Phase 12: Dataset Quality & Leakage Gatekeeper (Parquet + DuckDB validation)
Phase 13: Out-of-Distribution (OOD) Detection
Phase 14: Complete Decision Provenance (DecisionRecord logging)
Phase 15: Benchmark Framework (Rule-Based vs ML vs RL under identical seeds)
Phase 16: Regression & Verification Testing (All 294+ existing tests + new capability tests)
```
