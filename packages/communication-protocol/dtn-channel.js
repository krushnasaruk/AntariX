/**
 * DELAY-TOLERANT COMMUNICATION CHANNEL
 * Bi-directional space channel using Objective 1 physical speed-of-light delay engine.
 */

import {
  calculateOneWayDelay,
  calculateRoundTripDelay,
  calculateSignalArrivalTime,
  convertSimulatedTime,
  convertRealTimeWait,
  SPEED_OF_LIGHT_M_S,
  DistanceScenario,
  CommunicationState,
  TimeMultiplierMode
} from './delay-engine.js';

import {
  createDTNPacket,
  PacketStatus,
  PacketType,
  PacketPriority,
  Endpoint
} from './dtn-packet.js';

import { DTNQueue } from './dtn-queue.js';

export const ChannelEvent = {
  PACKET_CREATED: 'PACKET_CREATED',
  PACKET_QUEUED: 'PACKET_QUEUED',
  PACKET_TRANSMISSION_STARTED: 'PACKET_TRANSMISSION_STARTED',
  PACKET_IN_TRANSIT: 'PACKET_IN_TRANSIT',
  PACKET_DELIVERED: 'PACKET_DELIVERED',
  PACKET_ACKNOWLEDGED: 'PACKET_ACKNOWLEDGED',
  PACKET_FAILED: 'PACKET_FAILED',
  PACKET_BLOCKED: 'PACKET_BLOCKED',
  PACKET_CORRUPTED: 'PACKET_CORRUPTED',
  PACKET_DROPPED: 'PACKET_DROPPED',
  PACKET_RETRYING: 'PACKET_RETRYING',
  COMMUNICATION_STATE_CHANGED: 'COMMUNICATION_STATE_CHANGED',
  CONTACT_WINDOW_CHANGED: 'CONTACT_WINDOW_CHANGED',
  QUEUE_UPDATED: 'QUEUE_UPDATED'
};

export class DTNCommunicationChannel {
  constructor(options = {}) {
    this.distanceKm = options.distanceKm || DistanceScenario.TYPICAL_DISTANCE;
    this.communicationState = options.communicationState || CommunicationState.AVAILABLE;
    this.timeMultiplier = options.timeMultiplier || TimeMultiplierMode.REALISTIC;
    this.initialTimeMs = options.startTimeMs || Date.now();
    this.currentTimeMs = this.initialTimeMs;

    this.bandwidthKbps = options.bandwidthKbps || 256.0;
    this.packetLossRate = options.packetLossRate || 0.0;
    this.packetCorruptionRate = options.packetCorruptionRate || 0.0;
    this.jitterStdSec = options.jitterStdSec || 0.0;

    this.contactWindows = options.contactWindows ? [...options.contactWindows] : [];

    this.queue = new DTNQueue();
    this.inTransitPackets = new Map(); // id -> packet
    this.deliveredPackets = [];
    this.failedPackets = [];
    this.corruptedPackets = [];

    this.listeners = new Map();
  }

  // ================= EVENT EMITTER =================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, payload) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try {
          callback(payload);
        } catch (err) {
          console.error(`Error in channel listener for ${event}:`, err);
        }
      }
    }
  }

  // ================= CONTACT WINDOWS =================
  addContactWindow(window) {
    this.contactWindows.push({
      id: window.id || `CW-${Date.now()}-${this.contactWindows.length + 1}`,
      startTime: window.startTime || 0,
      endTime: window.endTime || Infinity,
      bandwidthKbps: window.bandwidthKbps || this.bandwidthKbps,
      packetLossRate: window.packetLossRate !== undefined ? window.packetLossRate : this.packetLossRate,
      linkQuality: window.linkQuality !== undefined ? window.linkQuality : 1.0
    });
  }

  getCurrentContactWindow(timeSec = null) {
    const checkTime = timeSec !== null ? timeSec : (this.currentTimeMs - this.initialTimeMs) / 1000;
    if (this.contactWindows.length === 0) {
      return {
        id: 'DEFAULT_OPEN_WINDOW',
        startTime: 0,
        endTime: Infinity,
        bandwidthKbps: this.bandwidthKbps,
        packetLossRate: this.packetLossRate,
        linkQuality: 1.0,
        isOpen: true
      };
    }
    const win = this.contactWindows.find(w => checkTime >= w.startTime && checkTime <= w.endTime);
    if (win) {
      return { ...win, isOpen: true };
    }
    return { isOpen: false, linkQuality: 0.0, bandwidthKbps: 0 };
  }

  // ================= CONFIGURATION & GETTERS =================
  setCommunicationState(state) {
    if (!state || !(state in CommunicationState)) {
      throw new Error(`Invalid communication state: "${state}". Allowed states: ${Object.keys(CommunicationState).join(', ')}.`);
    }
    const oldState = this.communicationState;
    this.communicationState = state;

    this.emit(ChannelEvent.COMMUNICATION_STATE_CHANGED, {
      previousState: oldState,
      currentState: state,
      timestamp: this.currentTimeMs
    });

    if (state === CommunicationState.AVAILABLE || state === CommunicationState.RESTORING) {
      this.processTransmissionQueue();
    }
  }

  getCommunicationState() {
    return this.communicationState;
  }

  setDistanceKm(distanceKm) {
    calculateOneWayDelay(distanceKm); // Validates input
    this.distanceKm = distanceKm;
  }

  getDistanceKm() {
    return this.distanceKm;
  }

  setTimeMultiplier(multiplier) {
    if (typeof multiplier !== 'number' || multiplier <= 0) {
      throw new TypeError('Time multiplier must be a positive number.');
    }
    this.timeMultiplier = multiplier;
  }

  getTimeMultiplier() {
    return this.timeMultiplier;
  }

  getQueuedPackets() {
    return this.queue.getQueuedPackets();
  }

  getInTransitPackets() {
    return Array.from(this.inTransitPackets.values());
  }

  getDeliveredPackets() {
    return [...this.deliveredPackets];
  }

  getFailedPackets() {
    return [...this.failedPackets];
  }

  // ================= PACKET TRANSMISSION & LIFECYCLE =================
  /**
   * Submits a packet to the channel for transmission.
   * @param {Object} packetData Packet options or existing DTNPacket object
   * @returns {Object} Enqueued/Transmitted packet
   */
  sendPacket(packetData) {
    const packet = packetData.id && packetData.status ? packetData : createDTNPacket(packetData);

    this.emit(ChannelEvent.PACKET_CREATED, packet);

    if (this.communicationState === CommunicationState.BLACKOUT) {
      packet.status = PacketStatus.BLOCKED;
      this.queue.enqueuePacket(packet);

      this.emit(ChannelEvent.PACKET_BLOCKED, packet);
      this.emit(ChannelEvent.PACKET_QUEUED, packet);
      this.emit(ChannelEvent.QUEUE_UPDATED, { queueSize: this.queue.getQueueSize() });
      return packet;
    }

    packet.status = PacketStatus.QUEUED;
    this.queue.enqueuePacket(packet);

    this.emit(ChannelEvent.PACKET_QUEUED, packet);
    this.emit(ChannelEvent.QUEUE_UPDATED, { queueSize: this.queue.getQueueSize() });

    this.processTransmissionQueue();
    return packet;
  }

  /**
   * Processes all queued packets if communication channel is available.
   */
  processTransmissionQueue() {
    if (this.communicationState === CommunicationState.BLACKOUT) return;

    while (this.queue.getQueueSize() > 0 && this.communicationState !== CommunicationState.BLACKOUT) {
      const packet = this.queue.dequeuePacket();
      if (!packet) break;

      packet.status = PacketStatus.TRANSMITTING;
      this.emit(ChannelEvent.PACKET_TRANSMISSION_STARTED, packet);

      // Objective 1 speed-of-light physical latency calculation (SINGLE SOURCE OF TRUTH)
      const oneWayDelaySeconds = calculateOneWayDelay(this.distanceKm);
      const oneWayDelayMs = oneWayDelaySeconds * 1000;

      // Transmission duration based on packet size (default 1024 bytes)
      const packetSizeBytes = packet.payload ? JSON.stringify(packet.payload).length : 256;
      const effectiveBandwidth = this.bandwidthKbps > 0 ? this.bandwidthKbps : 256.0;
      const transmissionDurationMs = (packetSizeBytes * 8 / (effectiveBandwidth * 1000)) * 1000;

      packet.transmissionStart = this.currentTimeMs;
      packet.transmissionDurationMs = transmissionDurationMs;
      packet.expectedArrival = this.currentTimeMs + oneWayDelayMs;
      packet.status = PacketStatus.IN_TRANSIT;

      this.inTransitPackets.set(packet.id, packet);

      this.emit(ChannelEvent.PACKET_IN_TRANSIT, packet);
    }

    this.emit(ChannelEvent.QUEUE_UPDATED, { queueSize: this.queue.getQueueSize() });
  }

  /**
   * Advances simulation time by given simulated seconds and delivers matured in-transit packets.
   * @param {number} simulatedSeconds 
   * @returns {Array<Object>} Packets delivered during this step
   */
  update(simulatedSeconds = 1) {
    if (typeof simulatedSeconds !== 'number' || simulatedSeconds < 0) {
      throw new TypeError('simulatedSeconds must be a non-negative number.');
    }

    const deltaMs = simulatedSeconds * 1000;
    this.currentTimeMs += deltaMs;

    const deliveredInThisStep = [];

    for (const [id, packet] of Array.from(this.inTransitPackets.entries())) {
      if (packet.expectedArrival !== null && this.currentTimeMs >= packet.expectedArrival) {
        const delivered = this.deliverPacket(id, packet.expectedArrival);
        if (delivered) {
          deliveredInThisStep.push(delivered);
        }
      }
    }

    return deliveredInThisStep;
  }

  /**
   * Alias for update() processing in-transit packets.
   */
  processInTransitPackets(simulatedSeconds = 1) {
    return this.update(simulatedSeconds);
  }

  /**
   * Delivers a specific packet that has arrived.
   * @param {string} packetId 
   * @param {number} [arrivalTimeMs] 
   * @returns {Object|null} Delivered packet
   */
  deliverPacket(packetId, arrivalTimeMs) {
    const packet = this.inTransitPackets.get(packetId);
    if (!packet) return null;

    this.inTransitPackets.delete(packetId);
    packet.actualArrival = arrivalTimeMs || this.currentTimeMs;

    // Check packet corruption
    if (this.packetCorruptionRate > 0 && Math.random() < this.packetCorruptionRate) {
      packet.status = PacketStatus.FAILED;
      packet.corrupted = true;
      this.corruptedPackets.push(packet);
      this.emit(ChannelEvent.PACKET_CORRUPTED, packet);
      return null;
    }

    packet.status = PacketStatus.DELIVERED;
    this.deliveredPackets.push(packet);

    this.emit(ChannelEvent.PACKET_DELIVERED, packet);

    // If acknowledgement was requested and packet is not already an ACK:
    if (packet.requiresAcknowledgement && packet.type !== PacketType.ACKNOWLEDGEMENT) {
      const ackPacket = createDTNPacket({
        source: packet.destination,
        destination: packet.source,
        type: PacketType.ACKNOWLEDGEMENT,
        priority: PacketPriority.CRITICAL,
        acknowledgementId: packet.id,
        payload: {
          originalPacketId: packet.id,
          receivedAt: packet.actualArrival
        }
      });

      this.sendPacket(ackPacket);
    }

    // If this is an ACK packet, mark original packet as ACKNOWLEDGED
    if (packet.type === PacketType.ACKNOWLEDGEMENT && packet.acknowledgementId) {
      this.acknowledgePacket(packet);
    }

    return packet;
  }

  /**
   * Marks original packet as ACKNOWLEDGED when an ACK packet arrives back.
   * @param {Object} ackPacket 
   */
  acknowledgePacket(ackPacket) {
    const origId = ackPacket.acknowledgementId;
    if (!origId) return;

    const originalPacket = this.deliveredPackets.find(p => p.id === origId)
      || Array.from(this.inTransitPackets.values()).find(p => p.id === origId);

    if (originalPacket) {
      originalPacket.status = PacketStatus.ACKNOWLEDGED;
      originalPacket.acknowledgementId = ackPacket.id;
      this.emit(ChannelEvent.PACKET_ACKNOWLEDGED, originalPacket);
    }
  }

  /**
   * Retries a packet transmission up to maxRetries limit.
   * @param {string} packetId 
   * @returns {boolean} True if retried, false if maxRetries exceeded
   */
  retryPacket(packetId) {
    let packet = this.deliveredPackets.find(p => p.id === packetId)
      || this.failedPackets.find(p => p.id === packetId)
      || this.getQueuedPackets().find(p => p.id === packetId)
      || this.inTransitPackets.get(packetId);

    if (!packet) {
      throw new Error(`Packet "${packetId}" not found for retry.`);
    }

    if (packet.retryCount < packet.maxRetries) {
      packet.retryCount++;
      packet.status = PacketStatus.CREATED;
      packet.transmissionStart = null;
      packet.expectedArrival = null;
      packet.actualArrival = null;

      this.queue.removePacket(packetId);
      this.inTransitPackets.delete(packetId);
      const indexInFailed = this.failedPackets.findIndex(p => p.id === packetId);
      if (indexInFailed !== -1) this.failedPackets.splice(indexInFailed, 1);

      this.emit(ChannelEvent.PACKET_RETRYING, packet);
      this.sendPacket(packet);
      return true;
    }

    packet.status = PacketStatus.FAILED;
    if (!this.failedPackets.includes(packet)) {
      this.failedPackets.push(packet);
    }
    this.emit(ChannelEvent.PACKET_FAILED, packet);
    return false;
  }

  /**
   * Resets channel to pristine initial state.
   */
  resetCommunicationSystem(startTimeMs) {
    this.queue.clearQueue();
    this.inTransitPackets.clear();
    this.deliveredPackets = [];
    this.failedPackets = [];
    this.corruptedPackets = [];
    this.communicationState = CommunicationState.AVAILABLE;
    this.distanceKm = DistanceScenario.TYPICAL_DISTANCE;
    this.timeMultiplier = TimeMultiplierMode.REALISTIC;
    this.currentTimeMs = startTimeMs || this.initialTimeMs || Date.now();

    this.emit(ChannelEvent.COMMUNICATION_STATE_CHANGED, {
      previousState: null,
      currentState: CommunicationState.AVAILABLE,
      timestamp: this.currentTimeMs
    });
    this.emit(ChannelEvent.QUEUE_UPDATED, { queueSize: 0 });
  }
}
