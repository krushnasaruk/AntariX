import { ExecutiveDecisionEngine } from '../src/decision-engine/executive.js';

console.log('🧪 Running AI Engine Unit Test Suite...');
const engine = new ExecutiveDecisionEngine();

const safeResult = engine.evaluateCycle({ batteryLevel: 90, wheelSlipRatio: 0.02 });
if (safeResult.action === 'CONTINUE_NOMINAL_EXECUTION') {
  console.log('✅ Nominal evaluation test passed');
} else {
  console.error('❌ Nominal evaluation test failed');
  process.exit(1);
}

const emergencyResult = engine.evaluateCycle({ batteryLevel: 10, wheelSlipRatio: 0.02 });
if (emergencyResult.action === 'ENTER_SAFE_MODE') {
  console.log('✅ Emergency failsafe test passed');
} else {
  console.error('❌ Emergency failsafe test failed');
  process.exit(1);
}
