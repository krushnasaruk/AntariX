# Reinforcement Learning Architecture & Safety Gatekeeping

This document details the Gymnasium-compatible `MarsGymEnv` and `SafetyWrapper` architecture.

---

## 1. Environment Specifications

- **Observation Space**: 7-dimensional continuous `Box` space (battery, position x/y, simulation step, communication delay, weather, comm availability).
- **Action Space**: 5 discrete actions (`0: WAIT`, `1: MOVE_ROVER`, `2: START_TASK`, `3: COLLECT_SAMPLE`, `4: RETURN_TO_BASE`).

## 2. Mandatory Safety Wrapper

Every action emitted by an RL policy passes through `SafetyWrapper`:

$$\text{RL Policy} \rightarrow \text{SafetyWrapper} \rightarrow \text{Objective 5 SafetyValidator} \rightarrow \text{Execute / Reject} \rightarrow \text{Digital Twin}$$

If an RL policy attempts an unsafe action (e.g. `MOVE_ROVER` when battery < 0.05):
1. Action is overridden with `WAIT` (or `RETURN_TO_BASE`).
2. Policy receives a heavy safety penalty ($-50.0$).
3. Rejection count is recorded in evaluation metrics.
