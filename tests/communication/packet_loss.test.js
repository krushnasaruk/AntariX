import assert from 'node:assert';
import {
  DTNCommunicationChannel,
  CommunicationState,
  PacketStatus
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 2 Packet Loss & Corruption Unit Tests...\n');

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

// TEST 1: Channel packet transmission under zero loss
runTest(1, 'Deliver packets reliably when packet loss is 0%', () => {
  const channel = new DTNCommunicationChannel({ distanceKm: 225000000, packetLossRate: 0.0 });
  const packet = channel.sendPacket({
    source: 'EARTH',
    destination: 'MARS',
    payload: { command: 'START_SURVEY' }
  });

  assert.ok(packet);
  assert.strictEqual(packet.status, PacketStatus.IN_TRANSIT);

  // Advance time past delay (750s)
  const delivered = channel.update(1000);
  assert.strictEqual(delivered.length, 1);
  assert.strictEqual(delivered[0].id, packet.id);
});

// TEST 2: Packet corruption detection
runTest(2, 'Detect CRC/packet corruption when corruption rate is active', () => {
  const channel = new DTNCommunicationChannel({ distanceKm: 54600000, packetCorruptionRate: 1.0 });
  channel.sendPacket({
    id: 'PKT-CORRUPT-TEST',
    source: 'EARTH',
    destination: 'MARS',
    payload: { command: 'SAMPLE' }
  });

  channel.update(500);
  assert.strictEqual(channel.corruptedPackets.length, 1);
  assert.strictEqual(channel.deliveredPackets.length, 0);
});

// TEST 3: Retry mechanism for dropped or failed packets
runTest(3, 'Retry failed packet up to maxRetries threshold', () => {
  const channel = new DTNCommunicationChannel({ distanceKm: 54600000 });
  const packet = channel.sendPacket({
    id: 'PKT-RETRY-TEST',
    source: 'MARS',
    destination: 'EARTH',
    payload: { telemetry: 'BATTERY_OK' },
    maxRetries: 2
  });

  // Force fail and retry
  channel.failedPackets.push(packet);
  const retried = channel.retryPacket('PKT-RETRY-TEST');
  assert.strictEqual(retried, true);
  assert.strictEqual(packet.retryCount, 1);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} PACKET LOSS & CORRUPTION TESTS PASSED!\n`);
