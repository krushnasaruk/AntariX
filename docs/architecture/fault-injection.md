# Fault Injection Framework & Edge-Case Synthesis
## AntriX Multi-Category Anomaly & Hardware Fault Generation

> **Document Type**: Reliability & Testing Specification  
> **Status**: IMPLEMENTED

---

## 1. Fault Taxonomy & 6 Core Categories

The `FaultInjector` produces structured anomaly injections across 6 domains:

1. **SENSOR**: GPS drift, IMU bias, camera occlusion, noisy sensor readings, dropped telemetry packets.
2. **ACTUATOR**: Wheel motor degradation, wheel stall/entrapment, steering angle error, drivetrain friction increase.
3. **ENVIRONMENT**: Severe dust storms (solar reduction up to 85%), unexpected boulder obstacles, fissure hazard zones, extreme thermal drop.
4. **COMMUNICATION**: Solar conjunction plasma blackouts, DTN buffer overflow/congestion, packet corruption, latency spikes.
5. **SOFTWARE**: Planner timeouts, AI microservice offline, stale observation vectors, infeasible plan generation.
6. **AI / MODEL**: Low confidence outputs, invalid action vectors, out-of-distribution observation anomalies.

---

## 2. Multi-Fault Combinations

Real deep space failures are rarely isolated. The framework supports concurrent multi-fault scenarios:
$$\text{Scenario} = \text{DUST\_STORM} \oplus \text{COMMUNICATION\_BLACKOUT} \oplus \text{BATTERY\_DEGRADATION}$$

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `FaultInjector` supporting 14 fault types and 6 categories in `services/digital-twin/app/scenarios/fault_injector.py`.
  - Multi-fault combination generator (`generate_fault_combination()`).
  - Cryptographic seed reproducibility across fault injections.

- **SIMPLIFIED**:
  - Faults are injected at discrete simulated timestamps rather than continuous Weibull failure-rate probability distributions.

- **ASSUMED**:
  - Hardware failures are either transient or step-function degradation events.

- **FUTURE WORK**:
  - Continuous Bayesian degradation modeling for mechanical wheel wear over multi-Sol missions.
