# Communication Model & Contact Windows
## AntriX Delay-Tolerant Space Network Architecture

> **Document Type**: Communication Specification & Protocol Standard  
> **Status**: IMPLEMENTED

---

## 1. Physical Speed-of-Light Propagation Latency

The single authoritative source of truth for physical Earth–Mars propagation delay remains Objective 1 ([`delay-engine.js`](file:///c:/Users/Krushna/OneDrive/Documents/AntriX/packages/communication-protocol/delay-engine.js)):

$$t_{\text{prop}} = \frac{d_{\text{Earth-Mars}} \cdot 1000}{c}, \quad c = 299,792,458\text{ m/s}$$

Latency ranges from **182.13 seconds** (3.04 min at Opposition) to **1337.59 seconds** (22.29 min at Conjunction).

---

## 2. Realistic Channel Dynamics

1. **Transmission Duration**:
   $$T_{\text{tx}} = \frac{\text{packetSizeBytes} \cdot 8}{\text{bandwidthKbps} \cdot 1000}$$
2. **Contact Windows (`ContactWindow`)**:
   Models orbiter overpasses (e.g. Mars Reconnaissance Orbiter / Mars Odyssey) and Deep Space Network (DSN) ground station visibility.
3. **Packet Corruption & Loss**:
   Models cosmic radiation bit-flips and atmospheric noise.
4. **Blackout Buffering**:
   DTN Store-and-Forward bundle queue retains high-priority commands during Solar Conjunction.

---

## 3. Engineering Status Breakdown

- **IMPLEMENTED**:
  - `ContactWindow` management in `DTNCommunicationChannel`.
  - Objective 1 speed-of-light delay single source of truth.
  - Jitter, corruption, and priority bundle scheduling.
  - Transmission duration accounting.

- **SIMPLIFIED**:
  - Constant bandwidth across a single contact window rather than dynamic RF signal-to-noise ratio curves.

- **ASSUMED**:
  - DSN 34-meter / 70-meter antenna scheduling produces scheduled rectangular contact windows.

- **FUTURE WORK**:
  - Dynamic Ka-band / X-band weather atmospheric attenuation modeling on Earth ground stations.
