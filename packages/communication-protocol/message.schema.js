export const MessageTypes = {
  COMMAND_UPLINK: 'COMMAND_UPLINK',
  TELEMETRY_DOWNLINK: 'TELEMETRY_DOWNLINK',
  AI_STATUS_REPORT: 'AI_STATUS_REPORT',
  EMERGENCY_BEACON: 'EMERGENCY_BEACON',
  PING: 'PING',
  PONG: 'PONG'
};

export function validateMessage(msg) {
  if (!msg || !msg.type || !MessageTypes[msg.type]) {
    return { valid: false, error: 'Invalid message type' };
  }
  if (!msg.payload) {
    return { valid: false, error: 'Missing message payload' };
  }
  return { valid: true };
}
