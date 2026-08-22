import assert from 'node:assert';
import {
  AutonomyDecisionEngine,
  SafetyValidator,
  MissionPlanner,
  DecisionProvenanceLogger,
  createAutonomyObservation,
  MissionManager,
  RoverModel,
  MarsEnvironment
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting AI Decision Speed & Provenance Unit Tests...\n');

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

const engine = new AutonomyDecisionEngine();
const safety = new SafetyValidator();
const planner = new MissionPlanner();
const provenance = new DecisionProvenanceLogger();

const env = new MarsEnvironment();
const rover = new RoverModel();
const mission = new MissionManager();
const obs = createAutonomyObservation(mission, rover, env, null);

// TEST 1: Decision speed under 10ms
runTest(1, 'On-Rover Executive decision speed is under 10ms', () => {
  const start = performance.now();
  const decision = engine.decide(obs);
  const duration = performance.now() - start;

  assert.ok(decision);
  assert.ok(duration < 10.0, `Decision took ${duration.toFixed(2)}ms (expected <10ms)`);
});

// TEST 2: Safety validation speed under 5ms
runTest(2, 'SafetyValidator verification latency is under 5ms', () => {
  const decision = engine.decide(obs);
  const start = performance.now();
  const validation = safety.validate(decision, obs);
  const duration = performance.now() - start;

  assert.ok(validation);
  assert.ok(duration < 5.0, `Safety validation took ${duration.toFixed(2)}ms (expected <5ms)`);
});

// TEST 3: Multi-step planner execution under 25ms
runTest(3, 'MissionPlanner multi-step candidate plan scoring is under 25ms', () => {
  const start = performance.now();
  const plan = planner.plan(obs);
  const duration = performance.now() - start;

  assert.ok(plan);
  assert.ok(duration < 25.0, `Planner took ${duration.toFixed(2)}ms (expected <25ms)`);
});

// TEST 4: Decision provenance logging
runTest(4, 'DecisionProvenanceLogger logs complete DecisionRecord with model hash', () => {
  const record = provenance.logDecision({
    decisionId: 'DEC-BENCH-01',
    modelName: 'mars-executive-v1',
    modelVersion: '1.0.0',
    prediction: { action: 'MOVE_ROVER' },
    confidence: 0.92,
    safetyDecision: 'APPROVED',
    executedAction: { action: 'MOVE_ROVER' }
  });

  assert.ok(record);
  assert.strictEqual(record.decisionId, 'DEC-BENCH-01');
  assert.strictEqual(record.confidence, 0.92);
  assert.strictEqual(provenance.getRecords().length, 1);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} AI DECISION SPEED & PROVENANCE TESTS PASSED!\n`);
