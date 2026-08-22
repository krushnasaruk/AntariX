/**
 * DELAY-TOLERANT NETWORKING (DTN) PACKET DEFINITIONS & FACTORY
 */

export const PacketStatus = {
  CREATED: 'CREATED',
  QUEUED: 'QUEUED',
  TRANSMITTING: 'TRANSMITTING',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  BLOCKED: 'BLOCKED'
};

export const PacketType = {
  COMMAND: 'COMMAND',
  TELEMETRY: 'TELEMETRY',
  SCIENCE_DATA: 'SCIENCE_DATA',
  ACKNOWLEDGEMENT: 'ACKNOWLEDGEMENT',
  ALERT: 'ALERT',
  MISSION_UPDATE: 'MISSION_UPDATE'
};

export const PacketPriority = {
  CRITICAL: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1
};

export const Endpoint = {
  EARTH: 'EARTH',
  MARS: 'MARS'
};

let packetCounter = 0;

/**
 * Validates endpoint value.
 * @param {string} endpoint 
 * @param {string} fieldName 
 */
function validateEndpoint(endpoint, fieldName) {
  if (!endpoint || typeof endpoint !== 'string' || !(endpoint.toUpperCase() in Endpoint)) {
    throw new TypeError(`Invalid ${fieldName}: "${endpoint}". Must be either "EARTH" or "MARS".`);
  }
}

/**
 * Creates and validates a DTN Packet.
 * @param {Object} options 
 * @returns {Object} DTN Packet object
 */
export function createDTNPacket(options = {}) {
  const source = (options.source || Endpoint.EARTH).toUpperCase();
  const destination = (options.destination || Endpoint.MARS).toUpperCase();

  validateEndpoint(source, 'source');
  validateEndpoint(destination, 'destination');

  if (source === destination) {
    throw new Error(`Invalid endpoints: source "${source}" and destination "${destination}" cannot be the same.`);
  }

  const type = options.type || PacketType.COMMAND;
  if (!(type in PacketType)) {
    throw new Error(`Invalid packet type: "${type}". Allowed types: ${Object.keys(PacketType).join(', ')}.`);
  }

  const priorityKey = options.priority || 'NORMAL';
  const priorityValue = typeof options.priority === 'number'
    ? options.priority
    : (PacketPriority[priorityKey] || PacketPriority.NORMAL);

  packetCounter++;
  const id = options.id || `PKT-${Date.now()}-${packetCounter}`;

  return {
    id,
    source,
    destination,
    type,
    priority: priorityValue,
    priorityName: Object.keys(PacketPriority).find(k => PacketPriority[k] === priorityValue) || 'NORMAL',
    payload: options.payload !== undefined ? options.payload : {},
    requiresAcknowledgement: Boolean(options.requiresAcknowledgement),
    createdAt: options.createdAt || Date.now(),
    transmissionStart: options.transmissionStart || null,
    expectedArrival: options.expectedArrival || null,
    actualArrival: options.actualArrival || null,
    status: options.status || PacketStatus.CREATED,
    retryCount: options.retryCount || 0,
    maxRetries: options.maxRetries !== undefined ? options.maxRetries : 3,
    acknowledgementId: options.acknowledgementId || null
  };
}
