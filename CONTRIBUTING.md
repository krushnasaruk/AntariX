# 🤝 Contributing to Earth-Mars Autonomous Mission

Thank you for contributing to the Earth-Mars Autonomous Mission software stack! Space exploration systems require extreme safety, reliable communication protocols, and clear code organization.

## 📋 Code of Conduct

1. **Safety First**: Autonomous rover logic must fail gracefully into Safe Mode (Solar preservation + low-power communications).
2. **Deterministic Protocols**: Communication packet schemas in `packages/communication-protocol` must maintain strict backward compatibility.
3. **No Unhandled Exceptions**: All async operations in telemetry pipelines must handle connection drops and packet timeouts.

## 🚀 Branching Strategy

- `main`: Stable, release-ready software approved for flight control simulation.
- `develop`: Integration branch for active features.
- `feature/<name>`: Individual feature work.

## 🧪 Testing Requirements

Before opening a Pull Request:
1. Run all unit and integration tests: `npm test`
2. Verify frontend HUD renders cleanly at `1920x1080` and `1366x768`.
3. Test latency simulation with both 0-second (demo) and 1200-second (realistic aphelion) modes.
