# Digital Twin as the Experimental Laboratory
## AntriX Digital Twin Simulation & Scientific Policy Evaluation

> **Document Type**: Experimental Methodology & API Standard  
> **Status**: IMPLEMENTED

---

## 1. Laboratory API Specification

The Digital Twin (`services/digital-twin`, Port `8010`) provides a complete experimental harness:

```python
# Experimental Harness API
runtime.reset(seed=42)
runtime.set_seed(42)
runtime.inject_fault({"type": "DUST_STORM", "startTime": 30.0, "duration": 180.0})
obs = runtime.observe()
state = runtime.step(obs, dt=1.0, decision=proposed_action)
runtime.checkpoint("CP-STAGE-1")
runtime.restore("CP-STAGE-1")
comparison = runtime.compare_policies(scenario_id="SCEN-01", policies=["RULE_BASED", "ML_POLICY", "RL_POLICY"], seed=42)
```

---

## 2. Scientific Multi-Policy Benchmarking

The experimental laboratory enables testing **identical scenario definitions** under **identical random seeds** across competing autonomy paradigms:
1. **Rule-Based Baseline**: Deterministic safety rules and heuristics.
2. **Supervised ML Policy**: Classifiers trained on historical successful mission sequences.
3. **Reinforcement Learning (PPO)**: Policy trained with `SafetyWrapper` reward shaping.

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `DigitalTwinRuntime` laboratory methods (`reset`, `step`, `observe`, `inject_fault`, `set_seed`, `compare_policies`).
  - DuckDB zero-copy SQL querying on Parquet telemetry.
  - Multi-policy benchmark execution runner (`scripts/benchmarking/run-policy-benchmark.js`).

- **SIMPLIFIED**:
  - Python Digital Twin mirrors 2D simulation telemetry state rather than running a parallel 3D physics solver.

- **ASSUMED**:
  - Deterministic PRNG seeding produces bit-for-bit identical state progressions.

- **FUTURE WORK**:
  - Multi-agent swarm Digital Twin modeling (rover + helicopter/drone coordination).
