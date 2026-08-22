import { latencySim } from '../latency/latencySimulator.js';

export class DTNQueueManager {
  constructor() {
    this.uplinkQueue = [];
    this.downlinkQueue = [];
  }

  enqueueUplink(command, onDeliver) {
    const delay = latencySim.getDelayMs();
    const packet = {
      id: 'CMD-' + Date.now(),
      command,
      status: delay > 0 ? 'IN_TRANSMIT' : 'DELIVERED',
      scheduledDelivery: Date.now() + delay,
      delayMs: delay
    };

    this.uplinkQueue.push(packet);

    setTimeout(() => {
      packet.status = 'DELIVERED';
      if (onDeliver) onDeliver(packet);
    }, delay);

    return packet;
  }

  getQueueState() {
    return {
      uplink: this.uplinkQueue,
      downlink: this.downlinkQueue
    };
  }
}

export const dtnQueue = new DTNQueueManager();
