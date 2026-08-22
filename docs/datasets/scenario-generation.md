# Scenario Generation & Fault Injection Framework

This document describes the design, parameter distributions, scenario templates, fault injection, and noise modeling for the **Mars Mission Scenario Factory** (Objective 10).

---

## 1. Overview & Architecture Diagram

```mermaid
flowchart TD
    subgraph INPUTS [Seed & Distribution Configuration]
        seed[SeedContext (Master Seed)]
        dist[ScenarioDistribution]
        templates[ScenarioTemplates]
    end

    subgraph GENERATOR [Scenario Factory Engine]
        factory[ScenarioFactory]
        injector[FaultInjector (14 Fault Types)]
        noise[NoiseModel (Observed vs Ground Truth)]
    end

    subgraph OUTPUT [Deterministic Scenario]
        scen[ScenarioDefinition]
        episodes[Digital Twin Simulation Episodes]
    end

    seed & dist & templates --> factory
    factory --> injector
    injector --> scen
    scen --> episodes
    episodes --> noise
```

---

## 2. Fault Injection Types

The `FaultInjector` produces structured fault definitions across 14 categories:
- `BATTERY_LOW`, `BATTERY_DRAIN`
- `COMMUNICATION_BLACKOUT`, `DTN_CONGESTION`
- `DUST_STORM`
- `OBSTACLE_BLOCKAGE`, `HAZARD_ENCOUNTER`
- `ROVER_HEALTH_DEGRADATION`, `SENSOR_FAILURE`, `ACTUATOR_FAILURE`
- `NAVIGATION_ERROR`, `TASK_STALL`, `PLAN_INFEASIBILITY`, `RETURN_ENERGY_SHORTFALL`

---

## 3. Sensor Noise & Ground-Truth Separation

The `NoiseModel` applies Gaussian noise, uniform noise, and bias drift to telemetry observations (`observedTelemetry`) without corrupting the authoritative physical ground-truth state (`groundTruthState`).
