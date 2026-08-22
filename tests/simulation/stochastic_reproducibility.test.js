import assert from 'node:assert';
import {
  MarsEnvironment,
  RoverModel,
  RoverStatus
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Stochastic Reproducibility Unit Tests...\n');

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

// TEST 1: Same seed produces identical stochastic rover observations
runTest(1, 'Same seed produces bit-for-bit identical stochastic observations', () => {
  const env1 = new MarsEnvironment({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 12345 });
  const rover1 = new RoverModel({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 12345 });

  const env2 = new MarsEnvironment({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 12345 });
  const rover2 = new RoverModel({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 12345 });

  const obs1 = rover1.getRoverObservation(env1);
  const obs2 = rover2.getRoverObservation(env2);

  assert.deepStrictEqual(obs1.estimatedPosition, obs2.estimatedPosition);
  assert.strictEqual(obs1.positionUncertainty.sigmaX, obs2.positionUncertainty.sigmaX);
});

// TEST 2: Different seeds produce distinct stochastic trajectories
runTest(2, 'Different seeds produce distinct stochastic observation values', () => {
  const roverA = new RoverModel({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 100 });
  const roverB = new RoverModel({ mode: 'STOCHASTIC_EXPERIMENT_MODE', seed: 999 });

  const obsA = roverA.getRoverObservation();
  const obsB = roverB.getRoverObservation();

  assert.notDeepStrictEqual(obsA.estimatedPosition, obsB.estimatedPosition);
});

// TEST 3: Deterministic test mode has zero localization noise
runTest(3, 'DETERMINISTIC_TEST_MODE has zero localization noise and perfect belief match', () => {
  const env = new MarsEnvironment({ mode: 'DETERMINISTIC_TEST_MODE', seed: 42 });
  const rover = new RoverModel({ mode: 'DETERMINISTIC_TEST_MODE', seed: 42 });

  const obs = rover.getRoverObservation(env);
  assert.deepStrictEqual(obs.position, obs.estimatedPosition);
  assert.deepStrictEqual(obs.position, obs.groundTruthPosition);
  assert.strictEqual(obs.positionUncertainty.sigmaX, 0.0);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} STOCHASTIC REPRODUCIBILITY TESTS PASSED!\n`);
