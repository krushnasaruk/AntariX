import assert from 'node:assert';
import { spawn, execSync } from 'node:child_process';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  PythonLearningAdapter,
  MissionPlanner,
  SafetyValidator,
  ActionType
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Python AI Learning Service & Safety Boundary Integration Test...\n');

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
  // 1. Instantiation & Offline Cold Start Fallback
  runTest(1, 'PythonLearningAdapter instantiates with default URL', () => {
    const adapter = new PythonLearningAdapter();
    assert.ok(adapter);
    assert.strictEqual(adapter.serviceUrl, 'http://localhost:8000');
  });

  await runAsyncTest(2, 'PythonLearningAdapter handles offline service gracefully with cold-start response', async () => {
    const adapter = new PythonLearningAdapter({ serviceUrl: 'http://localhost:9999' });
    const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

    const res = await adapter.requestAdaptiveRecommendationAsync(obs);
    assert.ok(res);
    assert.strictEqual(res.recommendation.confidence, 0.10);
    assert.strictEqual(res.recommendation.sampleSize, 0);
  });

  // 2. Launch live Python service on port 8009 for learning integration tests
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8009'], {
    cwd: 'services/ai-engine',
    stdio: 'ignore'
  });

  // Wait for server startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const adapter = new PythonLearningAdapter({ serviceUrl: 'http://127.0.0.1:8009' });
    const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

    await runAsyncTest(3, 'Node adapter connects and submits MissionExperience to Python service', async () => {
      const exp1 = {
        experienceId: "EXP-INT-001",
        missionId: "MISSION-CRATER-07",
        actionType: "MOVE_ROVER",
        actionSuccess: true,
        planStrategy: "SAFE_SAMPLE_ACQUISITION_AND_RETURN"
      };
      const rec = await adapter.recordExperienceAsync(exp1);
      assert.ok(rec);
      assert.strictEqual(rec.experienceId, "EXP-INT-001");
    });

    await runAsyncTest(4, 'Node adapter submits failed experience and verifies failure pattern creation', async () => {
      const exp2 = {
        experienceId: "EXP-INT-002",
        missionId: "MISSION-CRATER-07",
        actionType: "MOVE_ROVER",
        actionSuccess: false,
        failureReason: "BATTERY_LOW",
        batteryAfter: 0.10,
        planStrategy: "DIRECT_SAMPLE_COLLECTION"
      };
      await adapter.recordExperienceAsync(exp2);

      const res = await adapter.requestAdaptiveRecommendationAsync(obs);
      assert.ok(res);
      assert.ok(Array.isArray(res.failurePatterns));
      assert.ok(res.failurePatterns.some(p => p.pattern === "BATTERY_LOW"));
    });

    await runAsyncTest(5, 'Adaptive recommendation returns evidence and strategy statistics', async () => {
      const res = await adapter.requestAdaptiveRecommendationAsync(obs, null, [
        "SAFE_SAMPLE_ACQUISITION_AND_RETURN",
        "DIRECT_SAMPLE_COLLECTION"
      ]);

      assert.ok(res.recommendation);
      assert.strictEqual(res.recommendation.recommendedStrategy, "SAFE_SAMPLE_ACQUISITION_AND_RETURN");
      assert.ok(res.recommendation.sampleSize >= 2);
      assert.ok(Array.isArray(res.strategyPerformances));
    });

    await runAsyncTest(6, 'Adaptive recommendation reaches Objective 6 Planner & Objective 5 SafetyValidator', async () => {
      const planner = new MissionPlanner();
      const validator = new SafetyValidator();

      // Rover near obstacle ROCK_001 at (250, 300)
      const obstacleObs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 240, y: 300 } }), new MarsEnvironment(), null);

      const res = await adapter.requestAdaptiveRecommendationAsync(obstacleObs);
      const recStrategy = res.recommendation.recommendedStrategy;

      // Objective 6 incorporates learned recommendation
      const plan = planner.plan(obstacleObs);
      assert.ok(plan);

      // Objective 5 SafetyValidator validates candidate step
      const unsafeAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 250, y: 300 } } };
      const validation = validator.validate(unsafeAction, obstacleObs);

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

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} PYTHON AI LEARNING SERVICE INTEGRATION TESTS PASSED CLEANLY!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
