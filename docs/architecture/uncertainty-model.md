# Uncertainty Propagation & Confidence Modeling
## AntriX Statistical Uncertainty Architecture

> **Document Type**: Architecture & Mathematical Specification  
> **Status**: IMPLEMENTED

---

## 1. The UncertainValue Primitive

To prevent AI and autonomy services from assuming deterministic certainty over physical variables, AntriX introduces `UncertainValue`:

$$\text{UncertainValue} = \langle \mu, \sigma, \sigma^2, \text{confidence}, \text{unit} \rangle$$

Where:
- $\mu$: Estimated mean value.
- $\sigma$: Standard deviation of the estimate.
- $\sigma^2$: Variance ($\sigma \times \sigma$).
- $\text{confidence} \in [0.0, 1.0]$: Confidence metric in the underlying sensor/model.

---

## 2. Domains of Application

1. **Rover Localization**: $\text{Position}_x = \mathcal{N}(x, \sigma_x^2)$, $\text{Position}_y = \mathcal{N}(y, \sigma_y^2)$.
2. **Battery Kinetics & Depletion Trajectory**: $\text{Battery}(t + \Delta t) = \mu_{\text{bat}} \pm 1.96\sigma_{\text{bat}}$.
3. **Speed-of-Light Communication Delay & Jitter**: Latency predicted with jitter variance.
4. **Weather Forecasting**: Solar irradiance $W/m^2$ with dust opacity uncertainty bounds.
5. **Mission Completion Feasibility**: Estimated completion time with statistical confidence.

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `UncertainValue` JavaScript class in `packages/shared-types/uncertainty.js`.
  - `UncertainValueModel` Pydantic class in `services/ai-engine/app/models/uncertainty.py`.
  - Integration with `PyPredictionEngine` and `MissionPredictionEngine`.
  - Confidence-weighted candidate plan scoring in `plan-scoring.js`.

- **SIMPLIFIED**:
  - Uncorrelated 1D and 2D Gaussian distributions; full non-diagonal covariance matrices are not currently computed for 6-DoF kinematics.

- **ASSUMED**:
  - Measurement noise is zero-mean Gaussian in nominal operating conditions.

- **FUTURE WORK**:
  - Particle filter belief state representation for multi-modal obstacle location hypotheses.
