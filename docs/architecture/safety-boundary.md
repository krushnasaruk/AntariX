# Safety Boundary & Authority Hierarchy
## AntriX Deterministic Physical Safety Architecture

> **Document Type**: Safety Specification & Invariant Standard  
> **Status**: IMPLEMENTED

---

## 1. The Four-Tier Authority Separation

AntriX enforces a strict conceptual and execution boundary across autonomy components:

```text
+-------------------------------------------------------------------------+
| AI / ML / RL Policy Engine                                              |
| "What goal or high-level action should we attempt?"                     |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
| Mission Planner & Replanner                                             |
| "What sequence of atomic tasks could achieve it?"                       |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
| OBJECTIVE 5: AUTHORITATIVE PHYSICAL SAFETYVALIDATOR                     |
| "Is this action allowed, within battery floor, and physically safe?"    |
+-------------------------------------------------------------------------+
                                     │
                                     ▼
+-------------------------------------------------------------------------+
| Objective 4 / Physics Simulation Kernel                                 |
| "What actually happens to physical rover mass, wheels, and state?"      |
+-------------------------------------------------------------------------+
```

---

## 2. Hard Invariants

1. **Advisory AI**: AI models cannot directly mutate physical simulation state.
2. **Authoritative Validator**: Objective 5 `SafetyValidator` intercepts, evaluates, and overrides any proposal that violates hard physical limits (e.g. Battery $< 15\%$, Slope $> 25^\circ$, Collision Distance $< 2\text{m}$).
3. **Deterministic Fallbacks**: On rejection, `SafetyValidator` substitutes safe fallbacks (`WAIT` or `RETURN_TO_BASE`).
4. **Deadlock Prevention**: Earth guidance requests contain timeout deadlines with safety-authorized local fallbacks.

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `SafetyValidator` with battery floor, obstacle proximity, and terrain limits.
  - RL `SafetyWrapper` with $-50.0$ safety penalty.
  - `DecisionProvenanceLogger` tracking overrides.
  - `EarthGuidanceManager` timeout fallbacks.

- **SIMPLIFIED**:
  - 2D obstacle bounding radius checks.

- **ASSUMED**:
  - Hard constraint rules represent flight rule flight-critical minimum thresholds.

- **FUTURE WORK**:
  - Formal runtime verification (LTL model checking) of planned multi-step trajectories.
