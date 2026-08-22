/**
 * PRIORITY-BASED DTN TRANSMISSION QUEUE
 * Drains packets in order of priority (CRITICAL > HIGH > NORMAL > LOW), preserving FIFO for equal priority.
 */

export class DTNQueue {
  constructor() {
    this.queue = [];
    this.sequenceCounter = 0;
  }

  /**
   * Enqueues a packet with priority and FIFO preservation.
   * @param {Object} packet 
   */
  enqueuePacket(packet) {
    if (!packet || typeof packet !== 'object' || !packet.id) {
      throw new TypeError('Invalid packet provided for queueing.');
    }

    const queueItem = {
      packet,
      seqNum: ++this.sequenceCounter
    };

    // Insert while maintaining priority order (higher priority first; if equal, lower seqNum first)
    let inserted = false;
    for (let i = 0; i < this.queue.length; i++) {
      const existing = this.queue[i];
      if (packet.priority > existing.packet.priority) {
        this.queue.splice(i, 0, queueItem);
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      this.queue.push(queueItem);
    }
  }

  /**
   * Dequeues the highest-priority, oldest packet in the queue.
   * @returns {Object|null} The dequeued packet or null if empty.
   */
  dequeuePacket() {
    if (this.queue.length === 0) return null;
    const item = this.queue.shift();
    return item.packet;
  }

  /**
   * Peeks at the highest-priority packet without removing it.
   * @returns {Object|null}
   */
  peekQueue() {
    if (this.queue.length === 0) return null;
    return this.queue[0].packet;
  }

  /**
   * Returns current queue size.
   * @returns {number}
   */
  getQueueSize() {
    return this.queue.length;
  }

  /**
   * Returns copy of all queued packets in priority order.
   * @returns {Array<Object>}
   */
  getQueuedPackets() {
    return this.queue.map(item => item.packet);
  }

  /**
   * Removes a specific packet by ID from the queue.
   * @param {string} packetId 
   * @returns {boolean} True if removed
   */
  removePacket(packetId) {
    const index = this.queue.findIndex(item => item.packet.id === packetId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Clears all packets from the queue.
   */
  clearQueue() {
    this.queue = [];
    this.sequenceCounter = 0;
  }
}
