# 🏗️ Technical Architecture: System Overview

The system consists of three primary operational tiers:

```
[Earth Ground Control UI] ──(WebSockets/REST)──> [Deep Space Gateway & DTN Queue]
                                                               │
                                                 (Simulated Radio Delay Pipeline)
                                                               │
[Martian Rover Hardware/Sim] <──(Low-latency Bus)─── [AI Executive Engine]
```
