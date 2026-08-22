import assert from 'node:assert';
import { spawn, execSync } from 'node:child_process';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  PythonIntelligenceAdapter,
  MissionPlanner,
  SafetyValidator,
  ActionType
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Python AI Service & Safety Boundary Integration Test...\n');

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

async function runAsyncTest(num, description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ TEST ${num}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ TEST ${num}: ${description}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  // 1. Synchronous / Fallback tests
  runTest(1, 'PythonIntelligenceAdapter instantiates with default service URL', () => {
    const adapter = new PythonIntelligenceAdapter();
    assert.ok(adapter);
    assert.strictEqual(adapter.serviceUrl, 'http://localhost:8000');
  });

  await runAsyncTest(2, 'PythonIntelligenceAdapter falls back to JS engine when service is offline', async () => {
    const adapter = new PythonIntelligenceAdapter({ serviceUrl: 'http://localhost:9999' });
    const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);

    const report = await adapter.generateReportAsync(obs);
    assert.ok(report);
    assert.strictEqual(report.riskAssessment.overallRisk, 'HIGH');
    assert.strictEqual(report.recommendedActions[0], 'REPLAN');
  });

  // 2. Launch live Python service on port 8008 to test HTTP REST API
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8008'], {
    cwd: 'services/ai-engine',
    stdio: 'ignore'
  });

  // Wait for server startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    await runAsyncTest(3, 'Live Python AI Service accepts POST /analyze and returns report', async () => {
      const adapter = new PythonIntelligenceAdapter({ serviceUrl: 'http://127.0.0.1:8008' });
      const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);

      const report = await adapter.generateReportAsync(obs);
      assert.ok(report);
      assert.strictEqual(report.missionId, 'MISSION-CRATER-07');
      assert.strictEqual(report.riskAssessment.overallRisk, 'HIGH');
      assert.strictEqual(report.plannerRecommendation.recommendedAction, 'REPLAN');
    });

    await runAsyncTest(4, 'Python AI recommendation feeds into Objective 6 Planner & Objective 5 SafetyValidator', async () => {
      const adapter = new PythonIntelligenceAdapter({ serviceUrl: 'http://127.0.0.1:8008' });
      const planner = new MissionPlanner();
      const validator = new SafetyValidator();

      // Rover near obstacle at (250, 300)
      const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 240, y: 300 }, batteryLevel: 0.12 }), new MarsEnvironment(), null);

      const report = await adapter.generateReportAsync(obs);
      assert.strictEqual(report.recommendedActions[0], 'REPLAN');

      // Objective 6 recomputes plan
      const plan = planner.replan(obs, null, report.explanation.description);
      assert.ok(plan);

      // Objective 5 SafetyValidator validates candidate step
      const unsafeAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 250, y: 300 } } };
      const validation = validator.validate(unsafeAction, obs);

      // Unsafe action is rejected by Objective 5 SafetyValidator
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.decision.action, ActionType.WAIT);
    });
  } finally {
    try {
      if (pythonProc && pythonProc.pid) {
        execSync(`taskkill /pid ${pythonProc.pid} /T /F`, { stdio: 'ignore' });
      }
    } catch (_) {
      try { pythonProc.kill(); } catch (_) {}
    }
  }

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} PYTHON AI SERVICE INTEGRATION TESTS PASSED CLEANLY!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
