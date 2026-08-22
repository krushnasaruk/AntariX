# 📐 System Architecture Blueprint

## Deep Space Communication & Autonomy Stack

```
           ┌─────────────────────────────────────────┐
           │        Earth Ground Control UI          │
           │       (apps/frontend - React/Vite)      │
           └────────────────────┬────────────────────┘
                                │ WebSockets / HTTP
           ┌────────────────────▼────────────────────┐
           │      Deep Space Gateway & DTN Queue     │
           │        (apps/backend - Node.js)         │
           └────────────────────┬────────────────────┘
                                │ Simulated Radio Delay (3m - 22m)
           ┌────────────────────▼────────────────────┐
           │     Autonomous AI Executive & Planner   │
           │      (apps/ai-engine - Decision Engine) │
           └────────────────────┬────────────────────┘
                                │ Low-latency Local Bus
           ┌────────────────────▼────────────────────┐
           │     Martian Rover Simulation & Physics  │
           │     (packages/simulation-core & sim)    │
           └─────────────────────────────────────────┘
```

### Key Subsystems

1. **Frontend (`apps/frontend`)**: React-based telemetry HUD, mission status monitor, optical link control, AI decision tree inspector, and radar canvas visualizer.
2. **Backend Gateway (`apps/backend`)**: Manages real-time WebSockets, REST endpoints, and the Delay-Tolerant Network (DTN) queue simulating signal transmission delay and radio blackouts.
3. **AI Engine (`apps/ai-engine`)**: Onboard intelligent decision system executing high-frequency anomaly detection, emergency recovery procedures, and local path planning without waiting for Earth input.
4. **Simulation Core (`packages/simulation-core` & `simulation/`)**: Sol time calculation (24h 39m 35.244s per Martian Sol), terrain elevation maps, rover motor kinematics, battery solar charging models, and atmospheric dust attenuation.
