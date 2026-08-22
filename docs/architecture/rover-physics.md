# Rover Physics & Energy Mechanics
## AntriX Interpretable Physical Energy & Kinematics Model

> **Document Type**: Physics Specification & Mathematical Derivations  
> **Status**: IMPLEMENTED

---

## 1. Governing Physical Equations

The total energy consumed by the rover over a motion segment is modeled as:

$$E_{\text{total}} = E_{\text{rolling}} + E_{\text{slope}} + E_{\text{acceleration}} + E_{\text{motorLoss}} + E_{\text{avionics}} + E_{\text{slip}}$$

### Mechanical Forces & Power
1. **Normal Force**:
   $$F_N = (m_{\text{rover}} + m_{\text{payload}}) \cdot g_{\text{mars}} \cdot \cos(\theta)$$
   where $g_{\text{mars}} = 3.721\text{ m/s}^2$, $m_{\text{rover}} = 899\text{ kg}$, $m_{\text{payload}} = 73\text{ kg}$.

2. **Rolling Resistance Force**:
   $$F_{\text{rolling}} = C_{rr}(\text{terrain}) \cdot F_N$$
   where $C_{rr} \in \{0.04\text{ (FLAT)}, 0.08\text{ (ROUGH)}, 0.22\text{ (SOFT\_SAND)}, 0.12\text{ (REGOLITH\_ROCK)}\}$.

3. **Slope Force**:
   $$F_{\text{slope}} = (m_{\text{rover}} + m_{\text{payload}}) \cdot g_{\text{mars}} \cdot \sin(\theta)$$

4. **Acceleration Force**:
   $$F_{\text{accel}} = (m_{\text{rover}} + m_{\text{payload}}) \cdot a$$

5. **Electrical Drive Power**:
   $$P_{\text{elec}} = \frac{(F_{\text{rolling}} + \max(0, F_{\text{slope}}) + F_{\text{accel}}) \cdot v}{\eta_{\text{motor}} \cdot \eta_{\text{drivetrain}}} \cdot (1 + 1.5 \cdot s)$$
   where $\eta_{\text{motor}} \approx 0.85$, $\eta_{\text{drivetrain}} \approx 0.90$, $s = \text{wheel slip ratio}$.

6. **Thermal Kinetic Penalty**:
   $$k_{\text{temp}} = 1.0 + \max(0, (-20 - T_{\text{ext}}) \cdot 0.003)$$

7. **Total Power & Energy**:
   $$P_{\text{total}} = P_{\text{avionics}} + (P_{\text{elec}} \cdot k_{\text{temp}}) - P_{\text{solar}}$$
   $$E_{\text{Wh}} = \frac{P_{\text{total}} \cdot \Delta t}{3600}$$

---

## 2. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `RoverPhysicsEngine.calculateDetailedEnergy()` in `packages/simulation-core/physics/rover-physics.js`.
  - Elevation and slope calculation based on Crater-07 profile.
  - Thermal kinetic battery degradation below $-20^\circ\text{C}$.
  - Backward compatibility with Objective 4 unit tests.

- **SIMPLIFIED**:
  - 2D kinematics (longitudinal drive without 3D full bogie-rocker suspension articulated dynamics).
  - Uniform terrain patch assumptions.

- **ASSUMED**:
  - DC brushless electric motors with constant average efficiency ($\eta = 0.85$).
  - Solar array charging efficiency at 22% during nominal sunlight.

- **FUTURE WORK**:
  - 6-wheel independent slip terramechanics (Bekker-Wong soil mechanics model).
