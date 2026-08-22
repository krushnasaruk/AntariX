# 🧠 Autonomous AI Decision Tree

```
Telemetry Cycle -> Anomaly Detector
                       │
             ┌─────────┴─────────┐
      [Anomaly Detected]   [All Nominal]
             │                   │
      Check Severity     Execute Planned Waypoint
             │
     ┌───────┴───────┐
  [CRITICAL]     [WARNING]
     │               │
Safe Mode      Log Warning & Adjust Speed
```
