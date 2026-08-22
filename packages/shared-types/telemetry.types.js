/**
 * @typedef {Object} TelemetryPacket
 * @property {string} packetId
 * @property {number} timestamp
 * @property {number} sol
 * @property {number} batteryLevel // percentage 0-100
 * @property {number} solarInputWatts
 * @property {number} internalTempCelsius
 * @property {number} externalTempCelsius
 * @property {{x: number, y: number, heading: number}} position
 * @property {number} speedMps
 * @property {number} wheelSlipRatio
 * @property {number} signalStrengthDbm
 */

export const TELEMETRY_INTERVAL_MS = 1000;
