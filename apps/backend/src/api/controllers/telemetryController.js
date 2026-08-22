import { store } from '../../database/store.js';
import { telemetryService } from '../../telemetry/telemetryService.js';

export function getLatestTelemetry(req, res) {
  const current = telemetryService.generateNextTick();
  res.json({ success: true, data: current });
}

export function getTelemetryHistory(req, res) {
  res.json({ success: true, count: store.telemetryHistory.length, data: store.telemetryHistory });
}
