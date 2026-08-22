import assert from 'node:assert';
import {
  SPEED_OF_LIGHT_M_S,
  DistanceScenario,
  CommunicationState,
  TimeMultiplierMode,
  calculateOneWayDelay,
  calculateRoundTripDelay,
  calculateSignalArrivalTime,
  getDistanceScenario,
  calculateCommunicationMetrics,
  convertSimulatedTime,
  convertRealTimeWait
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Earth–Mars Communication Delay Engine Unit Tests...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ TEST ${totalTests}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ TEST ${totalTests}: ${description}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

// 1. Zero distance test
runTest('Zero distance produces exactly 0 latency', () => {
  const oneWay = calculateOneWayDelay(0);
  const roundTrip = calculateRoundTripDelay(0);
  const metrics = calculateCommunicationMetrics(0);

  assert.strictEqual(oneWay, 0);
  assert.strictEqual(roundTrip, 0);
  assert.strictEqual(metrics.oneWayDelaySeconds, 0);
  assert.strictEqual(metrics.roundTripDelaySeconds, 0);
  assert.strictEqual(metrics.formattedOneWay, '0.00 seconds');
});

// 2. Closest Earth-Mars distance
runTest('Closest Earth–Mars distance (~54.6M km) yields ~3.03 minutes one-way delay', () => {
  const distance = getDistanceScenario('CLOSEST_APPROACH');
  assert.strictEqual(distance, 54600000);

  const delaySeconds = calculateOneWayDelay(distance);
  const expectedSeconds = (54600000 * 1000) / SPEED_OF_LIGHT_M_S; // ~182.126 s
  assert.strictEqual(delaySeconds, expectedSeconds);

  const delayMinutes = delaySeconds / 60;
  assert.ok(delayMinutes > 3.0 && delayMinutes < 3.1, `Expected ~3.03 min, got ${delayMinutes}`);

  const metrics = calculateCommunicationMetrics(distance);
  assert.strictEqual(metrics.formattedOneWay, '3.04 minutes');
});

// 3. Typical Earth-Mars distance
runTest('Typical Earth–Mars distance (~225M km) yields ~12.5 minutes one-way delay', () => {
  const distance = getDistanceScenario('TYPICAL_DISTANCE');
  assert.strictEqual(distance, 225000000);

  const delaySeconds = calculateOneWayDelay(distance);
  const expectedSeconds = (225000000 * 1000) / SPEED_OF_LIGHT_M_S; // ~750.519 s
  assert.strictEqual(delaySeconds, expectedSeconds);

  const delayMinutes = delaySeconds / 60;
  assert.ok(delayMinutes > 12.4 && delayMinutes < 12.6, `Expected ~12.5 min, got ${delayMinutes}`);

  const metrics = calculateCommunicationMetrics(distance);
  assert.strictEqual(metrics.formattedOneWay, '12.51 minutes');
});

// 4. Farthest Earth-Mars distance
runTest('Farthest Earth–Mars distance (~401M km) yields ~22.29 minutes one-way delay', () => {
  const distance = getDistanceScenario('FARTHEST_DISTANCE');
  assert.strictEqual(distance, 401000000);

  const delaySeconds = calculateOneWayDelay(distance);
  const expectedSeconds = (401000000 * 1000) / SPEED_OF_LIGHT_M_S; // ~1337.59 s
  assert.strictEqual(delaySeconds, expectedSeconds);

  const delayMinutes = delaySeconds / 60;
  assert.ok(delayMinutes > 22.2 && delayMinutes < 22.4, `Expected ~22.29 min, got ${delayMinutes}`);

  const metrics = calculateCommunicationMetrics(distance);
  assert.strictEqual(metrics.formattedOneWay, '22.29 minutes');
});

// 5. Round-trip calculation
runTest('Round-trip delay is exactly double the one-way delay', () => {
  const distance = 225000000;
  const oneWay = calculateOneWayDelay(distance);
  const roundTrip = calculateRoundTripDelay(distance);
  assert.strictEqual(roundTrip, oneWay * 2);

  const metrics = calculateCommunicationMetrics(distance);
  assert.strictEqual(metrics.roundTripDelaySeconds, metrics.oneWayDelaySeconds * 2);
  assert.strictEqual(metrics.formattedRoundTrip, '25.02 minutes');
});

// 6. Arbitrary distance
runTest('Arbitrary distance calculation (e.g. 150M km)', () => {
  const customDistance = 150000000;
  const oneWay = calculateOneWayDelay(customDistance);
  const expected = (150000000 * 1000) / SPEED_OF_LIGHT_M_S; // ~500.346 s
  assert.strictEqual(oneWay, expected);

  const metrics = calculateCommunicationMetrics(customDistance);
  assert.strictEqual(metrics.distanceKm, 150000000);
  assert.strictEqual(metrics.distanceMeters, 150000000000);
  assert.strictEqual(metrics.formattedOneWay, '8.34 minutes');
});

// 7. Invalid distance handling
runTest('Rejects invalid input (negative, NaN, non-numeric, null, undefined, Infinity)', () => {
  assert.throws(() => calculateOneWayDelay(-500), RangeError);
  assert.throws(() => calculateOneWayDelay(NaN), TypeError);
  assert.throws(() => calculateOneWayDelay('invalid'), TypeError);
  assert.throws(() => calculateOneWayDelay(null), TypeError);
  assert.throws(() => calculateOneWayDelay(undefined), TypeError);
  assert.throws(() => calculateOneWayDelay(Infinity), TypeError);
  assert.throws(() => getDistanceScenario('NON_EXISTENT'), Error);
});

// 8. Demo time multiplier
runTest('Demo time multiplier (60x) accelerates 12.5 minute delay to 12.5 real seconds', () => {
  const realSeconds = 1;
  const simulatedSeconds = convertSimulatedTime(realSeconds, TimeMultiplierMode.DEMO);
  assert.strictEqual(simulatedSeconds, 60);

  const delaySeconds = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE); // ~750.519 s
  const realWaitTime = convertRealTimeWait(delaySeconds, TimeMultiplierMode.DEMO);
  const expectedWaitTime = delaySeconds / 60; // ~12.508 s
  assert.strictEqual(realWaitTime, expectedWaitTime);
});

// 9. Realistic time multiplier
runTest('Realistic time multiplier (1x) maps real time directly to simulated time', () => {
  const realSeconds = 15;
  const simulatedSeconds = convertSimulatedTime(realSeconds, TimeMultiplierMode.REALISTIC);
  assert.strictEqual(simulatedSeconds, 15);

  const delaySeconds = calculateOneWayDelay(DistanceScenario.TYPICAL_DISTANCE);
  const realWaitTime = convertRealTimeWait(delaySeconds, TimeMultiplierMode.REALISTIC);
  assert.strictEqual(realWaitTime, delaySeconds);
});

// 10. Signal arrival time
runTest('Calculates expected signal arrival epoch timestamp accurately', () => {
  const transmissionTime = 1700000000000;
  const distance = 225000000;
  const oneWaySeconds = calculateOneWayDelay(distance);
  const expectedArrival = transmissionTime + (oneWaySeconds * 1000);

  const calculatedArrival = calculateSignalArrivalTime(distance, transmissionTime);
  assert.strictEqual(calculatedArrival, expectedArrival);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} EARTH-MARS COMMUNICATION DELAY TESTS PASSED!`);
