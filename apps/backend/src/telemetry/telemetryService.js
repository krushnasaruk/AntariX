import { store } from '../database/store.js';

export class TelemetryService {
  constructor() {
    this.currentRoverState = {
      packetId: 'TLM-0',
      timestamp: Date.now(),
      sol: 142,
      batteryLevel: 94.2,
      solarInputWatts: 580.4,
      internalTempCelsius: 18.5,
      externalTempCelsius: -62.4,
      position: { x: 284.5, y: 322.1, heading: 42.8 },
      speedMps: 0.12,
      wheelSlipRatio: 0.04,
      signalStrengthDbm: -84.2,
      subsystems: {
        battery: 'NOMINAL',
        thermal: 'NOMINAL',
        navigation: 'NOMINAL',
        communications: 'NOMINAL',
        sciencePayload: 'NOMINAL'
      }
    };
  }

  generateNextTick() {
    const time = Date.now();
    // Simulate battery slow discharge / solar generation
    const solarChange = (Math.random() - 0.5) * 5;
    const battChange = (Math.random() - 0.48) * 0.1;

    this.currentRoverState = {
      ...this.currentRoverState,
      packetId: 'TLM-' + time,
      timestamp: time,
      batteryLevel: Math.max(10, Math.min(100, this.currentRoverState.batteryLevel + battChange)),
      solarInputWatts: Math.max(100, Math.min(750, this.currentRoverState.solarInputWatts + solarChange)),
      position: {
        x: Number((this.currentRoverState.position.x + (Math.random() - 0.5) * 0.3).toFixed(2)),
        y: Number((this.currentRoverState.position.y + (Math.random() - 0.5) * 0.3).toFixed(2)),
        heading: Number(((this.currentRoverState.position.heading + (Math.random() - 0.5) * 0.5) % 360).toFixed(1))
      }
    };

    store.addTelemetry(this.currentRoverState);
    return this.currentRoverState;
  }
}

export const telemetryService = new TelemetryService();
