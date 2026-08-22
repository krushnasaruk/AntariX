import assert from 'node:assert';
import {
  DTNCommunicationChannel,
  createDTNPacket,
  PacketStatus,
  PacketType,
  PacketPriority,
  Endpoint,
  CommunicationState,
  DistanceScenario,
  TimeMultiplierMode,
  calculateOneWayDelay,
  calculateRoundTripDelay,
  convertSimulatedTime,
  convertRealTimeWait,
  ChannelEvent
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 2: Delay-Tolerant Communication System Unit Tests...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(num, description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ TEST ${num}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ TEST ${num}: ${description}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

// Instantiate channel
const channel = new DTNCommunicationChannel({
  distanceKm: DistanceScenario.TYPICAL_DISTANCE,
  timeMultiplier: TimeMultiplierMode.REALISTIC,
  startTimeMs: 1700000000000
});

// TEST 1: Create valid packet
runTest(1, 'Create valid DTN packet with schema validation', () => {
  const pkt = createDTNPacket({
    source: Endpoint.EARTH,
    destination: Endpoint.MARS,
    type: PacketType.COMMAND,
    priority: PacketPriority.HIGH,
    payload: { action: 'DRILL_SAMPLE' }
  });

  assert.ok(pkt.id.startsWith('PKT-'));
  assert.strictEqual(pkt.source, 'EARTH');
  assert.strictEqual(pkt.destination, 'MARS');
  assert.strictEqual(pkt.type, 'COMMAND');
  assert.strictEqual(pkt.priority, PacketPriority.HIGH);
  assert.strictEqual(pkt.status, PacketStatus.CREATED);
});

// TEST 2: Send packet while communication is AVAILABLE
runTest(2, 'Send packet while channel is AVAILABLE', () => {
  channel.resetCommunicationSystem();
  const pkt = channel.sendPacket({
    source: Endpoint.EARTH,
    destination: Endpoint.MARS,
    type: PacketType.COMMAND,
    payload: { cmd: 'NAVIGATE' }
  });

  assert.ok(pkt.id);
  assert.strictEqual(channel.getCommunicationState(), CommunicationState.AVAILABLE);
});

// TEST 3: Verify packet enters IN_TRANSIT
runTest(3, 'Verify packet transitions to IN_TRANSIT', () => {
  const inTransit = channel.getInTransitPackets();
  assert.strictEqual(inTransit.length, 1);
  assert.strictEqual(inTransit[0].status, PacketStatus.IN_TRANSIT);
  assert.strictEqual(inTransit[0].transmissionStart, 1700000000000);
});

// TEST 4: Verify expected arrival is based on Objective 1 latency engine
runTest(4, 'Verify expected arrival timestamp derives strictly from Objective 1 delay engine', () => {
  const inTransit = channel.getInTransitPackets()[0];
  const expectedOneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE); // ~750.519 s
  const expectedArrivalMs = 1700000000000 + (expectedOneWaySec * 1000);

  assert.strictEqual(inTransit.expectedArrival, expectedArrivalMs);
});

// TEST 5: Verify packet is delivered after simulated delay
runTest(5, 'Verify packet is delivered after physical delay elapses', () => {
  const oneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE);
  
  // Advance time less than delay -> not yet delivered
  channel.update(oneWaySec - 10);
  assert.strictEqual(channel.getDeliveredPackets().length, 0);

  // Advance remaining time -> delivered!
  channel.update(15);
  const delivered = channel.getDeliveredPackets();
  assert.strictEqual(delivered.length, 1);
  assert.strictEqual(delivered[0].status, PacketStatus.DELIVERED);
});

// TEST 6: Verify acknowledgement travels back to Earth
runTest(6, 'Send packet requesting ACK and verify ACK is generated', () => {
  channel.resetCommunicationSystem();
  const pkt = channel.sendPacket({
    source: Endpoint.EARTH,
    destination: Endpoint.MARS,
    type: PacketType.COMMAND,
    requiresAcknowledgement: true,
    payload: { cmd: 'GET_TELEMETRY' }
  });

  const oneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE);
  // Advance time so original command arrives at Mars
  channel.update(oneWaySec + 1);

  // Command should be delivered, and ACK should now be IN_TRANSIT back to Earth
  const delivered = channel.getDeliveredPackets();
  assert.strictEqual(delivered.length, 1);
  assert.strictEqual(delivered[0].id, pkt.id);

  const inTransit = channel.getInTransitPackets();
  assert.strictEqual(inTransit.length, 1);
  assert.strictEqual(inTransit[0].type, PacketType.ACKNOWLEDGEMENT);
  assert.strictEqual(inTransit[0].source, Endpoint.MARS);
  assert.strictEqual(inTransit[0].destination, Endpoint.EARTH);
});

// TEST 7: Verify acknowledgement experiences the same physical delay
runTest(7, 'Verify ACK packet experiences identical physical speed-of-light delay', () => {
  const ackInTransit = channel.getInTransitPackets()[0];
  const oneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE);
  
  // Advance time until ACK arrives back at Earth
  channel.update(oneWaySec + 1);

  const delivered = channel.getDeliveredPackets();
  const ackDelivered = delivered.find(p => p.type === PacketType.ACKNOWLEDGEMENT);
  assert.ok(ackDelivered);
  assert.strictEqual(ackDelivered.status, PacketStatus.DELIVERED);

  // Check that original packet status is updated to ACKNOWLEDGED
  const origPkt = delivered.find(p => p.id !== ackDelivered.id);
  assert.strictEqual(origPkt.status, PacketStatus.ACKNOWLEDGED);
});

// TEST 8: Send packet during BLACKOUT
runTest(8, 'Set channel state to BLACKOUT and send packet', () => {
  channel.resetCommunicationSystem();
  channel.setCommunicationState(CommunicationState.BLACKOUT);
  assert.strictEqual(channel.getCommunicationState(), CommunicationState.BLACKOUT);

  const pkt = channel.sendPacket({
    source: Endpoint.EARTH,
    destination: Endpoint.MARS,
    type: PacketType.ALERT,
    payload: { alert: 'SOLAR_CONJUNCTION' }
  });

  assert.strictEqual(pkt.status, PacketStatus.BLOCKED);
});

// TEST 9: Verify packet enters queue
runTest(9, 'Verify blocked packet is stored in local transmission queue', () => {
  const queued = channel.getQueuedPackets();
  assert.strictEqual(queued.length, 1);
  assert.strictEqual(queued[0].status, PacketStatus.BLOCKED);
  assert.strictEqual(channel.getInTransitPackets().length, 0);
});

// TEST 10: Restore communication
runTest(10, 'Set channel state back to AVAILABLE', () => {
  channel.setCommunicationState(CommunicationState.AVAILABLE);
  assert.strictEqual(channel.getCommunicationState(), CommunicationState.AVAILABLE);
});

// TEST 11: Verify queued packet is transmitted
runTest(11, 'Verify queued packet is automatically transmitted upon communication restoration', () => {
  assert.strictEqual(channel.getQueuedPackets().length, 0);
  const inTransit = channel.getInTransitPackets();
  assert.strictEqual(inTransit.length, 1);
  assert.strictEqual(inTransit[0].type, PacketType.ALERT);
});

// TEST 12: Verify packet priority
runTest(12, 'Verify CRITICAL priority packets are dequeued before NORMAL and LOW priority', () => {
  channel.resetCommunicationSystem();
  channel.setCommunicationState(CommunicationState.BLACKOUT);

  const lowPkt = channel.sendPacket({ type: PacketType.TELEMETRY, priority: PacketPriority.LOW, payload: 'low' });
  const criticalPkt = channel.sendPacket({ type: PacketType.ALERT, priority: PacketPriority.CRITICAL, payload: 'crit' });
  const normalPkt = channel.sendPacket({ type: PacketType.COMMAND, priority: PacketPriority.NORMAL, payload: 'norm' });

  const queued = channel.getQueuedPackets();
  assert.strictEqual(queued[0].id, criticalPkt.id);
  assert.strictEqual(queued[1].id, normalPkt.id);
  assert.strictEqual(queued[2].id, lowPkt.id);
});

// TEST 13: Verify FIFO ordering for equal priority
runTest(13, 'Verify FIFO ordering is preserved for packets with identical priority', () => {
  channel.resetCommunicationSystem();
  channel.setCommunicationState(CommunicationState.BLACKOUT);

  const p1 = channel.sendPacket({ type: PacketType.COMMAND, priority: PacketPriority.HIGH, payload: 'p1' });
  const p2 = channel.sendPacket({ type: PacketType.COMMAND, priority: PacketPriority.HIGH, payload: 'p2' });
  const p3 = channel.sendPacket({ type: PacketType.COMMAND, priority: PacketPriority.HIGH, payload: 'p3' });

  const queued = channel.getQueuedPackets();
  assert.strictEqual(queued[0].id, p1.id);
  assert.strictEqual(queued[1].id, p2.id);
  assert.strictEqual(queued[2].id, p3.id);
});

// TEST 14: Verify failed packet retry
runTest(14, 'Verify packet retry increments retryCount and re-queues packet', () => {
  channel.resetCommunicationSystem();
  const pkt = channel.sendPacket({ payload: 'retry_test', maxRetries: 2 });
  
  const success = channel.retryPacket(pkt.id);
  assert.strictEqual(success, true);
  assert.strictEqual(pkt.retryCount, 1);
});

// TEST 15: Verify maximum retry limit
runTest(15, 'Verify retry failing after exceeding maxRetries marks packet FAILED', () => {
  const queued = channel.getQueuedPackets()[0] || channel.getInTransitPackets()[0];
  const pktId = queued.id;

  // Perform retries up to limit
  channel.retryPacket(pktId); // retryCount = 2 (max = 2)
  const success = channel.retryPacket(pktId); // exceeds limit

  assert.strictEqual(success, false);
  const failed = channel.getFailedPackets();
  assert.ok(failed.some(p => p.id === pktId));
});

// TEST 16: Verify packets are never silently lost
runTest(16, 'Verify store-and-forward integrity: zero lost packets during state transitions', () => {
  channel.resetCommunicationSystem();
  channel.setCommunicationState(CommunicationState.BLACKOUT);

  for (let i = 0; i < 5; i++) {
    channel.sendPacket({ payload: `data_${i}` });
  }

  assert.strictEqual(channel.getQueuedPackets().length, 5);
  channel.setCommunicationState(CommunicationState.AVAILABLE);

  // Drained from queue, now all 5 in transit
  assert.strictEqual(channel.getQueuedPackets().length, 0);
  assert.strictEqual(channel.getInTransitPackets().length, 5);
});

// TEST 17: Verify communication state events
runTest(17, 'Verify event emitter notifies on communication state change', () => {
  let eventFired = false;
  let receivedState = null;

  const unsubscribe = channel.on(ChannelEvent.COMMUNICATION_STATE_CHANGED, (evt) => {
    eventFired = true;
    receivedState = evt.currentState;
  });

  channel.setCommunicationState(CommunicationState.RESTORING);
  assert.strictEqual(eventFired, true);
  assert.strictEqual(receivedState, CommunicationState.RESTORING);

  unsubscribe();
});

// TEST 18: Verify DEMO MODE accelerates transmission correctly
runTest(18, 'Verify DEMO MODE (60x) time conversion helper calculations', () => {
  const oneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE); // ~750.519 s
  const simulatedTimeSec = convertSimulatedTime(1, TimeMultiplierMode.DEMO);
  assert.strictEqual(simulatedTimeSec, 60);

  const realWaitTimeSec = convertRealTimeWait(oneWaySec, TimeMultiplierMode.DEMO); // ~12.508 s
  assert.strictEqual(realWaitTimeSec, oneWaySec / 60);
});

// TEST 19: Verify REALISTIC MODE preserves physical delay
runTest(19, 'Verify REALISTIC MODE (1x) time conversion maps 1:1', () => {
  const oneWaySec = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE);
  const simulatedTimeSec = convertSimulatedTime(1, TimeMultiplierMode.REALISTIC);
  assert.strictEqual(simulatedTimeSec, 1);

  const realWaitTimeSec = convertRealTimeWait(oneWaySec, TimeMultiplierMode.REALISTIC);
  assert.strictEqual(realWaitTimeSec, oneWaySec);
});

// TEST 20: Reset communication system and verify clean state
runTest(20, 'Reset communication system and confirm pristine initial state', () => {
  channel.resetCommunicationSystem();

  assert.strictEqual(channel.getCommunicationState(), CommunicationState.AVAILABLE);
  assert.strictEqual(channel.getDistanceKm(), DistanceScenario.TYPICAL_DISTANCE);
  assert.strictEqual(channel.getTimeMultiplier(), TimeMultiplierMode.REALISTIC);
  assert.strictEqual(channel.getQueuedPackets().length, 0);
  assert.strictEqual(channel.getInTransitPackets().length, 0);
  assert.strictEqual(channel.getDeliveredPackets().length, 0);
  assert.strictEqual(channel.getFailedPackets().length, 0);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 2 DTN COMMUNICATION TESTS PASSED CLEANLY!`);
