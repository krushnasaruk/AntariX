# 🔌 REST & WebSocket API Reference

## REST Endpoints
- `GET /api/health` — Gateway status
- `GET /api/telemetry/latest` — Current rover state
- `POST /api/command/send` — Enqueue uplink packet
- `GET /api/command/queue` — View DTN buffer

## WebSocket Stream
- `ws://localhost:4000` — Live 1Hz telemetry feed
