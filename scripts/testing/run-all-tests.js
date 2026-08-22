import { execSync } from 'child_process';

console.log('🧪 Running Monorepo Full Verification Test Suite...');
const tests = [
  'node apps/backend/tests/latency.test.js',
  'node apps/ai-engine/tests/aiEngine.test.js',
  'node tests/integration/backend_frontend.test.js',
  'node tests/end-to-end/mission_flow.spec.js',
  'node tests/communication/packet_loss.test.js',
  'node tests/communication/communication_delay.test.js',
  'node tests/communication/dtn_communication_system.test.js',
  'node tests/communication/contact_windows.test.js',
  'node tests/ai/decision_speed.test.js',
  'node tests/simulation/physics_accuracy.test.js',
  'node tests/simulation/stochastic_reproducibility.test.js',
  'node tests/simulation/uncertainty_model.test.js',
  'node tests/simulation/mission_execution.test.js',
  'node tests/simulation/mars_environment.test.js',
  'node tests/simulation/autonomy_decision.test.js',
  'node tests/simulation/autonomous_planning.test.js',
  'node tests/simulation/mission_intelligence.test.js',
  'node scripts/benchmarking/run-policy-benchmark.js',
  'python -m pytest services/ai-engine/tests',
  'node tests/integration/python_ai_service.test.js',
  'node tests/integration/python_learning_service.test.js',
  'python -m pytest services/digital-twin/tests',
  'node tests/integration/digital_twin.test.js',
  'node tests/integration/dataset_generation.test.js',
  'python -m pytest services/ml-engine/tests',
  'node tests/integration/ml_training_service.test.js',
  'python -m pytest services/training-engine/tests',
  'node tests/integration/training_service.test.js',
  'node tests/integration/frontend_real_data_contracts.test.js'
];

let failed = false;
for (const test of tests) {
  try {
    execSync(test, { stdio: 'inherit' });
  } catch (e) {
    console.error(`❌ Test failed: ${test}`);
    failed = true;
  }
}

if (!failed) {
  console.log('\n🎉 ALL MONOREPO INTEGRATION TESTS PASSED CLEANLY!');
  process.exit(0);
} else {
  process.exit(1);
}
