import assert from 'node:assert';
import {
  MarsEnvironment,
  RoverModel,
  TerrainType,
  WeatherState,
  SampleStatus,
  RoverStatus,
  EnvironmentEvent
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Objective 4: Mars Environment & Rover Simulation Unit Tests...\n');

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

let env = new MarsEnvironment();
let rover = new RoverModel();

// TEST 1: Create Crater-07 environment
runTest(1, 'Create Crater-07 environment', () => {
  assert.ok(env);
  const state = env.getEnvironmentState();
  assert.ok(state);
  assert.strictEqual(state.simulationTime, 0);
});

// TEST 2: Verify deterministic starting positions
runTest(2, 'Verify deterministic starting positions', () => {
  assert.deepStrictEqual(env.base.position, { x: 100, y: 100 });
  assert.deepStrictEqual(rover.position, { x: 100, y: 100 });
});

// TEST 3: Verify Mars base exists
runTest(3, 'Verify Mars base (Alpha Outpost) exists', () => {
  assert.strictEqual(env.base.id, 'ALPHA_OUTPOST');
  assert.strictEqual(env.base.name, 'Alpha Outpost Base');
  assert.strictEqual(env.base.radius, 30);
});

// TEST 4: Verify Crater-07 exists
runTest(4, 'Verify Crater-07 region exists', () => {
  assert.strictEqual(env.crater.id, 'CRATER_07');
  assert.deepStrictEqual(env.crater.position, { x: 500, y: 500 });
  assert.strictEqual(env.crater.radius, 180);
});

// TEST 5: Verify geological sample location exists
runTest(5, 'Verify geological sample location exists', () => {
  assert.strictEqual(env.sampleLocation.id, 'SAMPLE_001');
  assert.deepStrictEqual(env.sampleLocation.position, { x: 520, y: 530 });
  assert.strictEqual(env.sampleLocation.status, SampleStatus.UNDISCOVERED);
});

// TEST 6: Verify terrain types
runTest(6, 'Verify terrain types at various coordinates', () => {
  assert.strictEqual(env.getTerrainAt(100, 100), TerrainType.FLAT);
  assert.strictEqual(env.getTerrainAt(500, 500), TerrainType.CRATER);
  assert.strictEqual(env.getTerrainAt(380, 480), TerrainType.SAND);
  assert.strictEqual(env.getTerrainAt(250, 300), TerrainType.ROCKY);
});

// TEST 7: Verify obstacles
runTest(7, 'Verify obstacles definition and bounds', () => {
  assert.strictEqual(env.obstacles.length, 3);
  const rock1 = env.obstacles.find(o => o.id === 'ROCK_001');
  assert.ok(rock1);
  assert.strictEqual(rock1.traversable, false);
  assert.strictEqual(env.isObstacleAt({ x: 250, y: 300 }).id, 'ROCK_001');
});

// TEST 8: Verify hazard regions
runTest(8, 'Verify hazard regions', () => {
  assert.strictEqual(env.hazards.length, 2);
  const h1 = env.hazards.find(h => h.id === 'HAZARD_001');
  assert.strictEqual(h1.type, 'SAND_DUNE');
  assert.strictEqual(h1.active, true);
});

// TEST 9: Create rover
runTest(9, 'Create rover instance', () => {
  assert.ok(rover);
  assert.strictEqual(rover.id, 'ROVER_PERSEVERANCE_2');
  assert.strictEqual(rover.status, RoverStatus.IDLE);
});

// TEST 10: Verify initial battery
runTest(10, 'Verify initial battery level', () => {
  assert.strictEqual(rover.batteryLevel, 0.94);
  assert.strictEqual(rover.batteryCapacity, 1600);
});

// TEST 11: Move rover through valid terrain
runTest(11, 'Move rover through valid terrain (from 100,100 to 120,100)', () => {
  const result = rover.moveRover({ targetPosition: { x: 120, y: 100 } }, env);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.distanceTravelled, 20);
});

// TEST 12: Verify position changes correctly
runTest(12, 'Verify position updated to (120, 100)', () => {
  assert.deepStrictEqual(rover.position, { x: 120, y: 100 });
});

// TEST 13: Verify movement consumes battery
runTest(13, 'Verify movement consumed battery based on terrain multiplier', () => {
  assert.ok(rover.batteryLevel < 0.94);
  assert.strictEqual(rover.batteryLevel, 0.94 - (20 * 1.0 * 0.0005));
});

// TEST 14: Attempt movement through obstacle
runTest(14, 'Attempt movement into obstacle (ROCK_001 at 250,300)', () => {
  const result = rover.moveRover({ targetPosition: { x: 250, y: 300 } }, env);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.reason, 'OBSTACLE_COLLISION');
});

// TEST 15: Verify obstacle blocks movement
runTest(15, 'Verify rover position did not change after obstacle collision', () => {
  assert.deepStrictEqual(rover.position, { x: 120, y: 100 });
});

// TEST 16: Attempt movement with insufficient battery
runTest(16, 'Attempt movement with zero battery', () => {
  const lowBatteryRover = new RoverModel({ batteryLevel: 0.0001 });
  const result = lowBatteryRover.moveRover({ targetPosition: { x: 200, y: 200 } }, env);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.reason, 'INSUFFICIENT_BATTERY');
});

// TEST 17: Verify movement fails safely
runTest(17, 'Verify low battery rover remains at starting position', () => {
  const lowBatteryRover = new RoverModel({ batteryLevel: 0.0001 });
  lowBatteryRover.moveRover({ targetPosition: { x: 200, y: 200 } }, env);
  assert.deepStrictEqual(lowBatteryRover.position, { x: 100, y: 100 });
});

// TEST 18: Generate rover observation
runTest(18, 'Generate RoverObservation structure', () => {
  const obs = rover.getRoverObservation(env);
  assert.ok(obs);
  assert.strictEqual(obs.id, 'ROVER_PERSEVERANCE_2');
  assert.deepStrictEqual(obs.position, { x: 120, y: 100 });
  assert.strictEqual(obs.batteryLevel, rover.batteryLevel);
  assert.strictEqual(obs.terrain, TerrainType.FLAT);
});

// TEST 19: Generate environment observation
runTest(19, 'Generate EnvironmentObservation structure', () => {
  const obs = env.getEnvironmentObservation(rover);
  assert.ok(obs);
  assert.strictEqual(obs.simulationTime, 0);
  assert.strictEqual(obs.weather.state, WeatherState.CLEAR);
  assert.deepStrictEqual(obs.missionLocations.base, { x: 100, y: 100 });
});

// TEST 20: Detect sample
runTest(20, 'Detect geological sample from far distance vs scan range', () => {
  const farResult = rover.detectSample(env);
  assert.strictEqual(farResult.detected, false);

  // Move rover near sample (520, 500 -> ~30m from 520, 530)
  const tempRover = new RoverModel({ position: { x: 520, y: 500 } });
  const nearResult = tempRover.detectSample(env);
  assert.strictEqual(nearResult.detected, true);
  assert.strictEqual(env.sampleLocation.status, SampleStatus.DISCOVERED);
});

// TEST 21: Attempt sample collection from incorrect position
runTest(21, 'Attempt sample collection when rover is outside collection range (>5m)', () => {
  const result = rover.collectSample(env);
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.reason, 'SAMPLE_OUT_OF_RANGE');
});

// TEST 22: Move rover to sample
const sampleRover = new RoverModel({ position: { x: 518, y: 530 } });

// TEST 22: Move rover to sample
runTest(22, 'Move rover directly to sample position (520, 530)', () => {
  assert.strictEqual(env.getDistance(sampleRover.position, env.sampleLocation.position), 2);
});

// TEST 23: Collect sample
runTest(23, 'Collect sample when rover is within range (2m <= 5m)', () => {
  const result = sampleRover.collectSample(env);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.sample.id, 'SAMPLE_001');
  assert.strictEqual(env.sampleLocation.status, SampleStatus.COLLECTED);
});

// TEST 24: Verify sample storage changes
runTest(24, 'Verify sample storage capacity and bag update', () => {
  assert.strictEqual(sampleRover.samplesCollected.length, 1);
  assert.strictEqual(sampleRover.storageUsed, 10);
});

// TEST 25: Verify sample cannot be collected twice
runTest(25, 'Verify sample cannot be collected again once already collected', () => {
  const secondTry = sampleRover.collectSample(env);
  assert.strictEqual(secondTry.success, false);
  assert.strictEqual(secondTry.reason, 'SAMPLE_ALREADY_COLLECTED');
});

// TEST 26: Update deterministic environment
runTest(26, 'Update environment simulation time by 4000 seconds', () => {
  env.updateEnvironment(4000);
  assert.strictEqual(env.simulationTime, 4000);
});

// TEST 27: Verify weather event
runTest(27, 'Verify weather transitioned to DUSTY at t=4000s', () => {
  assert.strictEqual(env.weather.state, WeatherState.DUSTY);
  assert.strictEqual(env.weather.visibility, 50);

  env.updateEnvironment(4000); // t = 8000s -> DUST_STORM
  assert.strictEqual(env.weather.state, WeatherState.DUST_STORM);
  assert.strictEqual(env.weather.visibility, 10);
});

// TEST 28: Verify environment events
runTest(28, 'Verify environment emitted WEATHER_CHANGED events', () => {
  let eventFired = false;
  env.on(EnvironmentEvent.WEATHER_CHANGED, () => { eventFired = true; });

  env.updateEnvironment(3000); // t = 11000s -> CLEAR
  assert.strictEqual(eventFired, true);
  assert.strictEqual(env.weather.state, WeatherState.CLEAR);
});

// TEST 29: Reset environment
runTest(29, 'Reset environment to initial state', () => {
  env.resetEnvironment();
  assert.strictEqual(env.simulationTime, 0);
  assert.strictEqual(env.weather.state, WeatherState.CLEAR);
  assert.strictEqual(env.sampleLocation.status, SampleStatus.UNDISCOVERED);
});

// TEST 30: Verify deterministic reset
runTest(30, 'Verify deterministic reset restores base, crater, sample, obstacles, hazards', () => {
  assert.deepStrictEqual(env.base.position, { x: 100, y: 100 });
  assert.deepStrictEqual(env.crater.position, { x: 500, y: 500 });
  assert.deepStrictEqual(env.sampleLocation.position, { x: 520, y: 530 });
  assert.strictEqual(env.obstacles.length, 3);
  assert.strictEqual(env.hazards.length, 2);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 4 MARS ENVIRONMENT TESTS PASSED CLEANLY!`);
