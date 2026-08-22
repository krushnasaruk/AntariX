import { config } from '../../config/index.js';

export class LatencySimulator {
  constructor() {
    this.currentLatencySec = config.latencySeconds;
    this.isBlackout = config.blackoutEnabled;
  }

  getDelayMs() {
    return this.currentLatencySec * 1000;
  }

  setLatency(seconds) {
    this.currentLatencySec = seconds;
  }

  toggleBlackout(active) {
    this.isBlackout = active;
  }
}

export const latencySim = new LatencySimulator();
