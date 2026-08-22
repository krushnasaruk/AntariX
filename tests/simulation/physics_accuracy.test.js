import assert from 'node:assert';
import { RoverPhysicsEngine, MARS_GRAVITY } from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Objective 4 Physics Accuracy & Physical Energy Model Unit Tests...\n');

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

// TEST 1: Mars gravity constant
runTest(1, 'Verify Mars surface gravity constant is 3.721 m/s^2', () => {
  assert.strictEqual(MARS_GRAVITY, 3.721);
});

// TEST 2: Normal force and total mass calculation
runTest(2, 'Calculate normal force for rover (899kg) + payload (73kg) = 972kg', () => {
  const result = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 10,
    speedMps: 0.5,
    slopeAngleDegrees: 0,
    terrainType: 'FLAT',
    roverMassKg: 899,
    payloadMassKg: 73
  });

  const expectedNormalForce = 972 * 3.721; // ~3616.81 N
  assert.strictEqual(result.totalMassKg, 972);
  assert.ok(Math.abs(result.forces.normalForceN - expectedNormalForce) < 0.1);
});

// TEST 3: Rolling resistance across soft sand vs flat bedrock
runTest(3, 'Verify soft sand rolling resistance is significantly higher than flat bedrock', () => {
  const flatResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 50,
    speedMps: 0.5,
    terrainType: 'FLAT'
  });

  const sandResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 50,
    speedMps: 0.5,
    terrainType: 'SOFT_SAND'
  });

  assert.ok(sandResult.forces.rollingForceN > flatResult.forces.rollingForceN * 4.0);
  assert.ok(sandResult.energyWattHours > flatResult.energyWattHours);
});

// TEST 4: Uphill slope mechanical energy requirement
runTest(4, 'Verify uphill 15 degree slope increases power and energy demand', () => {
  const flatResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 30,
    speedMps: 0.5,
    slopeAngleDegrees: 0
  });

  const slopeResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 30,
    speedMps: 0.5,
    slopeAngleDegrees: 15
  });

  assert.ok(slopeResult.forces.slopeForceN > 0);
  assert.ok(slopeResult.power.slopePowerWatts > 0);
  assert.ok(slopeResult.power.grossPowerWatts > flatResult.power.grossPowerWatts);
});

// TEST 5: Thermal cold penalty below -20C
runTest(5, 'Verify extreme cold (-60C) increases battery internal impedance penalty', () => {
  const warmResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 20,
    speedMps: 0.5,
    externalTempCelsius: 0
  });

  const coldResult = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 20,
    speedMps: 0.5,
    externalTempCelsius: -60
  });

  assert.ok(coldResult.power.grossPowerWatts > warmResult.power.grossPowerWatts);
});

// TEST 6: Solar charging offset reduces net power consumption
runTest(6, 'Solar power generation reduces net energy drain', () => {
  const noSolar = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 20,
    speedMps: 0.5,
    solarPowerWatts: 0
  });

  const withSolar = RoverPhysicsEngine.calculateDetailedEnergy({
    distanceMeters: 20,
    speedMps: 0.5,
    solarPowerWatts: 100
  });

  assert.ok(withSolar.power.netPowerWatts < noSolar.power.netPowerWatts);
  assert.ok(withSolar.energyWattHours < noSolar.energyWattHours);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} PHYSICS ACCURACY TESTS PASSED!\n`);
