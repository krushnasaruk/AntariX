# World State Architecture & Belief State Separation
## AntriX Canonical World State Specification

> **Document Type**: Architecture & Schema Standard  
> **Status**: IMPLEMENTED

---

## 1. Overview & Conceptual Model

The `WorldState` model serves as the canonical shared state representation across the **Physical Simulation Kernel (Node.js)**, **Digital Twin (Python)**, **AI/ML Intelligence Services**, **Autonomous Planner**, and **DTN Telemetry Fabric**.

```text
WorldState
├── timestamp & simulationTime
├── mode (DETERMINISTIC_TEST_MODE | STOCHASTIC_EXPERIMENT_MODE)
├── missionState (sol, status, progress, tasks)
├── roverState (kinematics, battery, health, mass, samples)
├── environmentState (terrain, slope, weather, solar, hazards)
├── communicationState (link, latency, bandwidth, contact windows)
├── resourceState (energy budget, power generation, consumption)
├── beliefState (estimated position/battery vs ground truth)
└── uncertaintyState (variances, standard deviations, confidence)
```

---

## 2. Ground Truth vs. Belief State Separation

In real planetary exploration, rovers never possess omniscient ground truth. AntriX enforces a strict architectural boundary between:
1. **Physical Ground Truth (`roverState`, `environmentState`)**: The authoritative physical reality simulated by the kernel.
2. **Rover Belief State (`beliefState`)**: The rover's onboard state estimation subject to sensor noise and localization drift.

```javascript
// Example BeliefState Schema
beliefState: {
  groundTruthPosition: { x: 520, y: 530 },
  estimatedPosition: { x: 518.7, y: 531.4 },
  positionUncertainty: { sigmaX: 2.1, sigmaY: 2.4, confidence: 0.90 },
  estimatedBattery: { mean: 0.82, standardDeviation: 0.02, confidence: 0.95 },
  knownObstacles: [ ... ],
  knownHazards: [ ... ]
}
```

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - Unified `WorldState` schema in `packages/shared-types/world-state.js`.
  - Separation of `groundTruthPosition` and `estimatedPosition` with Gaussian sensor noise.
  - Position uncertainty ($\sigma_x, \sigma_y$) and confidence metrics.
  - Integration with `RoverModel.getRoverObservation()`.

- **SIMPLIFIED**:
  - Position estimation currently uses a 2D Gaussian sensor noise model rather than an Extended Kalman Filter (EKF) with IMU odometry integration.

- **ASSUMED**:
  - Wheel encoders and visual odometry produce approximately Gaussian localization noise ($\sigma \approx 1.5\text{m}$).

- **FUTURE WORK**:
  - Implement full 15-state onboard Extended Kalman Filter fusing IMU, Sun Sensor, and Visual Odometry.
