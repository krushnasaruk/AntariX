import assert from 'node:assert';
import {
  DTNCommunicationChannel,
  CommunicationState,
  PacketPriority
} from '../../packages/communication-protocol/index.js';
import {
  EarthGuidanceManager,
  GuidanceStatus,
  ActionType
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Communication Contact Windows & Earth Guidance Unit Tests...\n');

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

// TEST 1: Contact window registration & query
runTest(1, 'Register and query active contact window', () => {
  const channel = new DTNCommunicationChannel();
  channel.addContactWindow({
    startTime: 100,
    endTime: 500,
    bandwidthKbps: 512.0,
    linkQuality: 0.95
  });

  const closedWin = channel.getCurrentContactWindow(50);
  assert.strictEqual(closedWin.isOpen, false);

  const openWin = channel.getCurrentContactWindow(200);
  assert.strictEqual(openWin.isOpen, true);
  assert.strictEqual(openWin.bandwidthKbps, 512.0);
  assert.strictEqual(openWin.linkQuality, 0.95);
});

// TEST 2: Packet corruption detection
runTest(2, 'Detect packet corruption when channel has corruption rate', () => {
  const channel = new DTNCommunicationChannel({ packetCorruptionRate: 1.0 });
  channel.sendPacket({
    source: 'EARTH',
    destination: 'MARS',
    payload: { cmd: 'TEST' }
  });

  // Advance time past delay
  channel.update(2000);
  assert.strictEqual(channel.corruptedPackets.length, 1);
  assert.strictEqual(channel.deliveredPackets.length, 0);
});

// TEST 3: Earth guidance request creation
runTest(3, 'EarthGuidanceManager creates formal request with deadline', () => {
  const manager = new EarthGuidanceManager({ timeoutSeconds: 3600 });
  const req = manager.requestGuidance({
    missionId: 'MARS_01',
    requestedDecision: 'RESOLVE_BOULDER_OBSTACLE',
    reason: 'PATH_BLOCKED',
    confidence: 0.35,
    currentTimeMs: 100000
  });

  assert.ok(req);
  assert.strictEqual(req.status, GuidanceStatus.PENDING);
  assert.strictEqual(req.decisionDeadline, 100000 + (3600 * 1000));
});

// TEST 4: Earth guidance timeout triggers safe fallback to prevent deadlock
runTest(4, 'Earth guidance timeout triggers deterministic safe fallback', () => {
  const manager = new EarthGuidanceManager({ timeoutSeconds: 100 });
  const req = manager.requestGuidance({
    guidanceRequestId: 'REQ-TIMEOUT-TEST',
    currentTimeMs: 0,
    decisionDeadline: 100000,
    fallbackAction: { action: ActionType.RETURN_TO_BASE }
  });

  // Check before deadline
  const pendingRes = manager.evaluateRequest('REQ-TIMEOUT-TEST', 50000);
  assert.strictEqual(pendingRes.resolved, false);

  // Check after deadline (timeout)
  const timeoutRes = manager.evaluateRequest('REQ-TIMEOUT-TEST', 150000);
  assert.strictEqual(timeoutRes.resolved, true);
  assert.strictEqual(timeoutRes.status, GuidanceStatus.TIMED_OUT);
  assert.strictEqual(timeoutRes.action.action, ActionType.RETURN_TO_BASE);
  assert.strictEqual(timeoutRes.fallbackTriggered, true);
});

// TEST 5: Earth response arrival before deadline executes Earth command
runTest(5, 'Earth response received before deadline executes Earth command', () => {
  const manager = new EarthGuidanceManager({ timeoutSeconds: 3600 });
  const req = manager.requestGuidance({
    guidanceRequestId: 'REQ-EARTH-CMD',
    currentTimeMs: 0,
    decisionDeadline: 3600000
  });

  manager.receiveEarthResponse('REQ-EARTH-CMD', { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 500, y: 500 } } });

  const res = manager.evaluateRequest('REQ-EARTH-CMD', 1000);
  assert.strictEqual(res.resolved, true);
  assert.strictEqual(res.status, GuidanceStatus.RESPONSE_RECEIVED);
  assert.strictEqual(res.action.action, ActionType.MOVE_ROVER);
  assert.strictEqual(res.fromEarth, true);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} CONTACT WINDOWS & GUIDANCE TESTS PASSED!\n`);
