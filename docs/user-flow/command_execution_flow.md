# 🔄 Command Execution Flow

1. Operator issues `MOVE_TO` via Frontend HUD.
2. Gateway enqueues packet into DTN queue with configured light-speed delay timer.
3. Timer expires -> Packet delivered to Rover AI Executive.
4. AI Executive verifies terrain safety -> Motor controllers execute move.
5. Telemetry packet sent back through downlink delay queue to Earth.
