import assert from 'node:assert';
import { spawn, execSync } from 'node:child_process';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  PythonDigitalTwinAdapter,
  SafetyValidator,
  ActionType
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Python Digital Twin Service & Safety Boundary Integration Test...\n');

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
  // 1. Instantiation & Offline Fallback
  runTest(1, 'PythonDigitalTwinAdapter instantiates with default URL', () => {
    const adapter = new PythonDigitalTwinAdapter();
    assert.ok(adapter);
    assert.strictEqual(adapter.serviceUrl, 'http://localhost:8010');
  });

  await runAsyncTest(2, 'PythonDigitalTwinAdapter handles offline service gracefully with fallback', async () => {
    const adapter = new PythonDigitalTwinAdapter({ serviceUrl: 'http://localhost:9999' });
    const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

    const res = await adapter.startEpisodeAsync('EP-OFFLINE', 'SCEN-OFFLINE', 42, obs);
    assert.ok(res);
    assert.strictEqual(res.offlineFallback, true);
  });

  // 2. Launch live Python Digital Twin service on port 8010 for integration tests
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8010'], {
    cwd: 'services/digital-twin',
    stdio: 'ignore'
  });

  // Wait for server startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const adapter = new PythonDigitalTwinAdapter({ serviceUrl: 'http://127.0.0.1:8010' });
    const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

    await runAsyncTest(3, 'Node adapter connects and starts Digital Twin episode', async () => {
      const rec = await adapter.startEpisodeAsync('EP-INT-001', 'CRATER-07-NOMINAL-001', 42, obs);
      assert.ok(rec);
      assert.strictEqual(rec.episode_id, 'EP-INT-001');
    });

    await runAsyncTest(4, 'Node adapter steps episode and advances simulation clock', async () => {
      const stepRes = await adapter.stepEpisodeAsync('EP-INT-001', 1.0, obs);
      assert.ok(stepRes);
      assert.strictEqual(stepRes.simulationTime, 1.0);
    });

    await runAsyncTest(5, 'Digital Twin handles checkpoint and restore over HTTP REST', async () => {
      const cpRes = await adapter.checkpointEpisodeAsync('EP-INT-001', 'CP-INT-1');
      assert.ok(cpRes);

      const restoreRes = await adapter.restoreEpisodeAsync('EP-INT-001', 'CP-INT-1');
      assert.ok(restoreRes);
      assert.strictEqual(restoreRes.simulationTime, 1.0);
    });

    await runAsyncTest(6, 'Digital Twin executes batch simulation run', async () => {
      const batchRes = await adapter.runBatchAsync('INT-BATCH', 5, 0, 5);
      assert.ok(batchRes);
      assert.strictEqual(batchRes.totalEpisodes, 5);
      assert.strictEqual(batchRes.totalTelemetryRows, 25);
    });

    await runAsyncTest(7, 'Physical safety authority remains in Objective 5 SafetyValidator', async () => {
      const validator = new SafetyValidator();

      // Digital Twin recommendation cannot bypass SafetyValidator
      const obstacleObs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 240, y: 300 } }), new MarsEnvironment(), null);
      const unsafeAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 250, y: 300 } } };

      const validation = validator.validate(unsafeAction, obstacleObs);
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

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} PYTHON DIGITAL TWIN SERVICE INTEGRATION TESTS PASSED CLEANLY!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
