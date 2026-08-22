# Dataset Quality & Automated Validation

This document describes automated quality validation rules and dataset manifest generation.

---

## 1. Automated Validation Checks

1. **Battery Range Gatekeeping**: Battery level must satisfy $0.0 \le \text{battery} \le 1.0$.
2. **Kinematic Jump Check**: Inter-step position distance must not exceed physical rover velocity limits ($> 50\text{m/s}$ flagged as coordinate jump anomaly).
3. **Monotonicity & Duplicates**: Timestamps must be strictly monotonic without duplicate `(episode_id, simulation_time)` pairs.
4. **Data Quality Score**: Computed as $Q = \max(0, 100 - (\text{issues} \times 2))$.
