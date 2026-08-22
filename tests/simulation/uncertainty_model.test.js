import assert from 'node:assert';
import {
  UncertainValue,
  WorldState,
  MissionPredictionEngine
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Uncertainty & Belief State Unit Tests...\n');

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

// TEST 1: UncertainValue bounds and confidence calculation
runTest(1, 'UncertainValue calculates correct 95% confidence bounds and variance', () => {
  const uv = new UncertainValue(100.0, 5.0, 0.95, 'meters');
  assert.strictEqual(uv.mean, 100.0);
  assert.strictEqual(uv.standardDeviation, 5.0);
  assert.strictEqual(uv.variance, 25.0);
  assert.strictEqual(uv.confidence, 0.95);

  const bounds = uv.getBounds(1.96);
  assert.strictEqual(bounds.lower, 100.0 - 1.96 * 5.0);
  assert.strictEqual(bounds.upper, 100.0 + 1.96 * 5.0);
});

// TEST 2: WorldState instantiates with BeliefState and UncertaintyState
runTest(2, 'WorldState contains formal BeliefState and UncertaintyState', () => {
  const ws = new WorldState({
    roverState: { position: { x: 500, y: 500 }, battery: 0.85 },
    beliefState: {
      estimatedPosition: { x: 498.5, y: 501.2 },
      positionUncertainty: { sigmaX: 1.5, sigmaY: 1.5, confidence: 0.90 }
    }
  });

  assert.deepStrictEqual(ws.roverState.position, { x: 500, y: 500 });
  assert.deepStrictEqual(ws.beliefState.groundTruthPosition, { x: 500, y: 500 });
  assert.deepStrictEqual(ws.beliefState.estimatedPosition, { x: 498.5, y: 501.2 });
  assert.strictEqual(ws.beliefState.positionUncertainty.sigmaX, 1.5);
  assert.ok(ws.uncertaintyState.battery);
});

// TEST 3: MissionPredictionEngine returns predictions with uncertainty
runTest(3, 'MissionPredictionEngine attaches uncertainty and confidence to predictions', () => {
  const engine = new MissionPredictionEngine();
  const obs = {
    rover: { batteryLevel: 0.90 },
    environment: { simulationTime: 100, weather: { state: 'CLEAR' } },
    communication: { distanceKm: 225000000, communicationState: 'AVAILABLE' }
  };

  const preds = engine.predict(obs, 600);
  assert.ok(preds.battery.uncertainty);
  assert.strictEqual(preds.battery.confidence, 0.90);
  assert.ok(preds.weather.uncertainty);
  assert.ok(preds.communication.uncertainty);
  assert.ok(preds.mission.uncertainty);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} UNCERTAINTY MODEL TESTS PASSED!\n`);
